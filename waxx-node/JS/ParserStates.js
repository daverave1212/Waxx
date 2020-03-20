
import { Parser } from './Parser.js'

export default class ParserStates {

    noState = {}

    readingRoot = {
        'MODIFIER':     () => this.redirectToState('reading-modifiers'),
        'FLOWCONTROL':  () => {
            this.push(this.currentNode.content)
            this.branchOut('flow-control-expression', 'reading-flow-control-expression')
        },
        'default':      () => {
            console.log(`Redirecting word ${this.currentNode.content} to reading-normal-expression`)
            this.redirectToState('reading-normal-expression')
        }
    }

    readingNormalExpression = {
        'EXPRESSION':   () => this.push(this.currentNode),
        'default':      () => this.push(this.currentNode.content)
    }

    readingFlowControlExpression = {
        ':':        () => { this.brateIn(); this.branchOut('normal-expression', 'reading-normal-expression') },
        'default':  () => this.push(this.currentNode.content)
    }

    readingModifiers = {
        'MODIFIER': () => this.currentExpression.accessModifiers.push(this.currentNode.content),
        'VAR':      () => this.redirectToState('reading-var'),
        'CLASS':    () => this.redirectToState('reading-class-declaration'),
        'FUNC':     () => this.redirectToState('reading-function-declaration')
    }

    readingVar = {
        'VAR':      () => {
            this.currentExpression.type = 'variable-declaration'
            this.setState('reading-var-name')
        }
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
            this.setState('expecting-var-type')
        }
    }

    expectingVarType = {
        ':':        () => this.setState('reading-var-type'),
        '=':        () => this.redirectToState('expecting-attribution-equals')
    }

    readingVarType = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('expecting-var-type-generic-or-equals')
        }
    }

    expectingVarTypeGenericOrEquals = {
        '=':        () => this.redirectToState('expecting-attribution-equals'),
        '<':        () => this.branchOut('generic-inner', 'reading-generic-inner')
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
            this.push(new Parser(this.currentNode, 'reading-function-parameters').parse())
            this.setState('expecting-colon')
        }
    }

    expectingColon = {
        ':':    () => this.setState('no-state')
    }

    expectingAttributionEquals = {
        '=':    () => {
            this.wrapOver({
                wrapperExpressionType: 'attribution',
                newExpressionType: this.currentExpression.type,
                nextState: 'none'   // No need for a new state
            })
            this.brateIn()
            this.branchOut('attribution-right', 'reading-normal-expression')
        }
    }

    readingFunctionParameters = {
        'default':      () => this.push(this.currentNode.content)
    }
}