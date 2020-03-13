
import * as Words from './Words.js'
import * as Grammar from './Grammar.js'
import { Expression } from './Expressions.js'
import { dashCaseToCamelCase } from './Utils.js'

class Parser {
    constructor(givenExpression) {
        this.nodes = givenExpression.content
        this.root = new Expression(givenExpression.parent, [], givenExpression.type)  // WARNING: Make sure the parent is ok!
        this.currentExpression = this.root
        this.stateStack = ['in-root']
        this.currentNode = null     // Set in the for in parse
    }

    exit(message) { console.log('Error: ' + message);  throw 'Exiting' }
    error() { throw `Error in state ${this.getCurrentState()} at node ${this.currentNode.content} with type ${this.currentNode.type}` }
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

    wrapOver ({wrapperExpressionType, newExpressionType, nextState}) {   // Takes the current expression's content and modifiers, creates a new expression and puts those in the new expression; also changes state
        if (wrapperExpressionType != null)
            this.currentExpression.type = wrapperExpressionType
        let accessModifiers = this.currentExpression.accessModifiers
        let content = this.currentExpression.content
        this.currentExpression.accessModifiers = []
        this.currentExpression.content = []
        let newExpression = new Expression(this.currentExpression, content, newExpressionType)
        newExpression.accessModifiers = accessModifiers
        this.currentExpression.content = [newExpression]
        this.currentExpression = newExpression
        this.stateStack.push(nextState)
        console.log('this.currentExpression')
        console.log(this.currentExpression)
    }

    getStateFunction(stateName) {   // Each state is mapped to a function (don't ask me why they are not just called the same)
        return dashCaseToCamelCase(stateName)
    }

    parse () {
        for (let node of this.nodes) {
            this.currentNode = node
            let state = this.getCurrentState()
            console.log(`Node: ${node.content}    State ${state}`)
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

    noState() { this.error() }

    inRoot() {
        switch (this.currentNode.type) {
            case 'MODIFIER':
                this.redirectToState('reading-modifiers')
                break
            default: this.error()
        }
    }

    readingModifiers() {
        switch (this.currentNode.type) {
            case 'MODIFIER':
                this.currentExpression.accessModifiers.push(this.currentNode.content)
                break
            case 'ATOM':
                this.redirectToState('reading-type')
                break
            case 'CLASS':
                this.redirectToState('reading-class-declaration')
                break
            case 'FUNC':
                this.redirectToState('reading-function-declaration')
            default: this.error()
        }
    }

    readingFunctionDeclaration() {
        switch (this.currentNode.type) {
            case 'FUNC':
                this.branchOut('function-declaration', 'expecting-function-generic')
                break
            default: this.error()
        }
    }

    readingClassDeclaration() {
        switch (this.currentNode.type) {
            case 'CLASS':
                this.push(this.currentNode.content)
                this.setState('expecting-class-generic')
                break
            default: this.error()
        }
    }

    expectingFunctionGeneric() {
        switch (this.currentNode.type) {
            case '<':
                this.branchOut('function-generic', 'reading-generic-inner')
                break
            case 'ATOM':
                this.redirectToState('reading-function-name')
                break
            default: this.error()
        }
    }

    expectingClassGeneric() {
        switch(this.currentNode.type) {
            case '<':
                this.branchOut('class-generic', 'reading-generic-inner')
                break
            case 'ATOM':
                this.redirectToState('reading-class-name')
                break
            default: this.error()
        }
    }

    readingType() {
        switch (this.currentNode.type) {
            case 'ATOM':
                this.push(this.currentNode.content)
                this.setState('expecting-generic')
                break
            default: this.error()
        }
    }

    expectingGeneric() {
        switch (this.currentNode.type) {
            case '<':
                this.branchOut('generic-expression', 'reading-generic-inner')
                break
            case 'ATOM':
                this.redirectToState('reading-var-name')
                break
            default: this.error()
        }
    }

    readingGenericInner() {
        switch (this.currentNode.type) {
            case '>':
                this.brateIn()
                break
            case 'ATOM':
                this.push(this.currentNode.content)
                break
            default: this.error()
        }
    }

    readingVarName() {
        switch (this.currentNode.type) {
            case 'ATOM':
                this.push(this.currentNode.content)
                this.setState('expecting-attribution-equals')
                break
            default: this.error()            
        }
    }

    readingClassName() {
        switch (this.currentNode.type) {
            case 'ATOM':
                this.push(this.currentNode.content)
                this.setState('no-state')
                break
            default: this.error()            
        }
    }

    readingFunctionName() {
        switch (this.currentNode.type) {
            case 'ATOM':
                this.push(this.currentNode.content)
                this.setState('no-state')
                break
            default: this.error()            
        }
    }

    expectingAttributionEquals() {
        switch (this.currentNode.type) {
            case '=':
                this.wrapOver({
                    wrapperExpressionType: 'attribution',
                    newExpressionType: this.currentExpression.type,
                    nextState: 'none'   // No need for a new state
                })
                this.brateIn()
                this.branchOut('attribution-right', 'reading-attribution-right')
                break
            default:
                this.error()
        }
    }

    readingAttributionRight() {
        switch (this.currentNode.type) {
            default: this.push(this.currentNode.content)
        }
    }

}


function parseScope(baseScope) {
    if (baseScope.expression != null)
        baseScope.expression = new Parser(baseScope.expression).parse()
    for (let scope of baseScope.content) {
        parseScope(scope)
    }
}


export { Parser, parseScope }