

import { Word, WordLine } from './Words.js'
import { isSpace } from './Utils.js'

function splitLines(lines, operators, separators){
    return (new Lexer(lines, operators, separators)).parse()
}

function isSubstringAt(sub, str, start=0){
    return str.startsWith(sub, start)
}

function isAnySubstringAt(subs, str, start){
    for (let i = 0; i < subs.length; i++) {
        let sub = subs[i]
        let result = isSubstringAt(sub, str, start)
        if (result == true) {
            return i
        }
    }
    return null
}

function isOperator(text, position, operators) {
    let result = isAnySubstringAt(operators, text, position)
    if (result != null) {
        return operators[result]
    }
    return null
}

// Checks if text[position:] starts with any of the possible string separators
// Returns the separators as a string, or None
function startsString(text, position, separators) {
    let sepsStart = separators.map( pair => pair[0] )
    let result = isAnySubstringAt(sepsStart, text, position)    // All 'operators' that start a string
    if (result != null) {
        return separators[result]
    }
    return null
}


// Checks if text[position:] is equal to the given separator
function endsString(text, position, separator) {
    let result = isSubstringAt(separator, text, position)
    if (result != null) return result
    return null
}

// Takes a string and counts how many spaces it has in front of it
function findIndentation(text) {
    let indentation = 0
    for (let char of text) {
        if (char == '\t') indentation += 4
        else if (char == ' ' ) indentation += 1
        else break
    }
    return indentation
}

class Lexer {
    constructor (lines, operators, separators) {
        this.lines = lines
        this.operators = operators
        this.separators = separators

        this.outputLines = []
        this.currentLineIndex = 0
        this.currentCharIndex = -1
        
        this.currentOutputLine = []
        this.currentLineIndentation = 0

        this.theOperator = null
        this.theSeparatorPair = null

        this.state = 'blanks'
    }

    getCurrentLine() { return this.lines[this.currentLineIndex] }
    getCurrentChar() { return this.lines[this.currentLineIndex][this.currentCharIndex] }

    pushWord(start, end) {
        let theLine = this.getCurrentLine()
        let theWord = new Word(theLine.substring(start, end))
        this.currentOutputLine.push(theWord)
    }

    isAtAnOperator() {
        let theLine = this.getCurrentLine()
        this.theOperator = isOperator(theLine, this.currentCharIndex, this.operators)
        return this.theOperator != null
    }

    isAtStringStart() {
        let theLine = this.getCurrentLine()
        this.theSeparatorPair = startsString(theLine, this.currentCharIndex, this.separators)
        return this.theSeparatorPair != null
    }

    isAtStringEnd() {
        return endsString(this.getCurrentLine(), this.currentCharIndex, this.theSeparatorPair[1])
    }

    splitLine(startingState='blanks') {
        this.currentOutputLine = []
        let line = this.getCurrentLine()
        this.state = startingState
        let indentation = findIndentation(line)
        this.currentCharIndex = indentation

        while (this.currentCharIndex < line.length) {
            switch (this.state) {
                case 'blanks'   : this.stepBlank(); break
                case 'words'    : this.stepWord(); break
                case 'string'   : this.stepString(); break
                default: throw `Lexer Error: state ${this.state} not handled!`
            }
            this.currentCharIndex ++
        }

        if (this.state == 'words')  this.pushWord(this.start, line.length)
        if (this.state == 'string') this.pushWord(this.start, line.length)
        this.currentLineIndentation = indentation
    }

    stepBlank() {
        if (isSpace(this.getCurrentChar())) {
            // pass
        } else if (this.isAtAnOperator()) {
            let endPos = this.currentCharIndex + this.theOperator.length
            this.pushWord(this.currentCharIndex, endPos)
            this.currentCharIndex += this.theOperator.length - 1
        } else if (this.isAtStringStart()) {
            this.start = this.currentCharIndex
            this.state = 'string'
        } else {
            this.start = this.currentCharIndex
            this.state = 'words'
        }
    }

    stepWord() {
        if (isSpace(this.getCurrentChar())) {
            this.pushWord(this.start, this.currentCharIndex)
            this.state = 'blanks'
        } else if (this.isAtAnOperator()) {
            this.pushWord(this.start, this.currentCharIndex)
            let endPos = this.currentCharIndex + this.theOperator.length
            this.pushWord(this.currentCharIndex, endPos)
            this.state = 'blanks'
            this.currentCharIndex += this.theOperator.length - 1
        } else if (this.isAtStringStart()) {
            this.start = this.currentCharIndex
            this.state = 'string'
        } else {
            // pass
        }
    }

    stepString() {
        if (this.isAtStringEnd()) {
            this.pushWord(this.start, this.currentCharIndex + this.theSeparatorPair[1].length)
            this.state = 'blanks'
            this.currentCharIndex += this.theSeparatorPair[1].length - 1
        }
    }

    parse() {
        while (this.currentLineIndex < this.lines.length) {
            this.splitLine()
            let words = this.currentOutputLine
            let indentation = this.currentLineIndentation
            this.outputLines.push(new WordLine(indentation, words))
            this.currentLineIndex += 1
        }
        return this.outputLines
    }

    print() {
        for(let line of this.outputLines) {
            console.log(line.toString())
        }
    }

}


export { splitLines }