
import { Word, WordLine } from './Words.js'
import { Expression, Node } from './Expressions.js'

// For each word, sets its
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


function wordsToExpression(words) {
    let expression = new Expression(null, [], 'EXPRESSION')
    for (let i = 0; i<words.length; i++) {
        let word = words[i]
        if (word.hasPair()) {
            let pairWord = word.pairWord
            let slicedWords = words.slice(i+1, word.pairWord)
            let newExpression = wordsToExpression(slicedWords)
            expression.content.push(newExpression)
            i = pairWord
        } else {
            expression.content.push(new Node(word.string, word.type))
        }
    }
    return expression
}

function expressizeLineByParentheses(wordLine) {
    return {expression: wordsToExpression(wordLine.words), indentation: wordLine.indentation}
}

function expressizeWordLinesByParentheses(wordLines) {
    return wordLines.map( wordLine => expressizeLineByParentheses(wordLine) )
}

export { parenthesise, expressizeWordLinesByParentheses }