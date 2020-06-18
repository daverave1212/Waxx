
const capitalize = (s) => {
    if (typeof s !== 'string') return ''
    return s.charAt(0).toUpperCase() + s.slice(1)
  }

function dashCaseToCamelCase(dashCase) {    // Ex: my-nice-function = myNiceFunction
    let parts = dashCase.split('-')
    if (parts.length == 1) return dashCase
    let firstWord = parts[0]
    parts = parts.slice(1)
    return firstWord + parts.map( str => capitalize(str) ).join('')
}

function spaces(nSpaces) {
    let ret = ''
    for(let i = 1; i<=nSpaces; i++){
        ret += ' '
    }
    return ret
}

function isSpace(text) {
    return (text.trim().length == 0)
}

export { spaces, dashCaseToCamelCase, capitalize, isSpace }