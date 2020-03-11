
Words = require('./Words')
Grammar = require('./Grammar')


class Expression {
    constructor(parent, content, type) {
        this.parent = parent
        this.content = content
        this.accessModifiers = []
        this.type = type
    }
    toString() { return '(' + this.content.map( elem => elem.toString() ).join(' ') + ')' }
}

class Node {
    constructor(content, type='none') {
        this.content = content
        this.type = type
    }
    toString() { return this.content }
}




class Parser {
    constructor(wordLine) {
        this.wordLine = wordLine
        this.root = new Expression(null, [], 'root-expression')
        this.currentExpression = this.root
        this.stateStack = ['in-root']
        this.currentWord = null     // Set in the for in parse
    }

    exit(message) { console.log('Error: ' + message);  throw 'Exiting' }
    error() { console.log(`Error in state ${this.getCurrentState} at word ${this.word.string} with type ${this.word.type}`)}
    push(what) { this.currentExpression.content.push(what) }
    getCurrentState() { return this.stateStack[this.stateStack.length - 1] }
    setState(newState) { this.stateStack[this.stateStack.length - 1] = newState }

    redirectToState(toState) {
        this.setState(toState)
        this[this.getStateFunction(toState)]()
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

    wrapOver (newExpressionType, nextState) {   // Takes the current expression's content and modifiers, creates a new expression and puts those in the new expression; also changes state
        let accessModifiers = this.currentExpression.accessModifiers
        let content = this.currentExpression.content
        this.currentExpression.accessModifiers = []
        this.currentExpression.content = []
        let newExpression = new Expression(this.currentExpression, content, newExpressionType)
        newExpression.accessModifiers = accessModifiers
        this.currentExpression.content = [newExpression]
        this.currentExpression = newExpression
        this.stateStack.push(nextState)
    }

    getStateFunction(stateName) {   // Each state is mapped to a function (don't ask me why they are not just called the same)
        let stateFunctions = {
            'no-state'  : 'noState',
            'in-root'   : 'inRoot',
            'reading-modifiers' : 'readingModifiers',
            'reading-type'  : 'readingType',
            'expecting-generic' : 'expectingGeneric',
            'reading-generic-inner' : 'readingGenericInner',
            'reading-var-name' : 'readingVarName'
        }
        return stateFunctions[stateName]
    }

    parse () {
        for (let word of this.wordLine.words) {
            this.currentWord = word
            let state = this.getCurrentState()
            console.log(`At state`)
            console.log(state)
            let functionName = this.getStateFunction(state)
            if (this[functionName] != null) {
                this[functionName]()
            } else {
                this.exit('State ' + state + ' not handled.')
            }
        }
        return this.root
    }

    /* States */

    noState () { this.exit(`No state for word ${string} of type ${this.currentWord.type}`) }

    inRoot () {
        switch (this.currentWord.type) {
            case 'MODIFIER':
                this.redirectToState('reading-modifiers')
                break
            default: this.error()
        }
    }

    readingModifiers () {
        switch (this.currentWord.type) {
            case 'MODIFIER':
                this.currentExpression.accessModifiers.push(this.currentWord.string)
                break
            case 'ATOM':
                this.redirectToState('reading-type')
                break
            default: this.error()
        }
    }

    readingType () {
        switch (this.currentWord.type) {
            case 'ATOM':
                this.push(this.currentWord.string)
                this.setState('expecting-generic')
                break
            default: this.error()
        }
    }

    expectingGeneric () {
        switch (this.currentWord.type) {
            case '<':
                this.branchOut('generic-inner', 'reading-generic-inner')
                break
            case 'ATOM':
                this.redirectToState('reading-var-name')
                break
            default: this.error()
        }
    }

    readingGenericInner () {
        switch (this.currentWord.type) {
            case '>':
                this.brateIn()
                break
            case 'ATOM':
                this.push(this.currentWord.string)
                break
            default: this.error()
        }
    }

    readingVarName () {
        switch (this.currentWord.type) {
            case 'ATOM':
                this.push(this.currentWord.string)
                this.setState('no-state')
                break
            default: this.error()            
        }
    }

}


module.exports = { Parser : Parser }
__requirer['Parser'] = module.exports
__requirer['./Parser'] = module.exports

