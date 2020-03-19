
import ParserStates from './ParserStates.js'
import * as Words from './Words.js'
import * as Grammar from './Grammar.js'
import { Expression } from './Expressions.js'
import { dashCaseToCamelCase } from './Utils.js'

class Parser extends ParserStates {
    constructor(givenExpression, startAt='reading-root') {
        super()
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

    getStateObjectName(stateName) { return dashCaseToCamelCase(stateName) } // Each state is mapped to a function (don't ask me why they are not just called the same)

    doState(functionName, nodeType) {
        if (this[functionName] != null) {
            if (this[functionName][nodeType] != null) {
                this[functionName][nodeType]()
            } else if (this[functionName]['default'] != null) {
                this[functionName]['default']()
            } else {
                this.error()
            }                
        } else {
            this.exit('State ' + state + ' not handled.')
        }
    }

    parse () {
        for (let node of this.nodes) {
            this.currentNode = node
            let state = this.getCurrentState()
            console.log(`Node: '${node.content}'\tType: ${node.type}\tState ${state}`)
            let functionName = this.getStateObjectName(state)
            this.doState(functionName, node.type)
        }
        console.log('')
        console.log('')
        return this.root
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