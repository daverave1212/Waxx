

Words = require('./Words')
Grammar = require('./Grammar')
Splitter = require('./Splitter')
Parenthesiser = require('./Parenthesiser')
Collapser = require('./Collapser')
Parser = require('./Parser').Parser
Scoper = require('./Scoper')


//fs = require('fs')

function getLines(){
    //return Words.readFileIntoLines('Test.waxx')
    return document.getElementById('TextArea').value.split('\n')
}

function go() {
    let stringLines = getLines()

    let wordLines = Splitter.splitLines(stringLines, Grammar.operators, Grammar.separators)
    wordLines = Parenthesiser.parenthesise(wordLines)
    wordLines = Collapser.collapseParentheses(wordLines)
    wordLines = Parenthesiser.parenthesise(wordLines)

    let expressionsWithIndentation = parseWordLines(wordLines)

    let baseScope = Scoper.scopify(expressionsWithIndentation)
    console.log(baseScope.toJsonObject())
    console.log(baseScope.toString())

}


// fs.writeFile('logs.json', )
