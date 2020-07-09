
import * as Grammar from './Grammar.mjs'
import { Word } from './Words.mjs'
import { operatorTypeMapping } from './Grammar.mjs'

class Chode {
    next        = {}
    endsHere    = false
    type        = null
    
    hasNext(char) { return char in this.next }        // Fastest method at runtime
    getNext(char) { return this.next[char] }
    makeNext(char) { this.next[char] = new Chode() }
    makeNextIfNotExist(char) {
        if (this.hasNext(char)) return
        else this.makeNext(char)
    }

}

function setupMapping(keywordsMapping, operatorsMapping) {
    let allMapping = {...keywordsMapping, ...operatorTypeMapping}
    let keywordsList = Object.keys(allMapping)
    let root = new Chode()
    for (let keyword of keywordsList) {
        let charLink = root
        for (let char of keyword) {
            charLink.makeNextIfNotExist(char)
            charLink = charLink.getNext(char)
        }
        charLink.endsHere = true
        charLink.type = allMapping[keyword]
    }
    return root
}


const isWhitespace  = char => char == ' ' || char == '\t'
const isLetter      = char => 'qwertyuiopasdfghjklzxcvbnmQWERTYUIOPASDFGHJKLZXCVBNM_'.includes(char)
const isDigit       = char => '0123456789'.includes(char)

let allOperatorCharacters = []
function setupOperatorCharacters() {
    for (let operator of Grammar.operators) {
        for (let char of operator) {
            if (allOperatorCharacters.includes(char)) continue
            else allOperatorCharacters.push(char)
        }
    }
}

setupOperatorCharacters()
const isOperatorCharacter = char => allOperatorCharacters.includes(char)

function charType(char) {
    if (isWhitespace(char))         return 'WHITESPACE'
    if (isLetter(char))             return 'LETTER'
    if (isDigit(char))              return 'DIGIT'
    if (isOperatorCharacter(char))  return 'OPERATOR'
    return null
}





class LexerStates {

    currentIndentation = 0
    
    '$-indentation' = {
        'WHITESPACE':   () => {
            if (this.char == ' ') this.currentIndentation ++
            else if (this.char == '\t') this.currentIndentation += 4
            else throw `What the hell happened here?`
        },
        'default':      () => this.redirectToState('$-spaces')
    }

    '$-spaces' = {
        'WHITESPACE':       () => null,
        'LETTER':           () => {
            this.resetWordLinkAndAdvance()
            this.addChar()
            this.setState('$-words')
        },
        'OPERATOR':         () => {
            this.resetWordLinkAndAdvance()
            this.addChar()
            this.setState('$-operators')
        },
        'default':          () => this.error()
    }

    '$-words' = {
        'WHITESPACE':       () => {
            this.awayWord()
            this.setState('$-spaces')
        },
        'LETTER':           () => {
            this.advanceWordLinkSmart()
            this.addChar()
        },
        'OPERATOR':         () => {
            this.awayWord()
            this.resetWordLinkAndAdvance()
            this.addChar()
            this.setState('$-operators')
        },
        'default':          () => this.error()
    }

    '$-operators' = {
        'WHITESPACE':       () => {
            this.awayOperator()
            this.setState('$-spaces')
        },
        'LETTER':           () => {
            this.tryPushOperatorSmartAndClear()
            this.resetWordLinkAndAdvance()
            this.addChar()
        }
    }

}






class Lexer extends LexerStates {

    currentString       = ''
    tokens              = []
    currentStateName    = '$-reading-indentation'
    char                = null

    charIndex           = 0

    mappingRoot         = setupMapping(Grammar.keywordTypeMapping, Grammar.operatorTypeMapping)
    currentWordLink     = null

    skipNextCharInString = false

    constructor(keywords, operators) {
        this.keywordsRoot   = keywords
        this.operatorsRoot  = operators
    }

    error(message) { throw `An error occured in the Lexer. Message: ${message}`; }
    resetWordLinkAndAdvance() {
        this.currentWordLink = this.mappingRoot
        this.advanceWordLinkSmart()
    }
    addChar() { this.currentString += this.char}
    advanceWordLinkSmart() {
        if (this.currentWordLink == null) return
        if (this.currentWordLink.hasNext(this.char)) {
            this.currentWordLink = this.currentWordLink.getNext(this.char)
        } else {
            this.currentWordLink = null
        }
    }
    awayWord() {
        let word = new Word(this.currentString)
        if (this.mightBeKeyword()) {
            if (this.isTerminal()) {
                word.type = this.currentWordLink.type
            } else {
                word.type = 'ATOM'
            }
        } else {
            word.type = 'ATOM'
        }
        this.tokens.push(word)
        this.clearString()
    }
    awayOperator() {
        let word = new Word(this.currentString)
        if (!this.mightBeKeyword()) throw `Keyword does not continue into any operator: ${this.currentString}`
        if (this.isTerminal()) {
            word.type = this.currentWordLink.type
        } else {
            throw `Syntax error: operator "${this.currentString}" is not valid`
        }
        this.tokens.push(word)
        this.clearString()
    }
    clearString() { this.currentString = '' }
    hasNextNode() { return this.currentWordLink.hasNext(this.char) }
    mightBeKeyword() { return this.currentWordLink != null }    // It's null if it exited the mapping because it was not a keyword
    isTerminal() { return this.currentWordLink.endsHere }
    setState(s) { this.currentStateName = s}
    redirectToState(s) {
        this.setState(s)
        this.doState(s)
    }
    doState(stateName) {
        if (this[stateName] == null) 
            throw `No state ${stateName} found.`
        return this[stateName](this.char)
    }

    lex(code) {
        for (this.charIndex = 0; this.charIndex < code.length; this.charIndex ++) {
            this.getNextChar()
            this.doState(this.currentStateName)
        }
    }
}