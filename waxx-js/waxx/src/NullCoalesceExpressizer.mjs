

import { doTimes } from './Utils.js'
import { Expression, Node  } from './Expressions.js'
import * as Grammar from './Grammar.js'

class NullCoalesceExpressizer {
    
    constructor(expression) {
        this.expression = expression
        this.newContent = []
    }

    backtrackNullCoalesce(fromPos) {
        let nodes = []
        for (let i = fromPos - 1; i >= 0; i--) {
            let node = this.expression.content[i]
            if (node.isExpression == true) {
                nodes.push(node)
            } else if (node.type == 'ATOM' || node.type == '.') {
                nodes.push(node)
            } else if (node.type == '?.') {
                nodes.push(new Node('.', Grammar.getTokenType('.')))
            } else {
                console.log(`Breaking at ${node}`)
                break
            }
        }
        return nodes.reverse()
    }

    parse() {
        for (let i = 0; i < this.expression.content.length; i++) {
            let node = this.expression.content[i]

            if (node.type == '?.') {
                let backNodes = this.backtrackNullCoalesce(i)
                console.log(`Found back nodes as: ${backNodes}`)
                doTimes(backNodes.length, _ => this.newContent.pop())
                let ifContent = [...backNodes, new Node('==', Grammar.getTokenType('==')), new Node('null', Grammar.getTokenType('null'))]
                let ifWrapperExpression = new Expression(
                    this.expression,
                    ifContent,
                    'PAREXPRESSION',
                    false
                )
                ifContent.map(n => n.parent = ifWrapperExpression)
                this.newContent.push(new Node('if', Grammar.getTokenType('if')))
                this.newContent.push(ifWrapperExpression)
                this.newContent.push(new Node(':', Grammar.getTokenType(':')))
                this.newContent.push(new Node('null', Grammar.getTokenType('null')))
                this.newContent.push(new Node('else', Grammar.getTokenType('else')))
                for (let backNode of backNodes) {
                    this.newContent.push(backNode.clone())
                }
                this.newContent.push(new Node('.', Grammar.getTokenType('.')))
            } else {
                this.newContent.push(nullCoalesceExpressize(node))
            }
        }
        this.expression.content = this.newContent
        return this.expression
    }

}


export function nullCoalesceExpressize(expression) {
    if (expression.isNode == true) return expression
    else {
        return new NullCoalesceExpressizer(expression).parse()
    }
}