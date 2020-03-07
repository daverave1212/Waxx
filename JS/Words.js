

let fs = require('fs')
let os = require('os')

let Utils = require('./Utils')
let spaces = Utils.spaces

function readFileIntoLines(fileName){
    return fs.readFileSync(fileName, 'utf8').split(os.EOL)
}

class Word {
    constructor(string) {
        this.string = string
        this.pairLine = null
        this.pairWord = null
    }

    toString() { return this.string }
    hasPair() { return this.pairWord != null }
    getMatchingPair() { return {pairLine: this.pairLine, pairWord: this.pairWord} }
}

class WordLine {
    constructor(indentation, words, lineNumber=null) {
        this.indentation = indentation
        this.words = words
        this.lineNumber = lineNumber
    }

    getLength() { return this.words.length }
    toString(fromPos=0, toPos=null) {
        if (toPos == null) toPos = this.words.length
        let strings = this.words.map( word => word.toString() )
        strings = strings.slice(fromPos, toPos)
        return spaces(this.indentation) + strings.join(' ')
    }
}


module.exports = {
    readFileIntoLines : readFileIntoLines,
    Word : Word,
    WordLine : WordLine
}