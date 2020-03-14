
import * as Words from './Words.js'
import * as Grammar from './Grammar.js'
import { Expression } from './Expressions.js'
import { dashCaseToCamelCase } from './Utils.js'

class Parser {
    constructor(givenExpression, startAt='in-root') {
        this.nodes = givenExpression.content
        this.root = new Expression(givenExpression.parent, [], givenExpression.type)  // WARNING: Make sure the parent is ok!
        this.currentExpression = this.root
        this.stateStack = [startAt]
        this.currentNode = null     // Set in the for in parse

        this._stateHistory = [startAt]
    }

    exit(message) { console.log('Error: ' + message);  throw 'Exiting' }
    error() { throw `Error in state ${this.getCurrentState()} at node "${this.currentNode.content}" with type ${this.currentNode.type}; State history: ${this._stateHistory}` }
    push(what) { this.currentExpression.content.push(what) }
    getCurrentState() { return this.stateStack[this.stateStack.length - 1] }
    setState(newState) { this.stateStack[this.stateStack.length - 1] = newState; this._stateHistory.push(newState) }

    redirectToState(toState) {
        this.setState(toState)
        this [this.getStateObjectName(toState)] [this.currentNode.type] ()
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

    getStateObjectName(stateName) {   // Each state is mapped to a function (don't ask me why they are not just called the same)
        return dashCaseToCamelCase(stateName)
    }

    parse () {
        for (let node of this.nodes) {
            this.currentNode = node
            let state = this.getCurrentState()
            console.log(`Node: '${node.content}'\tType: ${node.type}\tState ${state}`)
            let functionName = this.getStateObjectName(state)
            if (this[functionName] != null) {
                if (this[functionName][node.type] != null) {
                    this[functionName][node.type]()
                } else if (this[functionName]['default'] != null) {
                    this[functionName]['default']()
                } else {
                    this.error()
                }                
            } else {
                this.exit('State ' + state + ' not handled.')
            }
        }
        console.log('')
        console.log('')
        return this.root
    }

    /* States */

    noState = {}

    inRoot = {
        'MODIFIER': () => this.redirectToState('reading-modifiers')
    }

    readingModifiers = {
        'MODIFIER': () => this.currentExpression.accessModifiers.push(this.currentNode.content),
        'ATOM':     () => this.redirectToState('reading-type'),
        'CLASS':    () => this.redirectToState('reading-class-declaration'),
        'FUNC':     () => this.redirectToState('reading-function-declaration')
    }

    readingFunctionDeclaration = {
        'FUNC':     () => {
            this.currentExpression.type = 'function-declaration'
            this.setState('expecting-function-generic')
        }
    }

    readingClassDeclaration = {
        'CLASS':    () => {
            this.push(this.currentNode.content)
            this.setState('expecting-class-generic')
        }
    }

    expectingFunctionGeneric = {
        '<':        () => this.branchOut('function-generic', 'reading-generic-inner'),
        'ATOM':     () => this.redirectToState('reading-function-name')
    }

    expectingClassGeneric = {
        '<':        () => this.branchOut('class-generic', 'reading-generic-inner'),
        'ATOM':     () => this.redirectToState('reading-class-name')
    }

    readingType = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('expecting-generic')
        }
    }

    expectingGeneric = {
        '<':        () => this.branchOut('generic-expression', 'reading-generic-inner'),
        'ATOM':     () => this.redirectToState('reading-var-name')
    }

    readingGenericInner = {
        '>':        () => this.brateIn(),
        'ATOM':     () => this.push(this.currentNode.content)
    }

    readingVarName = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('expecting-attribution-equals')
        }
    }

    readingClassName = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('no-state')
        }
    }

    readingFunctionName = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('expecting-function-parameters')
        }
    }

    expectingFunctionParameters = {
        'EXPRESSION':   () => {
            this.push(new Parser(this.currentNode, 'reading-normal-expression').parse())
            this.setState('expecting-colon')
        }
    }

    expectingColon = {
        'COLON':    () => this.setState('no-state')
    }

    expectingAttributionEquals = {
        '=':        () => {
            this.wrapOver({
                wrapperExpressionType: 'attribution',
                newExpressionType: this.currentExpression.type,
                nextState: 'none'   // No need for a new state
            })
            this.brateIn()
            this.branchOut('attribution-right', 'reading-normal-expression')
        }
    }

    readingNormalExpression = {
        'default':     () => {
            this.push(this.currentNode.content)
        }
    }

    readingNormalExpression() {
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