
Uitls = require('./Utils')

class Scope {
    constructor(parent, expression, content, indentation=0) {
        this.expression = expression
        this.content = content
        this.parent = parent
        this.indentation = indentation
    }

    toString() {
        let ret = Utils.spaces(this.indentation) + this.expression.toString() + '\n'
        if (this.content.length > 0) {
            ret += this.content.map( scope => scope.toString() ).join('\n')
            ret += '\n'
        }
        return ret
    }
}




function scopify(expressionsWithIndentation) {
    let wrapperScope = new Scope(null, null, [], -1)
    let previousScope = wrapperScope

    for (let expr of expressionsWithIndentation) {

        if (expr.indentation < previousScope.indentation) {
            while (expr.indentation < previousScope.indentation) {
                previousScope = previousScope.parent
            }
        }

        if (expr.indentation > previousScope.indentation) {
            let scope = new Scope(previousScope, expr.expression, [], expr.indentation)
            previousScope.content.push(scope)
            previousScope = scope
        } else if (expr.indentation == previousScope.indentation) {
            let parent = previousScope.parent
            let scope = new Scope(parent, expr.expression, [], expr.indentation)
            parent.content.push(scope)
            previousScope = scope
        } else {
            console.log('Scope Error: this should not have happened')
        }

    }

    return wrapperScope
}


module.exports = {
    Scope : Scope,
    scopify : scopify
}

__requirer['Scoper'] = module.exports
__requirer['./Scoper'] = module.exports
