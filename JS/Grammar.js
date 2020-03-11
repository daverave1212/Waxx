
module.exports = {
    operators : ['!=', '!', '.', ',', '==', '<=', '>=', '(', ')', '[', ']', '=', '+', '-', '*', '/', ';', ':', '<', '>'],
    separators : [
        ['"', '"'],
        ["'", "'"],
        ['/*', '*/']
    ],
    flowControlConditions : ['if', 'else', 'elif', 'while'],
    accessModifiers : [
        'public',
        'private',
        'protected',
        'inline',
        'final',
        'static',
        'override'
    ],


    isStringOperator(string){ return this.operators.includes(string) },
    getTokenType(string) {        
        if (string == '<') return '<'
        if (string == '>') return '>'
        if (string == '(') return '('
        if (string == ')') return ')'
        if (this.operators.includes(string)) return 'OPERATOR'
        if (this.flowControlConditions.includes(string)) return 'FLOW-CONTROL-KEYWORD'
        if (this.accessModifiers.includes(string)) return 'MODIFIER'
        if (string == 'class') return 'CLASS'
        return 'ATOM'
    }
}


__requirer['Grammar'] = module.exports
__requirer['./Grammar'] = module.exports
