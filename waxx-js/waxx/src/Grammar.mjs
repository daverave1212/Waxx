

export let operators = ['!=', '?.', '!', '.', ',', '==', '<=', '>=', '(', ')', '[', ']', '=', '+', '-', '*', '/', ';', ':', '<', '>', '|', '{', '}']

export let keywordTypeMapping = {
    'if':           'FLOWCONTROL',
    'elif':         'FLOWCONTROL',
    'while':        'FLOWCONTROL',
    'for':          'FLOWCONTROL',
    'switch':       'FLOWCONTROL',
    'public':       'MODIFIER',
    'private':      'MODIFIER',
    'protected':    'MODIFIER',
    'inline':       'MODIFIER',
    'final':        'MODIFIER',
    'static':       'MODIFIER',
    'override':     'MODIFIER',
    'o':            'VAR',
    'overhead':     'OVERHEAD',
    'class':        'CLASS',
    'data':         'DATA',
    'func':         'FUNC',
    'yaml':         'YAML',
    'else':         'ELSE',
    'constructor':  null
}

export let operatorTypeMapping = {
    '[': '[',
    ']': ']',
    '(': '(',
    ')': ')',
    '=': '=',
    ':': ':',
    ',': ',',
    '|': '|',
    '{': '{',
    '}': '}',
    '?.': '?.',
    '.': '.',
}
for (let key of Object.keys(operators)) {
    if (operatorTypeMapping[key] == null) {
        operatorTypeMapping[key] = 'OPERATOR'
    }
}


export let separators = [
    ['"', '"'],
    ["'", "'"],
    ['/*', '*/'],
    ['`', '`']
]

export let flowControlConditions = ['if', 'elif', 'while', 'for', 'switch']

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
    '|': '|',
    '{': '{',
    '}': '}',
    '?.': '?.',
    '.': '.',
    'o': 'VAR',
    'overhead': 'OVERHEAD',
    'class': 'CLASS',
    'data': 'DATA',
    'func': 'FUNC',
    'yaml': 'YAML',
    'else': 'ELSE',
    'constructor': null
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


