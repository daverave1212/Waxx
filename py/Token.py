
import WordUtils as WU

from Utils import lastpos

from WordUtils import isNumber

____                    = 0
UNARY_OPERATOR_LEFT     = 1
UNARY_OPERATOR_RIGHT    = 2
BINARY_OPERATOR         = 3
ATOM                    = 4
COMMENT                 = 5
EXPRESSION              = 6


class Token:
    def __init__(self, type):
        self.type = type
        self.subtype = None





def parseSequence(line, start, end):
    i = start
    sequence = []
    while i < end:
        word = line[i]
        string = word.string
        if string == '(':
            parStart = i + 1
            parEnd   = word.parenthesisEnd
            content  = parseSequence(parStart, parEnd)
            token    = Token(EXPRESSION)
            token.content = content
            sequence.append(token)
            i = parEnd
        elif 


















class Tokenizer:

    def __init__(self, lines):
        self.currentLineIndex = 0
        self.currentWordIndex = -1
        self.word = None
        self.lines = lines

    def advanceLine(self, times=1):
        self.currentWordIndex += 1
        if self.currentWordIndex == len(self.lines[self.currentLineIndex]):
            self.currentWordIndex = -1
            self.currentLineIndex += 1
            self.word = None
            return False
        self.word = self.lines[self.currentLineIndex][self.currentWordIndex]
        return True

    def parenthesisToExpression(self, lineIndex, parStart, parEnd):
        expr = Token(EXPRESSION)
        content = self.lines[lineIndex][parStart + 1 : parEnd]


# Takes a list of Word



    