
import { spaces } from '../Utils.js'

let error = message => {
    alert(message)
    throw message
}

function isExpressionInClassScope(expression) {
    let isInClassScope
    let parentScope = expression.getScope().parent
    if (parentScope.expression == null) isInClassScope = false
    else if (parentScope.expression.type == 'CLASSDECLARATION') isInClassScope = true
    else isInClassScope = false
    return isInClassScope
}

export class LanguageOutputter {

    macros = {
        'o':        'var',
        'my':       'this.',
        'and':      '&&',
        'or':       '||',
        'print':    'trace',
        'is':       '=='
    }

    getDataDeclaration({indentation, className, fields, expression}) {

        function getCloneFunction() {
            let ret = spaces(indentation + 4) + 'clone() {\n'
            ret += spaces(indentation + 8) + 'var __clone = new ' + className + '();\n'
            for (let {name, type, value} of fields) {
                ret += spaces(indentation + 8) + `__clone.${name} = this.${name};\n`
            }
            ret += spaces(indentation + 8) + 'return __clone;\n'
            ret += spaces(indentation + 4) + '}\n'
            return ret
        }

        let ret = `class ${className} {\n`
        for (let {name, type, value} of fields) {
            ret += spaces(indentation + 4) + name + (type==null ? '' : ' : ' + type) + (value==null ? '' : ' = ' + value) + ';\n'
        }
        ret += getCloneFunction()
        ret += spaces(indentation) + '}'
        return ret
    }

    getOverhead(path) { return  `// Overhead "${path}" not supported in Haxe` }

    getFunctionDeclaration({modifiers, name, generic, parameters, expression}) {
        let mods = ''
        for (let mod of modifiers) {
            if (mod == 'private') mods += 'private '
            if (mod == 'public') mods += 'public '
            if (mod == 'static') mods += 'static '
        }
        if (generic != null) error('Haxe does not support function generics.')
        if (isExpressionInClassScope(expression)) {
            return mods + 'function ' + name + parameters
        } else {
            return mods + 'function ' + name + parameters
        }
    }

    getVarDeclaration({modifiers, name, type, expression}) {
        if (type == null) console.log('Is null')
        let mods = ''
        for (let mod of modifiers) {
            if (mod == 'private') mods += 'private '
            if (mod == 'public') mods += 'public '
            if (mod == 'static') mods += 'static '
            if (mod == 'export') mods += 'export '
            if (mod == 'export') mods += 'inline '
        }
        if (isExpressionInClassScope(expression)) {
            return mods + 'var ' + name + (type==null ? '' : ' : ' + type)
        } else {
            return mods + 'var ' + name + (type==null ? '' : ' : ' + type)
        }
    }

    getFlowControlExpression({name, inner, expression}) {               // Name is 'if', 'while', etc. inner is the processed expression, with parentheses
        return name + ' ' + inner
    }

    getYAMLExpression({key, value}) {                                   // How to output code like: "age: 20"; key and value are strings, already processed
        if (value != null) return key + ': ' + value + ','              // If value is null, then it's a nested object next
        else return key + ':'
    }

    outputScopeLine({indentation, scopeLine, hasChildren, scope}) {     // How to output a normal scope line. scopeLine is already processed. scope is an optional argument, if you need it
        let ret = spaces(indentation) + scopeLine
        if (hasChildren) ret += " {"
        else ret += ';'
        return ret
    }
    
    endScope({baseIndentation, scope}) {                                // How to handle the closing of a scope. In JS, it's just a closed bracket on the same indentation level as the scope's line
        return spaces(baseIndentation) + '}'
    }

}


//let ret = this.mods + ' function /*' + generic + '*/ ' + getFuncName(this.node) + params

//let ret = this.mods + ' function ' + getFuncName(this.node) + params