
import { spaces } from './Utils.js'
import * as JSOutput from './JSOutput.js'

let Language = new JSOutput.LanguageOutputter()

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

export function outputNode(node, options) {
    return new Outputter(node, options).output()
}

export function outputScope(scope) {
    let ret = ''
    if (scope.expression == null) {
        ret = scope.content.map( sc => outputScope(sc)).join('\n')
        return ret
    } else {
        ret = spaces(scope.indentation) + outputNode(scope.expression)
        if (scope.content.length > 0) {
            ret += ' {\n'
            ret += scope.content.map( sc => outputScope(sc)).join('\n') + '\n'
            ret += spaces(scope.indentation) + '}'
            return ret
        } else {
            return ret
        }
    }
}

class Outputter {
    constructor(node, options = {}) {
        this.node = node
        this.mods = ''
        this.treatIndexAsGeneric = options.treatIndexAsGeneric != null? options.treatIndexAsGeneric: false
    }

    output() {
        if (typeof(this.node) == 'string') {
            return macrofy(this.node)
        } else if (this.outputs[this.node.type] != null) {
            console.log(`  Going for ${this.node.type}`)
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
            Language.getVarDeclaration({
                // TO DO
            })
        }
        'FUNCDECLARATION':  () => {
            let generic = null
            if (doesFuncHaveGeneric(this.node)) {
                let generic = outputNode(getFuncGeneric(this.node))
            }
            let params = outputNode(getFuncParameters(this.node))
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
                this.mods = '/*' + mods + '*/'
            if (doesClassHaveGeneric(this.node)) {
                let generic = outputNode(getClassGeneric(this.node))
                return this.mods + ' class /*' + generic + '*/ ' + getClassName(this.node)
            } else {
                return this.mods + ' class ' + getClassName(this.node)
            }
        },
        'PAREXPRESSION':    () => {
            if (this.node.isTuple == true) {
                return '(' + this.node.content.map( node => outputNode(node)).join(', ') + ')'
            } else {
                return '(' + this.node.content.map( node => outputNode(node)).join(', ') + ')'
            }
        },
        'INDEXEXPRESSION':      () => {
            if (this.treatIndexAsGeneric == true) return this.outputs['GENERICEXPRESSION']()
            else {
                if (this.node.isTuple == true) {
                    return '[' + this.node.content.map( node => outputNode(node)).join(', ') + ']'
                } else {
                    return '[' + this.node.content.map( node => outputNode(node)).join(', ') + ']'
                }
            }
        },
        'GENERICEXPRESSION':    () => {
            if (this.node.isTuple == false)
                return '<' + this.node.content.map( node => outputNode(node, {treatIndexAsGeneric: true})).join(' ') + '>'
            else
                return '<' + this.node.content.map( node => outputNode(node, {treatIndexAsGeneric: true})).join(', ') + '>'
        },
        'EXPRESSION':   () => {
            return this.node.content.map( node => outputNode(node)).join(' ')
        },
        'default':      () => {
            console.log(this.node)
            throw 'Unknown node type: ' + this.node.type
        }
    }
}


let macros = {
    'o':    'let',
    'my':   'this.'
}

function macrofy(str) {
    console.log(`Macrofying ${str}`)
    if (macros[str] == null) return str
    return macros[str]
}



