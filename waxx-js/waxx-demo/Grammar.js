

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

let tokenTypeMapping = {
    '[': '[',
    ']': ']',
    '(': '(',
    ')': ')',
    '=': '=',
    ':': ':',
    ',': ',',
    'o': 'VAR',
    'overhead': 'OVERHEAD',
    'class': 'CLASS',
    'func': 'FUNC'
}

let isString = (str) => str[0] == '"' || str[0] == "'"
let isNativeCode = (str) => str[0] == "`"

export function getTokenType(string) {
    if (string == null || string.length == 0)        throw 'Error: string is empty or null'
    if (tokenTypeMapping[string] != null)            return tokenTypeMapping[string]
    if (isString(string))                            return 'STRING'
    if (isNativeCode(string))                        return 'NATIVECODE'
    if (this.operators.includes(string))             return 'OPERATOR'
    if (this.flowControlConditions.includes(string)) return 'FLOWCONTROL'
    if (this.accessModifiers.includes(string))       return 'MODIFIER'
    return 'ATOM'
}


