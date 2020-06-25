
import ParserStates from './ParserStates.js'
// import * as Words from './Words.js'
// import * as Grammar from './Grammar.js'
import { Expression } from './Expressions.js'
import { dashCaseToCamelCase } from './Utils.js'

class Parser extends ParserStates {

    constructor({givenExpression, startAt='$-root', isYAML=false}) {
        console.log(`Parser with givenExpression: ${givenExpression}`)
        super()
        this.nodes = givenExpression.content
        this.root = new Expression(givenExpression.parent, [], givenExpression.type, givenExpression.isTuple)  // WARNING: Make sure the parent is ok!
        this.currentExpression = this.root
        this.currentNode = null                 // Set in the for in parse
        this.areChildScopesYAML = false         // If the parsing ended in 'yaml,:' then this flag is set to true. It's handled in the function outside of the Parser
        this.isYAML = isYAML                    // Its expression will be parsed exclusively as YAML
        if (isYAML)
            this.areChildScopesYAML = true

        this._stateHistory = [startAt]

        this.stateStack = [startAt]
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
        let newExpression = new Expression(this.currentExpression, [], newExpressionType, false)
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
        let newExpression = new Expression(this.currentExpression, content, newExpressionType, false)
        newExpression.accessModifiers = accessModifiers
        this.currentExpression.content = [newExpression]
        this.currentExpression = newExpression
        this.stateStack.push(nextState)
    }

    getStateObjectName(stateName) {
        //return '$' + dashCaseToCamelCase(stateName.substring(2))
        return stateName
    } // Each state is mapped to a function (don't ask me why they are not just called the same)

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
            this.exit('State ' + functionName + ' not handled.')
        }
    }

    parse() {
        for (let node of this.nodes) {
            this.currentNode = node
            let state = this.getCurrentState()
            //console.log(`Node: '${node.content}'\tType: ${node.type}\tState ${state}`)
            let functionName = this.getStateObjectName(state)
            this.doState(functionName, node.type)
        }
        return this.root
    }

}


function parseScope(baseScope, isYaml = false) {
    let parser = null
    if (baseScope.expression != null) {
        parser = new Parser({
            givenExpression: baseScope.expression,
            startAt: '$-root',
            isYAML: isYaml
        })
        baseScope.expression = parser.parse()
    }
    if (parser != null && parser.areChildScopesYAML) {                // The 'areChildScopesYAML' property is set during parsing
        for (let scope of baseScope.content) {
            parseScope(scope, true)                 // Parses all content as YAML
        }
    } else {                                        // Else parse normally
        for (let scope of baseScope.content) {
            parseScope(scope, false)
        }
    }
}


export { Parser, parseScope }