
String.prototype.toJsonObject = function() { return this }

class Expression {
    constructor(parent, content, type) {
        this.parent = parent
        this.content = content
        this.accessModifiers = []
        this.type = type
        this.isTuple = false
    }
    toString() {
        let mods = this.accessModifiers.join(' ')
        if (this.accessModifiers.length > 0) mods = '[' + mods + '] '
        if (this.isTuple && this.accessModifiers.length > 0) {
            console.log('Appending. Acces mods:')
            console.log(this.accessModifiers)
            mods += ' || '
        }
        let contentStrings = this.content.map( elem => elem.toString() )
        switch (this.type) {
            case 'expression':
            case 'EXPRESSION':
                if (this.isTuple) {
                    return '(' + mods + contentStrings.join(', ') + ')'
                } else {
                    return '(' + mods + contentStrings.join(' ') + ')'
                }
            case 'PAREXPRESSION':
                if (this.isTuple) {
                    return '(' + mods + contentStrings.join(', ') + ')'
                } else {
                    return '(' + mods + contentStrings.join(' ') + ')'
                }
            case 'INDEXEXPRESSION':
                if (this.isTuple) {
                    return '[' + mods + contentStrings.join(', ') + ']'
                } else {
                    return '[' + mods + contentStrings.join(' ') + ']'
                }
            case 'attribution':
                if (contentStrings.length == 0) throw 'Error: Attribution expression has no content.'
                if (contentStrings.length == 1) throw 'Error: Attribution expression has no right side content.'
                if (contentStrings.length > 2)  throw 'Error: Attribution expression has too many content elements.'
                if (this.accessModifiers.length > 0) throw 'Error: Attribution is not supposed to have access modifiers ' + mods
                return '(' + mods + contentStrings[0] + ' = ' + contentStrings[1] + ')'
            default:
                console.log(`WARNING: Expression type '${this.type}' not handled. Returning as normal expression`)
                return '(' + mods + contentStrings.join(' ') + ')'
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

export { Expression, Node }