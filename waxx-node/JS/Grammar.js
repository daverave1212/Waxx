

export let operators = ['!=', '!', '.', ',', '==', '<=', '>=', '(', ')', '[', ']', '=', '+', '-', '*', '/', ';', ':', '<', '>']

export let separators = [
    ['"', '"'],
    ["'", "'"],
    ['/*', '*/']
]

export let flowControlConditions = ['if', 'else', 'elif', 'while', 'for', 'switch']

export let accessModifiers = [
    'public',
    'private',
    'protected',
    'inline',
    'final',
    'static',
    'override'
]


export function isStringOperator(string){ return this.operators.includes(string) }

export function getTokenType(string) {        
    if (string == '<') return '<'
    if (string == '>') return '>'
    if (string == '(') return '('
    if (string == ')') return ')'
    if (string == '=') return '='
    if (string == ':') return ':'
    if (this.operators.includes(string)) return 'OPERATOR'
    if (this.flowControlConditions.includes(string)) return 'FLOWCONTROL'
    if (this.accessModifiers.includes(string)) return 'MODIFIER'
    if (string == 'class') return 'CLASS'
    if (string == 'func') return 'FUNC'
    return 'ATOM'
}


