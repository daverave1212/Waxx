
import * as Words from './Words.js'
import * as Grammar from './Grammar.js'
import * as Splitter from './Splitter.js'
import * as Parenthesiser from './Parenthesiser.js'
import * as Collapser from './Collapser.js'
import * as Parser from './Parser.js'
import * as Scoper from './Scoper.js'
import * as Expressizer from './Expressizer.js'
import * as Outputter from './Outputter.js'



//fs = require('fs')

function getLines(){
    //return Words.readFileIntoLines('Test.waxx')
    return document.getElementById('TextArea').value.split('\n')
}

export function go(sourceCode) {
    //let stringLines = getLines()
    let stringLines = sourceCode.split('\n')

    let wordLines = Splitter.splitLines(stringLines, Grammar.operators, Grammar.separators)
    wordLines = Parenthesiser.parenthesise(wordLines)
    wordLines = Collapser.collapseParentheses(wordLines)
    wordLines = Parenthesiser.parenthesise(wordLines)

    

    let expressionsWithIndentation = Expressizer.expressizeWordLinesByParentheses(wordLines)


    let baseScope = Scoper.scopify(expressionsWithIndentation)
    Parser.parseScope(baseScope)
    console.log(baseScope.content)
    console.log(baseScope.toString())

    let myExpr = baseScope.content[0].expression
    console.log('let code...')
    //let code = Outputter.outputNode(myExpr)
    let code = Outputter.outputScope(baseScope)
    document.getElementById('Output').innerHTML = code

    console.log('Code: ' + code)

    return code
}


// fs.writeFile('logs.json', )
