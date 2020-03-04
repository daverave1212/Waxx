

operators = ['!=', '!', '.', ',', '==', '<=', '>=', '(', ')', '[', ']', '=', '+', '-', '*', '/', ';', ':', '<', '>']

separators = [
    ['"', '"'],
    ["'", "'"],
    ['/*', '*/']
]

flowControlConditions = ['if', 'else', 'elif', 'while']

accessModifiers = [
    'public',
    'private',
    'protected',
    'inline',
    'final',
    'static',
    'override'
]

def isStringOperator(string):
    return string in operators

def isAccessModifier(string):
    return string in accessModifiers