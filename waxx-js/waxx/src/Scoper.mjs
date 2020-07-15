
import { spaces } from './Utils.mjs'

// A scope represents 
class Scope {
    constructor(parent, expression, content, indentation=0) {
        this.expression = expression
        if (this.expression != null) this.expression.parent = this
        this.content = content
        this.parent = parent
        this.indentation = indentation
        this.type = 'SCOPE'
        this.isYAMLDefinition = false               // True if the line ended in "yaml:"
        this.isYAMLContent = false                  // True if it's under the scope of a "yaml:" line
    }

    toString() {
        let ret = spaces(this.indentation)
        if(this.expression != null) {
            ret += this.expression.toString()
        }
        ret += '\n'
        if (this.content.length > 0) {
            ret += this.content.map( scope => scope.toString() ).join('\n')
            ret += '\n'
        }
        return ret
    }

    toJsonObject() {
        return {
            expression : this.expression,
            content : this.content.map( scope => scope != null? scope.toJsonObject(): scope),
        }
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


export { Scope, scopify }