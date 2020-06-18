
import { Parser } from './Parser.js'

export default class ParserStates {

    '$-no-state' = {}

    '$-root' = {
        'MODIFIER':     () => this.redirectToState('$-modifiers'),
        'FLOWCONTROL':  () => {
            this.push(this.currentNode.content)
            this.currentExpression.type = 'FLOWCONTROLEXPRESSION'
            this.branchOut('PAREXPRESSION', '$-flow-control-expression')
        },
        'OVERHEAD':     () => {
            this.currentExpression.type = 'OVERHEAD'
            this.setState('$-overhead-path')
        },
        'VAR':      () => this.redirectToState('$-var'),
        'CLASS':    () => this.redirectToState('$-class-declaration'),
        'FUNC':     () => this.redirectToState('$-function-declaration'),
        'default':      () => {
            // console.log(`Redirecting word ${this.currentNode.content} to $-normal-expression`)
            this.redirectToState('$-normal-expression')
        }
    }

    '$-normal-expression' = {
        'default':          () => {
            if (this.currentNode.isExpression == true) {
                this.push(new Parser(this.currentNode, '$-normal-expression').parse())
            } else {
                this.push(this.currentNode.content)
            }
        }
    }

    '$-flow-control-expression' = {
        ':':        () => { this.brateIn(); this.branchOut('normal-expression', '$-normal-expression') },
        'default':  () => this.push(this.currentNode.content)
    }

    '$-modifiers' = {
        'MODIFIER': () => this.currentExpression.accessModifiers.push(this.currentNode.content),
        'VAR':      () => this.redirectToState('$-var'),
        'CLASS':    () => this.redirectToState('$-class-declaration'),
        'FUNC':     () => this.redirectToState('$-function-declaration')
    }

    '$-var' = {
        'VAR':      () => {
            this.currentExpression.type = 'VARDECLARATION'
            this.setState('$-var-name')
        }
    }

    '$-function-declaration' = {
        'FUNC':     () => {
            this.currentExpression.type = 'FUNCDECLARATION'
            this.setState('$-expecting-function-generic')
        }
    }

    '$-class-declaration' = {
        'CLASS':    () => {
            this.currentExpression.type = 'CLASSDECLARATION'
            this.setState('$-expecting-class-generic')
        }
    }

    '$-expecting-function-generic' = {
        'INDEXEXPRESSION':  () => {
            let parsed = new Parser(this.currentNode, '$-normal-expression').parse()
            parsed.type = 'GENERICEXPRESSION'
            console.log(`Switching its type from ${this.currentNode.type} to ${parsed.type}`)
            console.log('And heres the parsed:')
            console.log(parsed)
            this.push(parsed)
            this.setState('$-expecting-function-generic')
        },
        'ATOM':     () => this.redirectToState('$-function-name')
    }

    '$-expecting-class-generic' = {
        'INDEXEXPRESSION':  () => {
            let parsed = new Parser(this.currentNode, '$-normal-expression').parse()
            parsed.type = 'GENERICEXPRESSION'
            this.push(parsed)
            this.setState('$-expecting-class-generic')
        },
        'ATOM':     () => this.redirectToState('$-class-name')
    }

    '$-var-name' = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('$-expecting-var-type')
        }
    }

    '$-expecting-var-type' = {
        ':':        () => this.setState('$-var-type'),
        '=':        () => this.redirectToState('$-expecting-attribution-equals')
    }

    '$-var-type' = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('$-expecting-var-type-generic-or-equals')
        }
    }

    '$-expecting-var-type-generic-or-equals' = {
        '=':        () => this.redirectToState('$-expecting-attribution-equals'),
        'INDEXEXPRESSION':  () => {
            let parsed = new Parser(this.currentNode, '$-normal-expression').parse()
            parsed.type = 'GENERICEXPRESSION'
            this.push(parsed)
            this.setState('$-expecting-var-type-generic-or-equals')
        }
    }

    '$-class-name' = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('$-no-state')
        }
    }

    '$-function-name' = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.setState('$-expecting-function-parameters')
        }
    }

    '$-expecting-function-parameters' = {
        'PAREXPRESSION':   () => {
            this.push(new Parser(this.currentNode, '$-normal-expression').parse())
            this.setState('$-expecting-colon')
        }
    }

    '$-expecting-colon' = {
        ':':    () => this.setState('$-normal-expression')
    }

    '$-expecting-attribution-equals' = {
        '=':    () => {
            this.wrapOver({
                wrapperExpressionType: 'ATTRIBUTION',
                newExpressionType: this.currentExpression.type,
                nextState: 'none'   // No need for a new state
            })
            this.brateIn()
            this.branchOut('EXPRESSION', '$-normal-expression')
        }
    }

    '$-overhead-path' = {
        'STRING':   () => {
            this.push(this.currentNode.content)
            this.setState('$-no-state')
        }
    }
}