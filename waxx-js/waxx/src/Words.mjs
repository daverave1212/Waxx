
import { spaces } from './Utils.mjs'

function readFileIntoLines(fileName){
    return fs.readFileSync(fileName, 'utf8').split(os.EOL)
}

class Word {

    string   = null
    pairLine = null     // Assigned later by Parenthesiser
    pairWord = null     // Assigned later by Parenthesiser
    type     = null     // Assigned later by WordTypeAssigner

    constructor(string) {
        this.string = string
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

    toTypeString() {
        return spaces(this.indentation) + this.words.map( word => word.type ).join(' ')
    }
}


export { readFileIntoLines, Word, WordLine }