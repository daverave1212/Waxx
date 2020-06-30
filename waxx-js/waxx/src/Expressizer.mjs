

import { Expression, Node } from './Expressions.mjs'
import { dashCaseToCamelCase } from './Utils.mjs'

class ExpressizerStates {

    pipeLevel = 0
    tupleTypeStack = []

    getCurrentTupleType() { return this.tupleTypeStack[this.tupleTypeStack.length - 1] }
    brateInAllPipes() {
        while (this.pipeLevel != 0) {
            this.brateIn()
            this.pipeLevel --
        }
    }

    $root = {
        '(':        () => this.branchOut('PAREXPRESSION', '$-parenthesis-expression'),
        '|':        () => {
            this.branchOut('PAREXPRESSION', '$-parenthesis-expression')
            this.pipeLevel ++
        },
        ')':        () => this.error('No parenthesis to close'),
        ']':        () => this.error('No bracket to close.'),
        '[':        () => this.branchOut('INDEXEXPRESSION', '$-parenthesis-expression'),
        '{':        () => this.branchOut('GENERICEXPRESSION', '$-parenthesis-expression'),
        '}':        () => this.error('No curly brace to close.'),
        'default':  () => this.push(new Node(this.currentWord.string, this.currentWord.type))
    }

    $parenthesisExpression = {
        'ATOM':     () => this.push(new Node(this.currentWord.string, this.currentWord.type)),
        '(':        () => this.branchOut('PAREXPRESSION', '$-parenthesis-expression'),
        '|':        () => {
            this.branchOut('PAREXPRESSION', '$-parenthesis-expression')
            this.pipeLevel ++
        },
        ')':        () => {
            this.brateIn()
            this.brateInAllPipes()
        },
        '[':        () => this.branchOut('INDEXEXPRESSION', '$-parenthesis-expression'),
        ']':        () => {
            this.brateIn()
            this.brateInAllPipes()
        },
        '{':        () => this.branchOut('GENERICEXPRESSION', '$-parenthesis-expression'),
        '}':        () => {
            this.brateIn()
            this.brateInAllPipes()
        },
        ',':        () => {
            this.currentExpression.isTuple = true
            this.tupleTypeStack.push(this.currentExpression.type)
            this.wrapOver({
                newExpressionType: 'EXPRESSION',
                nextState: '$-tuple-expression'
            })
            this.brateIn()
            this.branchOut('EXPRESSION', '$-tuple-expression')
        },
        'default':  () => this.push(new Node(this.currentWord.string, this.currentWord.type))
    }

    $tupleExpression = {
        'ATOM':     () => this.push(new Node(this.currentWord.string, this.currentWord.type)),
        '(':        () => this.branchOut('PAREXPRESSION', '$-parenthesis-expression'),
        '|':        () => {
            this.branchOut('PAREXPRESSION', '$-parenthesis-expression')
            this.pipeLevel ++
        },
        ')':        () => {
            this.brateInAllPipes()
            if (this.getCurrentTupleType() == 'PAREXPRESSION') {
                this.brateIn()
                this.brateIn()
                this.tupleTypeStack.pop()
            } else {
                this.error('Wrong parenthesis closing')
            }
        },
        '[':        () => this.branchOut('INDEXEXPRESSION', '$-parenthesis-expression'),
        ']':        () => {
            this.brateInAllPipes()
            if (this.getCurrentTupleType() == 'INDEXEXPRESSION') {
                this.brateIn()
                this.brateIn()
                this.tupleTypeStack.pop()
            } else {
                this.error('Wrong square bracket closing')
            }
        },
        '{':        () => this.branchOut('GENERICEXPRESSION', '$-parenthesis-expression'),
        '}':        () => {
            this.brateInAllPipes()
            if (this.getCurrentTupleType() == 'GENERICEXPRESSION') {
                this.brateIn()
                this.brateIn()
                this.tupleTypeStack.pop()
            } else {
                this.error('Wrong curly brace closing')
            }
        },
        ',':        () => {
            this.brateIn()
            this.branchOut('EXPRESSION', '$-tuple-expression')
        },
        'default':  () => this.push(new Node(this.currentWord.string, this.currentWord.type))
    }

}


class Expressizer extends ExpressizerStates {
    constructor(wordLine, startAt='$-root') {
        super()
        this.wordLine = wordLine
        this.root = new Expression(null, [], 'EXPRESSION')  // WARNING: Make sure the parent is ok!
        this.currentExpression = this.root
        this.stateStack = [startAt]
        this.currentWord = null
    }

    getCurrentState() { return this.stateStack[this.stateStack.length - 1] }
    exit(message) { console.log('Error: ' + message);  throw 'Exiting' }
    error(message) { throw `Error in state ${this.getCurrentState()} at node "${this.currentWord.string}" with type ${this.currentWord.type}; State history: ${this._stateHistory}; ${message}` }
    push(what) { this.currentExpression.content.push(what) }
    setState(newState) { this.stateStack[this.stateStack.length - 1] = newState; this._stateHistory.push(newState) }

    redirectToState(toState) {
        this.setState(toState)
        this.doState(this.getStateObjectName(toState), this.currentNode.type)
    }

    branchOut (newExpressionType, newState=null) {  // Goes up 1 level and optionally 1 state
        let newExpression = new Expression(this.currentExpression, [], newExpressionType)
        this.push(newExpression)
        this.currentExpression = newExpression
        if (newState != null) this.stateStack.push(newState)
    }

    brateIn () {    // Goes back 1 state and back 1 level
        this.stateStack.pop()
        this.currentExpression = this.currentExpression.parent
    }

    _wrapOver ({wrapperExpressionType, newExpressionType, nextState}) {  // Assuming it has a parent
        let parentExpression = this.currentExpression.parent
        if (parentExpression == null) throw 'Tuples at base level in a code line are not supported yet. Please wrap them in parentheses for now.'
        let currentExpressionIndexInParent = parentExpression.content.findIndex(elem => elem == this.currentExpression)
        let wrapperExpression = new Expression(
            parentExpression,
            [this.currentExpression],
            wrapperExpressionType
        )
        parentExpression.content[currentExpressionIndexInParent] = wrapperExpression
        this.currentExpression.parent   = wrapperExpression
        this.currentExpression.type     = newExpressionType
        
        //this.currentExpression          = wrapperExpression

        this.stateStack.push(nextState)
    }

    __wrapOver ({wrapperExpressionType, newExpressionType, nextState}) {
        let newExpression = new Expression(
            this.currentExpression,
            this.currentExpression.content,
            newExpressionType
        )
        newExpression.accessModifiers = this.currentExpression.accessModifiers

        this.currentExpression.content          = [newExpression]
        this.currentExpression.accessModifiers  = []
        this.currentExpression.type             = wrapperExpressionType

        this.stateStack.push(nextState)
    }

    wrapOver ({newExpressionType, nextState}) {   // Takes the current expression's content and modifiers, creates a new expression and puts those in the new expression; also changes state
        let newExpression = new Expression(
            this.currentExpression,
            this.currentExpression.content,
            newExpressionType
        )
        newExpression.accessModifiers = this.currentExpression.accessModifiers
        
        this.currentExpression.accessModifiers  = []
        this.currentExpression.content          = [newExpression]

        this.currentExpression = newExpression
        this.stateStack.push(nextState)
    }

    getStateObjectName(stateName) {
        return '$' + dashCaseToCamelCase(stateName.substring(2))
    } // Each state is mapped to a function (don't ask me why they are not just called the same)

    doState(functionName, nodeType) {
        //console.log(`State ${functionName} for ${nodeType}`)
        if (this[functionName] != null) {
            if (this[functionName][nodeType] != null) {
                this[functionName][nodeType]()
            } else if (this[functionName]['default'] != null) {
                this[functionName]['default']()
            } else {
                this.error()
            }                
        } else {
            this.exit('State ' + functionName + ' not handled.')
        }
    }

    parse () {
        for (let word of this.wordLine.words) {
            this.currentWord = word
            let state = this.getCurrentState()
            let functionName = this.getStateObjectName(state)
            this.doState(functionName, word.type)
        }
        console.log('')
        return this.root
    }

}




export { Expressizer }




































function expressizeLineByParentheses(wordLine) {
    return {expression: new Expressizer(wordLine).parse(), indentation: wordLine.indentation}
}

function expressizeWordLinesByParentheses(wordLines) {
    return wordLines.map( wordLine => expressizeLineByParentheses(wordLine) )
}

export { expressizeWordLinesByParentheses }

/*
function wordsToExpression(words) {
    let expression = new Expression(null, [], 'EXPRESSION')
    for (let i = 0; i<words.length; i++) {
        let word = words[i]
        if (word.hasPair()) {
            let pairWord = word.pairWord
            let slicedWords = words.slice(i+1, word.pairWord)
            let newExpression = wordsToExpression(slicedWords)
            expression.content.push(newExpression)
            i = pairWord
        } else {
            expression.content.push(new Node(word.string, word.type))
        }
    }
    return expression
}


*/


