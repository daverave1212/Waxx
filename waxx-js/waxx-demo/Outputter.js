 
import { spaces, splitArrayByIndicesExclusive } from './Utils.js'
import * as JSOutput from './JSOutput.js'
import * as PythonOutput from './PythonOutput.js'

let Language = new JSOutput.LanguageOutputter()
//let Language = new PythonOutput.LanguageOutputter()

let error = message => {
    throw message
    return ''
}
let doesFuncHaveGeneric = expr => expr.content[0].type == 'GENERICEXPRESSION'
let getFuncName = expr => doesFuncHaveGeneric(expr)? expr.content[1]: expr.content[0]
let getFuncGeneric = expr => doesFuncHaveGeneric(expr)? expr.content[0]: error(`This function has no generic`)
let getFuncParameters = expr => expr.content.filter( elem => elem.type == 'PAREXPRESSION')[0]

let doesClassHaveGeneric = doesFuncHaveGeneric
let getClassName = getFuncName
let getClassGeneric = getFuncGeneric

let doesVarHaveType = expr => expr.content.length == 2
let getVarName = expr => expr.content[0]
let getVarType = expr => expr.content[1]

const NEWLINE = '\n'

function outputNode({node, options, parentScope}) {
    return new Outputter(node, options, parentScope).output()
}

function splitTypedVarIntoExpressions(expression) {
    if (expression == null) throw 'Null expression given'
    if (expression.content.length == 0) throw 'Empty expression given'
    let colonPosition = expression.content.findIndex(e => e == ':')
    let equalPosition = expression.content.findIndex(e => e == '=')
    let splitPositions = [colonPosition, equalPosition].filter(i => i != -1)
    let expressions = splitArrayByIndicesExclusive(expression.content, splitPositions)
    return {
        name : expressions[0],
        type : expressions.length > 1 ? expressions[1] : null,
        value : expressions.length > 2 ? expressions[2] : null
    }
}

export function outputScope(scope) {
    console.log(`Outputting scope: ${scope.expression}`)
    let ret = ''
    if (scope.expression == null) {                                         // Only if it is the root scope in the code
        ret = scope.content.map( sc => outputScope(sc)).join('\n')
        return ret
    } else {
        ret = spaces(scope.indentation) + outputNode({node: scope.expression, parentScope: scope})
        ret = Language.outputScopeLine({
            indentation:    scope.indentation,
            scopeLine:      outputNode({node: scope.expression, parentScope: scope}),
            hasChildren:    scope.content.length > 0,
            scope:          scope
        })
        if (scope.content.length > 0) {
            ret += '\n'
            ret += scope.content.map( sc => outputScope(sc)).join('\n') + '\n'
            ret += Language.endScope({baseIndentation: scope.indentation, scope})
            return ret
        } else {
            return ret
        }
    }
}


class Outputter {
    constructor(node, options = {}, scope) {
        this.scope = scope
        this.node = node
        this.mods = ''
        this.treatIndexAsGeneric = options.treatIndexAsGeneric != null? options.treatIndexAsGeneric: false
    }

    output() {
        if (typeof(this.node) == 'string') {
            return macrofy(this.node)
        } else if (this.outputs[this.node.type] != null) {
            //console.log(`  Going for ${this.node.type}`)
            if (this.node.accessModifiers != null && this.node.accessModifiers.length != 0) {
                this.mods = this.node.accessModifiers.join(' ') + ' '
            }
            return this.outputs[this.node.type](this.node)
        } else {
            console.log(this.node)
            console.log(`WARNING: Node type ${this.node.type} not handled for output.`)
            return this.outputs.default(this.node)
        }
    }

    outputs = {
        'OVERHEAD':         () => Language.getOverhead(this.node),
        'VARDECLARATION':   () => {
            let type = null
            if (doesVarHaveType(this.node)) {
                type = getVarType(this.node)
            }
            let ret = Language.getVarDeclaration({
                name: getVarName(this.node),
                type: type,
                modifiers: this.node.accessModifiers,
                expression: this.node
            })
            return ret
        },
        'FUNCDECLARATION':  () => {
            let generic = null
            if (doesFuncHaveGeneric(this.node)) {
                generic = outputNode({node: getFuncGeneric(this.node), parentScope: this.scope})
            }
            let params = outputNode({node: getFuncParameters(this.node), parentScope: this.scope})
            let ret = Language.getFunctionDeclaration({
                modifiers: this.node.accessModifiers,
                generic: generic,
                name: getFuncName(this.node),
                parameters: params,
                expression: this.node
            })
            return ret
        },
        'CLASSDECLARATION': () => {
            if (this.node.accessModifiers != null && this.node.accessModifiers.length > 0)
                this.mods = '/*' + this.mods + '*/'
            if (doesClassHaveGeneric(this.node)) {
                let generic = outputNode({node: getClassGeneric(this.node), parentScope: this.scope})
                return this.mods + ' class /*' + generic + '*/ ' + getClassName(this.node)
            } else {
                return this.mods + ' class ' + getClassName(this.node)
            }
        },
        'DATADECLARATION': () => {
            if (this.node.content.length < 2) throw 'Syntax error for data class declaration'
            let indentation = this.scope.indentation
            let className = this.node.content[0]
            let body = this.node.content[1] // Expression
            if (body.content.length == 1 && body.content[0].type == 'PAREXPRESSION') { // It means it was actually a PAREXPRESSION
                body = body.content[0]
            }
            let fields = []
            let expressionsToParse = []
            if (body.isTuple)
                expressionsToParse = [...body.content]
            else
                expressionsToParse = [body.content[0]]

            let parseParameterExpression = expr => {
                let parameter = splitTypedVarIntoExpressions(expr)
                parameter.name  = parameter.name.map(node => outputNode({node, parentScope: this.scope}))
                parameter.type  = parameter.type?.map(node => outputNode({node, parentScope: this.scope}))
                parameter.value = parameter.value?.map(node => outputNode({node, parentScope: this.scope}))
                console.log(parameter)
                return parameter
            }

            for (let expr of expressionsToParse) {
                fields.push(parseParameterExpression(expr))
            }

            return Language.getDataDeclaration({indentation, className, fields, expression: this.node})
        },
        'PAREXPRESSION':    () => {
            if (this.node.isTuple == true) {
                return '(' + this.node.content.map( node => outputNode({node, parentScope: this.scope})).join(', ') + ')'
            } else {
                return '(' + this.node.content.map( node => outputNode({node, parentScope: this.scope})).join(' ') + ')'
            }
        },
        'INDEXEXPRESSION':      () => {
            if (this.treatIndexAsGeneric == true) return this.outputs['GENERICEXPRESSION']()
            else {
                if (this.node.isTuple == true) {
                    return '[' + this.node.content.map( node => outputNode({node, parentScope: this.scope})).join(', ') + ']'
                } else {
                    return '[' + this.node.content.map( node => outputNode({node, parentScope: this.scope})).join(', ') + ']'
                }
            }
        },
        'GENERICEXPRESSION':    () => {
            if (this.node.isTuple == false)
                return '<' + this.node.content.map( node => outputNode({node, options: {treatIndexAsGeneric: true}, parentScope: this.scope})).join(' ') + '>'
            else
                return '<' + this.node.content.map( node => outputNode({node, options: {treatIndexAsGeneric: true}, parentScope: this.scope})).join(', ') + '>'
        },
        'EXPRESSION':   () => {
            return this.node.content.map( node => outputNode({node, parentScope: this.scope})).join(' ')
        },
        'ATTRIBUTION':  () => {
            return outputNode({node: this.node.content[0], parentScope: this.scope}) + ' = ' + outputNode({node: this.node.content[1], parentScope: this.scope})
        },
        'FLOWCONTROLEXPRESSION':    () => {
            let name = this.node.content[0]                     // 'if', 'while', 'switch', ...
            let inner = outputNode({node: this.node.content[1], parentScope: this.scope})
            console.log({inner})
            console.log({name})
            return Language.getFlowControlExpression({
                name, inner, expression: this.node
            })
        },
        'YAMLPROPERTYVALUE':        () => {
            let key = outputNode({node: this.node.content[0], parentScope: this.scope})
            let value = null
            if (this.node.content.length > 1) {
                let rightExpression = this.node.content[1]
                if (rightExpression.content.length > 0) {
                    value = outputNode({node: rightExpression, parentScope: this.scope})
                }
            }
            return Language.getYAMLExpression({ key, value })
        },
        'default':      () => {
            console.log(this.node)
            throw 'Unknown node type: ' + this.node.type
        }
    }
}

function macrofy(str) {
    if (Language.macros[str] == null) return str
    return Language.macros[str]
}



