

export let operators = ['!=', '!', '.', ',', '==', '<=', '>=', '(', ')', '[', ']', '=', '+', '-', '*', '/', ';', ':', '<', '>']

export let separators = [
    ['"', '"'],
    ["'", "'"],
    ['/*', '*/'],
    ['`', '`']
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
    if (string == null || string.length == 0) throw 'Error: string is empty or null'
    if (string == '[') return '['
    if (string == ']') return ']'
    if (string == '(') return '('
    if (string == ')') return ')'
    if (string == '=') return '='
    if (string == ':') return ':'
    if (string == ',') return ','
    if (string == 'o' || string == 'var') return 'VAR'
    if (string == 'overhead') return 'OVERHEAD'
    if (string[0] == '"' || string[0] == "'") return 'STRING'
    if (string[0] == '`') return 'NATIVECODE'
    if (this.operators.includes(string)) return 'OPERATOR'
    if (this.flowControlConditions.includes(string)) return 'FLOWCONTROL'
    if (this.accessModifiers.includes(string)) return 'MODIFIER'
    if (string == 'class') return 'CLASS'
    if (string == 'func') return 'FUNC'
    return 'ATOM'
}


