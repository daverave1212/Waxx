

Words = require('./Words')
Grammar = require('./Grammar')
Splitter = require('./Splitter')
Parenthesiser = require('./Parenthesiser')
Collapser = require('./Collapser')
Parser = require('./Parser').Parser


//fs = require('fs')

function getLines(){
    //return Words.readFileIntoLines('Test.waxx')
    return document.getElementById('TextArea').value.split('\n')
}

function go() {
    let stringLines = getLines()

    let wordLines = Splitter.splitLines(stringLines, Grammar.operators, Grammar.separators)
    console.log(`Wordlines 0:`)
    console.log(wordLines[0].toString())

    wordLines = Parenthesiser.parenthesise(wordLines)
    wordLines = Collapser.collapseParentheses(wordLines)
    wordLines = Parenthesiser.parenthesise(wordLines)

    

    console.log(new Parser(wordLines[0]).parse())
}


// fs.writeFile('logs.json', )
