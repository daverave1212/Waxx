
import { Parser } from './Parser.js'

export default class ParserStates {

    $noState = {}

    $root = {
        'MODIFIER':     () => this.redirectToState('$-modifiers'),
        'FLOWCONTROL':  () => {
            this.push(this.currentNode.content)
            this.branchOut('flow-control-expression', '$-flow-control-expression')
        },
        'OVERHEAD':     () => {
            this.currentExpression.type = 'overhead'
            this.setState('$-overhead-path')
        },
        'default':      () => {
            console.log(`Redirecting word ${this.currentNode.content} to $-normal-expression`)
            this.redirectToState('$-normal-expression')
        }
    }

    $normalExpression = {
        'EXPRESSION':       () => this.push(this.currentNode),
        'PAREXPRESSION':    () => this.push(this.currentNode),
        'INDEXEXPRESSION':  () => this.push(this.currentNode),
        'default':          () => this.push(this.currentNode.content)
    }

    $flowControlExpression = {
        ':':        () => { this.brateIn(); this.branchOut('normal-expression', '$-normal-expression') },
        'default':  () => this.push(this.currentNode.content)
    }

    $modifiers = {
        'MODIFIER': () => this.currentExpression.accessModifiers.push(this.currentNode.content),
        'VAR':      () => this.redirectToState('$-var'),
        'CLASS':    () => this.redirectToState('$-class-declaration'),
        'FUNC':     () => this.redirectToState('$-function-declaration')
    }

    $var = {
        'VAR':      () => {
            this.currentExpression.type = 'variable-declaration'
            this.setState('$-var-name')
        }
    }

    $functionDeclaration = {
        'FUNC':     () => {
            this.currentExpression.type = 'function-declaration'
            this.setState('$-expecting-function-generic')
        }
    }

    $classDeclaration = {
        'CLASS':    () => {
            this.push(this.currentNode.content)
            this.setState('$-expecting-class-generic')
        }
    }

    $expectingFunctionGeneric = {
        'INDEXEXPRESSION':  () => {
            this.push(new Parser(this.currentExpression, '$-normal-expression').parse())
            this.setState('$-expecting-function-generic')
        },
        'ATOM':     () => this.redirectToState('$-function-name')
    }

    $expectingClassGeneric = {
        'INDEXEXPRESSION':  () => {
            this.push(new Parser(this.currentExpression, '$-normal-expression').parse())
            this.setState('$-expecting-class-generic')
        },
        'ATOM':     () => this.redirectToState('$-class-name')
    }

    $type = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('$-expecting-generic')
        }
    }

    $expectingGeneric = {
        '<':        () => this.branchOut('generic-expression', '$-generic-inner'),
        'ATOM':     () => this.redirectToState('$-var-name')
    }

    $genericInner = {
        '>':        () => this.brateIn(),
        'ATOM':     () => this.push(this.currentNode.content)
    }

    $varName = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('$-expecting-var-type')
        }
    }

    $expectingVarType = {
        ':':        () => this.setState('$-var-type'),
        '=':        () => this.redirectToState('$-expecting-attribution-equals')
    }

    $varType = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('$-expecting-var-type-generic-or-equals')
        }
    }

    $expectingVarTypeGenericOrEquals = {
        '=':        () => this.redirectToState('$-expecting-attribution-equals'),
        'INDEXEXPRESSION':  () => {
            this.push(new Parser(this.currentExpression, '$-normal-expression').parse())
            this.setState('$-expecting-var-type-generic-or-equals')
        }
    }

    $className = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('$-no-state')
        }
    }

    $functionName = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('$-expecting-function-parameters')
        }
    }

    $expectingFunctionParameters = {
        'PAREXPRESSION':   () => {
            this.push(new Parser(this.currentNode, '$-function-parameters').parse())
            this.setState('$-expecting-colon')
        }
    }

    $expectingColon = {
        ':':    () => this.setState('$-normal-expression')
    }

    $expectingAttributionEquals = {
        '=':    () => {
            this.wrapOver({
                wrapperExpressionType: 'attribution',
                newExpressionType: this.currentExpression.type,
                nextState: 'none'   // No need for a new state
            })
            this.brateIn()
            this.branchOut('attribution-right', '$-normal-expression')
        }
    }

    $functionParameters = {
        'default':      () => this.push(this.currentNode.content)
    }

    $overheadPath = {
        'STRING':   () => {
            this.push(this.currentNode.content)
            this.setState('$-no-state')
        }
    }
}