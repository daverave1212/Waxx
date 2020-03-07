

Word = require('./Words').Word
WordLine = require('./Words').WordLine

function parenthesise(wordLines) {
    let parStack = []
    for(let i = 0; i < wordLines.length; i++){
        let line = wordLines[i]
        for(let j = 0; j < line.words.length; j++){
            let word = line.words[j]
            let string = word.string
            if (string == '(') {
                parStack.push({i, j})
            } else if (string == ')') {
                let openPos = parStack.pop()
                wordLines[openPos.i].words[openPos.j].pairLine = i
                wordLines[openPos.i].words[openPos.j].pairWord = j
                word.pairLine = openPos.i
                word.pairWord = openPos.j
            }
        }
    }
    return wordLines
}

module.exports.parenthesise = parenthesise