
import WordUtils as WU

____                    = 0
UNARY_OPERATOR_LEFT     = 1
UNARY_OPERATOR_RIGHT    = 2
BINARY_OPERATOR         = 3
ATOM                    = 4
COMMENT                 = 5


class Token:
    def __init__(self, content, type):
        self.content = content
        self.type = type

class Line:
    def __init__(self, indentation, tokens):
        self.indentation = indentation
        self.tokens = tokens

class StringLine:
    def __init__(self, indent, theList=[]):
        self.words = theList
        self.indentation = indent
    def toString(self):
        return WU.spaces(self.indentation) + '  '.join(self.words)


class Tokenizer:

    def __init__(self, lines):
        self.currentLine = 0
        self.currentWord = -1
        self.lines = lines
    
    '''
    def advance(self, times=1):
        self.currentWord += 1
        if self.currentWord == len(self.lines[self.currentLine]):
            self.currentWord = 0
            self.currentLine += 1
            if self.currentLine == len(self.lines):
                print('Finished tokenizing')
                return False
            elif:
                while len(self.currentLine) == 0:
                    self.currentLine += 1
                    if self.currentLine == len(self.lines):
                        print('Reached end of lines')
                        return False
        return True
    '''

    def advanceLine(self, times=1):
        self.currentWord += 1
        if self.currentWord == len(self.lines[self.currentLine]):
            self.currentWord = -1
            self.currentLine += 
            return False
        return True

    def tokenizeNextLine(self):         # Tokenizes one single line
        while self.advance():


