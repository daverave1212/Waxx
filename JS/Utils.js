
function spaces(nSpaces) {
    let ret = ''
    for(let i = 1; i<=nSpaces; i++){
        ret += ' '
    }
    return ret
}

module.exports = {
    spaces : spaces
}