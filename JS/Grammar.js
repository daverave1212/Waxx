
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
    isAccessModifier(string){ return this.accessModifiers.includes(string) }
}
