
import WordUtils as WU

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
        self.indentation = 0
    def toString(self):
        return f'#'
        return self.indentation + str(self.words)


def splitWordsIntoTokens(words):    # Takes a list of strings
    return None
