 
import { spaces, splitArrayByIndicesExclusive, isRunningInBrowser } from './Utils.mjs'

let fs = null
if (!isRunningInBrowser()) {
    import('fs').then(_fs => fs = _fs)
}


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

let doesVarHaveType = expr => expr.content.length >= 2
let getVarName = expr => expr.content[0]
let getVarType = expr => expr.content[1]

function outputNode({node, options, parentScope, language}) {
    if (language == null) throw 'ERROR: Null language given to outputNode!'
    return new Outputter(node, options, parentScope, language).output()
}

function splitTypedVarIntoExpressions(expression) {
    console.log('Expression:')
    console.log(expression)
    if (expression == null) throw 'Null expression given'
    if (expression.content.length == 0) throw 'Empty expression given'
    let colonPosition = expression.content.findIndex(e => e == ':')
    let equalPosition = expression.content.findIndex(e => e == '=')
    let splitPositions = [colonPosition, equalPosition].filter(i => i != -1)
    let expressions = splitArrayByIndicesExclusive(expression.content, splitPositions)
    let ret = {
        name : expressions[0],
        type : null,
        value : null
    }
    if (colonPosition == -1 && equalPosition == -1) {                   // Ex: (age)
        return ret
    } else if (colonPosition != -1 && equalPosition == -1) {            // Ex: (age : Int)
        ret.type = expression[1]
    } else if (colonPosition == -1 && equalPosition != -1) {            // Ex: (age = 20)
        ret.value  = expression[1]
    } else {                                                            // Ex: (age : Int = 20)
        ret.type = expressions[1]
        ret.value = expressions[2]
    }
    return ret
}

function parseParameterExpression(expr, scope, language) {
    let parameter = splitTypedVarIntoExpressions(expr)
    parameter.name  = joinStringsNodesBySpaces(parameter.name.map(node => outputNode({node, parentScope: scope, language: language})))
    parameter.type  = (parameter.type == null)  ? null : joinStringsNodesBySpaces(parameter.type?.map(node => outputNode({node, parentScope: scope, language: language})))
    parameter.value = (parameter.value == null) ? null : joinStringsNodesBySpaces(parameter.value?.map(node => outputNode({node, parentScope: scope, language: language})))
    return parameter
}

function getParameters(fullParameterExpression, scope, language) {
    console.log('Getting parameters')
    if (fullParameterExpression.isTuple) {
        return fullParameterExpression.content.map(expr => parseParameterExpression(expr, scope, language))
    } else {
        if (fullParameterExpression.content.length == 0) return []
        return [parseParameterExpression(fullParameterExpression, scope, language)]
    }
}

export function outputScope(scope, language) {
    let ret = ''
    if (scope.expression == null) {                                         // Only if it is the root scope in the code
        ret = scope.content.map( sc => outputScope(sc, language)).join('\n')
        return ret
    } else {
        ret = spaces(scope.indentation) + outputNode({node: scope.expression, parentScope: scope, language: language})
        ret = language.outputScopeLine({
            indentation:    scope.indentation,
            scopeLine:      outputNode({node: scope.expression, parentScope: scope, language: language}),
            hasChildren:    scope.content.length > 0,
            scope:          scope
        })
        if (scope.content.length > 0) {
            ret += '\n'
            ret += scope.content.map( sc => outputScope(sc, language)).join('\n') + '\n'
            ret += language.endScope({baseIndentation: scope.indentation, scope})
            return ret
        } else {
            return ret
        }
    }
}

function joinStringsNodesBySpaces(strings) {
    if (strings.length == 0) {
        return ''
    }
    if (strings.length == 1) {
        return strings[0]
    }
    const noSpaceBefore = {
        '.'         : true,
    }
    const noSpaceAfter = {
        '.'         : true,
        'this.'     : true
    }

    let prev = strings[0]
    let ret = prev
    for (let i = 1; i < strings.length; i++) {
        let current = strings[i]
        if (noSpaceAfter[prev] == true || noSpaceBefore[current] == true) {
            ret += current
        } else {
            ret += ' ' + current
        }
        prev = current
    }
    return ret
}

class Outputter {
    constructor(node, options = {}, scope, language) {
        this.language = language
        this.scope = scope
        this.node = node
        this.mods = ''
        this.treatIndexAsGeneric = options.treatIndexAsGeneric != null? options.treatIndexAsGeneric: false
    }

    output() {
        if (typeof(this.node) == 'string') {
            return macrofy(this.node, this.language)
        } else if (this.outputs[this.node.type] != null) {
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
        'OVERHEAD':         () => {
            if (this.node.content == 1) {
                if (isRunningInBrowser()) {
                    this.error('Overhead is not supported in the browser version.')
                } else {
                    let overheadCode = fs.readFileSync(this.node.content[0], {encoding: 'utf8', flag: 'r'})
                    let languageResponse = this.language.getOverhead(this.node)
                    if (languageResponse == 'use default') {
                        return overheadCode
                    }
                }
            } else {
                this.error('The path given for overhead is null or unusual.')
            }            
        },
        'VARDECLARATION':   () => {
            let type = null
            let generic = null
            let fullType = null
            if (doesVarHaveType(this.node)) {
                type = getVarType(this.node)
                if (this.node.content.length == 3) {
                    generic = outputNode({node: this.node.content[2], parentScope: this.scope, language: this.language})
                    fullType = type + generic
                } else {
                    fullType = type
                }
            }
            let ret = this.language.getVarDeclaration({
                name: getVarName(this.node),
                type: fullType,
                modifiers: this.node.accessModifiers,
                expression: this.node
            })
            return ret
        },
        'FUNCDECLARATION':  () => {
            let generic = null
            if (doesFuncHaveGeneric(this.node)) {
                generic = outputNode({node: getFuncGeneric(this.node), parentScope: this.scope, language: this.language})
            }
            let functionParametersExpression = getFuncParameters(this.node)
            
            let params = getParameters(functionParametersExpression, this.scope, this.language)
            console.log('Got parameters as:')
            console.log({params})
            
            let ret = this.language.getFunctionDeclaration({
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
                this.mods = '/*' + this.mods + '*/ '
            if (doesClassHaveGeneric(this.node)) {
                let generic = outputNode({node: getClassGeneric(this.node), parentScope: this.scope, language: this.language})
                return this.mods + 'class /*' + generic + '*/ ' + getClassName(this.node)
            } else {
                return this.mods + 'class ' + getClassName(this.node)
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

            for (let expr of expressionsToParse) {
                fields.push(parseParameterExpression(expr, this.scope, this.language))
            }

            return this.language.getDataDeclaration({indentation, className, fields, expression: this.node})
        },
        'PAREXPRESSION':    () => {
            if (this.node.isTuple == true) {
                return '(' + this.node.content.map( node => outputNode({node, parentScope: this.scope, language: this.language})).join(', ') + ')'
            } else {
                let nodes = this.node.content.map( node => outputNode({node, parentScope: this.scope, language: this.language}))
                let ret = '(' + joinStringsNodesBySpaces(nodes) + ')'
                return ret
            }
        },
        'INDEXEXPRESSION':      () => {
            if (this.treatIndexAsGeneric == true) return this.outputs['GENERICEXPRESSION']()
            else {
                if (this.node.isTuple == true) {
                    return '[' + this.node.content.map( node => outputNode({node, parentScope: this.scope, language: this.language})).join(', ') + ']'
                } else {
                    return '[' + this.node.content.map( node => outputNode({node, parentScope: this.scope, language: this.language})).join(' ') + ']'
                }
            }
        },
        'GENERICEXPRESSION':    () => {
            if (this.node.isTuple == false)
                return '<' + joinStringsNodesBySpaces(this.node.content.map( node => outputNode({node, options: {treatIndexAsGeneric: true}, parentScope: this.scope, language: this.language}))) + '>'
            else
                return '<' + this.node.content.map( node => outputNode({node, options: {treatIndexAsGeneric: true}, parentScope: this.scope, language: this.language})).join(', ') + '>'
        },
        'EXPRESSION':   () => {
            return joinStringsNodesBySpaces(this.node.content.map( node => outputNode({node, parentScope: this.scope, language: this.language})))
        },
        'ATTRIBUTION':  () => {
            let left = outputNode({
                node:           this.node.content[0],
                parentScope:    this.scope,
                language:       this.language
            })
            let right = null
            if (this.node.content[1].isExpression == false || this.node.content.length < 2 || this.node.content[1] == null) throw 'No right side expression at attribution? This should never happen! Worst case scenario, it should be an empty expression'
            if (this.node.content[1].content.length == 0)
                right = ''
            else
                right = outputNode({
                    node:           this.node.content[1],
                    parentScope:    this.scope,
                    language:       this.language
                })
            return  left + ' = ' + right
        },
        'FLOWCONTROLEXPRESSION':    () => {
            let name = this.node.content[0]                     // 'if', 'while', 'switch', ...
            let inner = outputNode({node: this.node.content[1], parentScope: this.scope, language: this.language})
            console.log({inner})
            console.log({name})
            return this.language.getFlowControlExpression({
                name, inner, expression: this.node
            })
        },
        'ELSEEXPRESSION':           () => {
            return this.language.getElseExpression({
                expression: this.node
            })
        },
        'YAMLPROPERTYVALUE':        () => {
            let key = outputNode({node: this.node.content[0], parentScope: this.scope, language: this.language})
            let value = null
            if (this.node.content.length > 1) {
                let rightExpression = this.node.content[1]
                if (rightExpression.content.length > 0) {
                    value = outputNode({node: rightExpression, parentScope: this.scope, language: this.language})
                }
            }
            return this.language.getYAMLExpression({ key, value })
        },
        'INLINEIFEXPRESSION':       () => {
            let condition = outputNode({ node: this.node.content[0], parentScope: this.scope, language: this.language})
            let statement = outputNode({ node: this.node.content[1], parentScope: this.scope, language: this.language})
            let elseStatm = outputNode({ node: this.node.content[2], parentScope: this.scope, language: this.language})
            return this.language.getInlineIfExpression({
                condition, ifStatement: statement, elseStatement: elseStatm
            })
        },
        'default':      () => {
            console.log(this.node)
            throw 'Unknown node type: ' + this.node.type
        }
    }
}

function macrofy(str, language) {
    if (language.macros[str] == null) return str
    return language.macros[str]
}



