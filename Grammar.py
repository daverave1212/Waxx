

operators = ['!=', '!', '.', ',', '==', '<=', '>=', '(', ')', '[', ']', '=', '+', '-', '*', '/', ';', ':', '<', '>']

separators = [
    ['"', '"'],
    ["'", "'"],
    ['/*', '*/']
]

flowControlConditions = ['if', 'else', 'elif', 'while']

def isStringOperator(string):
    return string in operators