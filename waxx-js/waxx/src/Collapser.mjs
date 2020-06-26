

import { Word, WordLine } from './Words.mjs'


// Parses tokens; when it finds a parenthesis and it's pair is on a different line,
//  adds all the tokens between them to the line where the first parenthesis opens.
// That way, all parentheses start and end on the same line.
function collapseParentheses(wordLines) {
    let newWordLines = []
    let state = 'reading-code'
    let currentWordLine = null
    let nestEndLine = null
    let nestEndWord = null

    for (let i = 0; i < wordLines.length; i++) {
        let wordLine = wordLines[i]

        if (state == 'reading-code')
            currentWordLine = new WordLine(wordLine.indentation, [], wordLine.lineNumber)
        if (wordLine.getLength() == 0) {
            continue
        }

        for (let j = 0; j < wordLine.words.length; j++) {
            let word = wordLine.words[j]

            if (state == 'reading-code') {
                currentWordLine.words.push(word)
                if (word.hasPair()) {
                    state = 'reading-nest'
                    nestEndLine = word.getMatchingPair().pairLine
                    nestEndWord = word.getMatchingPair().pairWord
                }
            } else if (state == 'reading-nest') {
                currentWordLine.words.push(word)
                if (i == nestEndLine && j == nestEndWord) {
                    state = 'reading-code'
                }
            }
        }

        if (state == 'reading-code') {
            newWordLines.push(currentWordLine)
        }

    }

    return newWordLines

}


export { collapseParentheses }
