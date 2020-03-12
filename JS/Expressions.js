
String.prototype.toJsonObject = function() { return this }

class Expression {
    constructor(parent, content, type) {
        this.parent = parent
        this.content = content
        this.accessModifiers = []
        this.type = type
    }
    toString() {
        let mods = this.accessModifiers.join(' ')
        if (mods.length > 0) mods = '[' + mods + '] '
        let contentStrings = this.content.map( elem => elem.toString() )
        switch (this.type) {
            case 'expression':
                return mods + '(' + contentStrings.join(' ') + ')'
            case 'attribution':
                if (contentStrings.length == 0) throw 'Error: Attribution expression has no content.'
                if (contentStrings.length == 1) throw 'Error: Attribution expression has no right side content.'
                if (contentStrings.length > 2)  throw 'Error: Attribution expression has too many content elements.'
                if (this.accessModifiers.length > 0) throw 'Error: Attribution is not supposed to have access modifiers ' + mods
                return mods + '(' + contentStrings[0] + ' = ' + contentStrings[1] + ')'
            default:
                console.log(`WARNING: Expression type '${this.type}' not handled. Returning as normal expression`)
                return mods + '(' + contentStrings.join(' ') + ')'
        }
    }
}

class Node {
    constructor(content, type='none') {
        this.content = content
        this.type = type
    }
    toString() { return this.content }
}

module.exports = {
    Expression : Expression
}

__requirer['./Expressions'] = module.exports
__requirer['Expressions'] = module.exports