
import { spaces } from '../Utils.mjs'

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

function pythonizeParametersWithSelf(parameters) {
    if (parameters.startsWith('(')) {
        return '(self, ' + parameters.substring(1)
    } else {
        throw 'Strange argument given to pythonizeParametersWithSelf'
    }
}

function deparenthesizeString(str) {
    if (str.startsWith('(') && str.endsWith(')')) return str.substring(1, str.length - 1)
    else return str
}

export class LanguageOutputter {

    macros = {
        'o':        '',
        'my':       'self.',
        'is':       '==',
        'new':      '',
        'null':     'None',
        'true':     'True',
        'false':    'False'
    }

    getDataDeclaration({indentation, className, fields, expression}) {

        function getCloneFunction() {
            let ret = spaces(indentation + 4) + 'def clone(self):\n'
            ret += spaces(indentation + 8) + '__clone = ' + className + '()\n'
            for (let {name, type, value} of fields) {
                ret += spaces(indentation + 8) + `__clone.${name} = self.${name}\n`
            }
            ret += spaces(indentation + 8) + 'return __clone\n'
            return ret
        }

        let ret = `class ${className}:\n`
        for (let {name, type, value} of fields) {
            ret += spaces(indentation + 4) + name /*+ (type==null ? '' : ' : ' + type)*/ + (value==null ? '' : ' = ' + value) + '\n'
        }
        ret += getCloneFunction()
        return ret
    }

    getOverhead(path) { return  `# Overhead "${path}" not supported in Python (yet)` }

    getFunctionDeclaration({modifiers, name, generic, parameters, expression}) {
        for (let mod of modifiers) {
            if (mod == 'private') error('Python does not support private fields.')
            if (mod == 'public') continue
            if (mod == 'static') continue
        }
        if (generic != null) error('Python does not support generics.')
        
        let finalParameters = '' 
        let outputParameter = par => (par.value == null) ? (par.name) : (par.name + ' = ' + par.value)
        if (isExpressionInClassScope(expression) && !modifiers.includes('static')) {
            finalParameters = '(' + [{name: 'self'}, ...parameters].map(p => outputParameter(p)).join(', ') + ')'
        } else {
            finalParameters = '(' + parameters.map(p => outputParameter(p)).join(', ') + ')'
        }

        return 'def ' + name + finalParameters    
    }

    getVarDeclaration({modifiers, name, type, expression}) {
        for (let mod of modifiers) {
            if (mod == 'private') error('Python does not support private fields.')
            if (mod == 'export') error('Export is in JavaScript, partner, not Python.')
            if (mod == 'public') continue
            if (mod == 'static') continue
        }
        return name
    }

    getFlowControlExpression({name, inner, expression}) {               // Name is 'if', 'while', etc. inner is the processed expression, with parentheses
        return name + ' ' + deparenthesizeString(inner)
    }

    getElseExpression({expression}) {
        return 'else'
    }

    getYAMLExpression({key, value}) {                                   // How to output code like: "age: 20"; key and value are strings, already processed
        if (value != null) return key + ': ' + value + ','              // If value is null, then it's a nested object next
        else return key + ':'
    }

    outputScopeLine({indentation, scopeLine, hasChildren, scope}) {     // How to output a normal scope line. scopeLine is already processed. scope is an optional argument, if you need it
        if (hasChildren && !scopeLine.trim().endsWith(':')) {
            return spaces(indentation) + scopeLine + ':'
        } else {
            return spaces(indentation) + scopeLine
        }
    }

    getInlineIfExpression({condition, ifStatement, elseStatement}) {
        return '(' + ifStatement + ') if (' + condition + ') else (' + elseStatement + ')'
    }
    
    endScope({baseIndentation, scope}) {                                // How to handle the closing of a scope. In JS, it's just a closed bracket on the same indentation level as the scope's line
        return ''
    }

}


//let ret = this.mods + ' function /*' + generic + '*/ ' + getFuncName(this.node) + params

//let ret = this.mods + ' function ' + getFuncName(this.node) + params