
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
        'DATA':     () => this.redirectToState('$-data-declaration'),
        'FUNC':     () => this.redirectToState('$-function-declaration'),
        'default':      () => {
            this.push(this.currentNode.content)
            this.setState('$-normal-expression')
        }
    }

    '$-normal-expression' = {
        '|':                () => {
            this.branchOut('PAREXPRESSION', '$-normal-expression')
        },        
        'YAML':             () => {
            this.setState('$-expecting-yaml-colon')
            this.areChildScopesYAML = true
        },
        ':':                () => {
            if (this.isYAML) {
                this.wrapOver({
                    wrapperExpressionType: 'YAMLPROPERTYVALUE',
                    newExpressionType: this.currentExpression.type,
                    nextState: 'none'   // No need for a new state
                })
                this.brateIn()
                this.branchOut('EXPRESSION', '$-normal-expression')
            } else {
                this.push(this.currentNode.content)
            }
        },
        'FLOWCONTROL':      () => {
            console.log(`Reached another flow control expression: ${this.currentNode}`)
            this.branchOut('INLINEIFEXPRESSION')
            this.branchOut('EXPRESSION', '$-inline-if-condition')
        },
        'default':          () => {
            if (this.currentNode.isExpression == true) {
                this.push(new Parser({givenExpression: this.currentNode, startAt: '$-normal-expression'}).parse())
            } else {
                this.push(this.currentNode.content)
            }
        },
    }

    '$-inline-if-condition' = {
        ':':        () => {
            this.brateIn()
            this.branchOut('EXPRESSION', '$-inline-if-statement')
        },
        'default':  () => {
            if (this.currentNode.isExpression == true) {
                this.push(new Parser({givenExpression: this.currentNode, startAt: '$-normal-expression'}).parse())
            } else {
                this.push(this.currentNode.content)
            }
        }
    }

    '$-inline-if-statement' = {
        'ELSE':     () => {
            this.brateIn()
            this.branchOut('EXPRESSION', '$-normal-expression')
        },
        'default':  () => {
            if (this.currentNode.isExpression == true) {
                this.push(new Parser({givenExpression: this.currentNode, startAt: '$-normal-expression'}).parse())
            } else {
                this.push(this.currentNode.content)
            }
        }
    }

    '$-flow-control-expression' = {
        ':':        () => { this.brateIn(); this.branchOut('EXPRESSION', '$-normal-expression') },
        '|':        () => { this.branchOut('PAREXPRESSION', '$-flow-control-expression') },
        'default':  () => {
            if (this.currentNode.isExpression == true) {
                this.push(new Parser({givenExpression: this.currentNode, startAt: '$-normal-expression'}).parse())
            } else {
                this.push(this.currentNode.content)
            }
        }
    }

    '$-modifiers' = {
        'MODIFIER': () => this.currentExpression.accessModifiers.push(this.currentNode.content),
        'VAR':      () => this.redirectToState('$-var'),
        'CLASS':    () => this.redirectToState('$-class-declaration'),
        'DATA':     () => this.redirectToState('$-data-declaration'),
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

    '$-data-declaration' = {
        'DATA':     () => {
            this.currentExpression.type = 'DATADECLARATION'
            this.setState('$-data-name')
        }
    }

    '$-expecting-function-generic' = {
        'GENERICEXPRESSION':    () => {
            let parsed = new Parser({givenExpression: this.currentNode, startAt: '$-normal-expression'}).parse()
            parsed.type = 'GENERICEXPRESSION'
            console.log(`Switching its type from ${this.currentNode.type} to ${parsed.type}`)
            console.log('And heres the parsed:')
            console.log(parsed)
            this.push(parsed)
            this.setState('$-expecting-function-generic')
        },
        'ATOM':                 () => this.redirectToState('$-function-name')
    }

    '$-expecting-class-generic' = {
        'GENERICEXPRESSION':    () => {
            let parsed = new Parser({givenExpression: this.currentNode, startAt: '$-normal-expression'}).parse()
            parsed.type = 'GENERICEXPRESSION'
            this.push(parsed)
            this.setState('$-expecting-class-generic')
        },
        'ATOM':                 () => this.redirectToState('$-class-name')
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
        '=':                    () => this.redirectToState('$-expecting-attribution-equals'),
        'GENERICEXPRESSION':    () => {
            let parsed = new Parser({givenExpression: this.currentNode, startAt: '$-normal-expression'}).parse()
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

    '$-data-name'  = {
        'ATOM':     () => {
            this.push(this.currentNode.content)
            this.branchOut('EXPRESSION', '$-normal-expression')
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
            this.push(new Parser({givenExpression: this.currentNode, startAt: '$-normal-expression'}).parse())
            this.setState('$-expecting-colon')
        }
    }

    '$-expecting-colon' = {
        ':':    () => this.setState('$-normal-expression')
    }

    '$-expecting-yaml-colon' = {
        ':':        () => this.setState('$-expecting-nothing'),
        'default':  () => this.setState('$-no-state')
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