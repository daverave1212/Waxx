

export class LanguageOutputter {

    getOverhead(path) { return  `// Overhead "${path}" not supported in JavaScript` }

    getFunctionDeclaration({modifiers, name, generic, parameters, expression}) {
        let isInClassScope
        let parentScope = expression.getScope().parent
        if (parentScope.expression == null) isInClassScope = false
        else if (parentScope.expression.type == 'CLASSDECLARATION') isInClassScope = true
        else isInClassScope = false
        let mods = ''
        console.log('Modifiers for ' + name)
        console.log(modifiers)
        for (let mod of modifiers) {
            if (mod == 'private') throw 'JavaScript does not support private fields.'
            if (mod == 'public') continue
            if (mod == 'static') mods += 'static '
        }
        if (generic != null) throw 'JavaScript does not support generics.'
        if (isInClassScope) {
            return mods + name + parameters
        } else {
            return mods + 'function ' + name + parameters
        }
    }

}


//let ret = this.mods + ' function /*' + generic + '*/ ' + getFuncName(this.node) + params

//let ret = this.mods + ' function ' + getFuncName(this.node) + params