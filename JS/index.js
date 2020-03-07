

Words = require('./Words')
Grammar = require('./Grammar')
Splitter = require('./Splitter')
Parenthesiser = require('./Parenthesiser')
Collapser = require('./Collapser')

fs = require('fs')


let stringLines = Words.readFileIntoLines('Test.waxx')

let wordLines = Splitter.splitLines(stringLines, Grammar.operators, Grammar.separators)
wordLines = Parenthesiser.parenthesise(wordLines)
wordLines = Collapser.collapseParentheses(wordLines)
wordLines = Parenthesiser.parenthesise(wordLines)


// fs.writeFile('logs.json', )

for (let line of wordLines) {
    console.log(line.toString())
}