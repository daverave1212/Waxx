
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
        'o':    'let',
        'my':   'this.',
        'and':  '&&',
        'or':   '||',
        'print':    'console.log',
        'is':   '=='
    }

    getOverhead(path) { return  `// Overhead "${path}" not supported in JavaScript` }

    getFunctionDeclaration({modifiers, name, generic, parameters, expression}) {
        let mods = ''
        console.log('Modifiers for ' + name)
        console.log(modifiers)
        for (let mod of modifiers) {
            if (mod == 'private') error('JavaScript does not support private fields.')
            if (mod == 'public') continue
            if (mod == 'static') mods += 'static '
        }
        if (generic != null) error('JavaScript does not support generics.')
        if (isExpressionInClassScope(expression)) {
            return mods + name + parameters
        } else {
            return mods + 'function ' + name + parameters
        }
    }

    getVarDeclaration({modifiers, name, type, expression}) {
        let mods = ''
        for (let mod of modifiers) {
            if (mod == 'private') error('JavaScript does not support private fields.')
            if (mod == 'public') continue
            if (mod == 'static') mods += 'static '
            if (mod == 'export') mods += 'export '
        }
        if (type != null) error('JavaScript does not support variable types.')
        if (isExpressionInClassScope(expression)) {
            return mods + name
        } else {
            return mods + ' let ' + name
        }
    }

    getFlowControlExpression({name, inner, expression}) {
        return name + ' ' + inner
    }

}


//let ret = this.mods + ' function /*' + generic + '*/ ' + getFuncName(this.node) + params

//let ret = this.mods + ' function ' + getFuncName(this.node) + params