
import * as Grammar from './Grammar.mjs'
import * as Splitter from './Splitter.mjs'
import * as Parenthesiser from './Parenthesiser.mjs'
import * as Collapser from './Collapser.mjs'
import * as WordTypeAssigner from './WordTypeAssigner.mjs'

import * as Parser from './Parser.mjs'
import * as Scoper from './Scoper.mjs'
import * as Expressizer from './Expressizer.mjs'

import * as NullCoalesceExpressizer from './NullCoalesceExpressizer.mjs'

import * as Outputter from './Outputter.mjs'

import * as JSLanguage from './languages/JSOutput.mjs'
import * as PythonLanguage from './languages/PythonOutput.mjs'
import * as HaxeLanguage from './languages/HaxeOutput.mjs'

export function go(sourceCode, languageString) {
    let stringLines = sourceCode.split('\n')    // Get the source code and split it into lines for parsing

    let wordLines = Splitter.splitLines(stringLines, Grammar.operators, Grammar.separators)     // Each line is split into tokens
    wordLines = Parenthesiser.parenthesise(wordLines)                                           // Setup parenthesis pairs for quicker parsing later
    wordLines = Collapser.collapseParentheses(wordLines)                                        // Pair parentheses in which each is on a different line are 'collapsed' into one single line. See the script for more info.
    wordLines = Parenthesiser.parenthesise(wordLines)                                           // Setup parentheses pairs again, because their lines/positions were modified in the previous step.
    wordLines = WordTypeAssigner.assignTypesToWordsInWordLines(wordLines)                       // Setup the type of each word according to the Grammar using a dictionary of strings and some simple checks

    //console.log({wordLines})

    let expressionsWithIndentation = Expressizer.expressizeWordLinesByParentheses(wordLines)    // The first part of parsing. Simple Words become Nodes. Everything between parentheses becomes an Expression containing those Nodes or other Expressions (recursively)
    //console.log(expressionsWithIndentation.map(ewi => ewi.expression))
    
    expressionsWithIndentation = expressionsWithIndentation.map(({expression, indentation}) => ({
        indentation: indentation,
        expression: NullCoalesceExpressizer.nullCoalesceExpressize(expression)
    }))

    //console.log(expressionsWithIndentation.map(ewi => ewi.expression))

    let baseScope = Scoper.scopify(expressionsWithIndentation)                                  // Takes the expressions generated and just puts them in a hierarchy based on their indentation, like python code.

    Parser.parseScope(baseScope)                                        // Transforms tokens into abstract expression trees based on rules. This is the bread and butter of the code.

    //console.log('Base scope content:')
    console.log(baseScope.content)

    let language = null
    switch (languageString.toLowerCase()) {
        case 'js':
        case 'javascript':
            language = new JSLanguage.LanguageOutputter()
            break
        case 'py':
        case 'python':
            language = new PythonLanguage.LanguageOutputter()
            break
        case 'hx':
        case 'haxe':
            language = new HaxeLanguage.LanguageOutputter()
            break
        default:
            throw `Unknown language given: ${languageString}`
    }

    let code = Outputter.outputScope(baseScope, language)
    
    return code
}
