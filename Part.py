'''
Part types:
EXPRESSION
    CONDITION
ATOM
CONDITION-FLOW
OPERATOR
    BLOCK-END


'''


import Utils

class Part:
    def __init__(self, content, type, subtype=None, isComposite=False):
        self.content = content  # Can be either a str or a list of parts
        self.type = type        # Ex, EXPRESSION
        self.subtype = None     # Ex, if it's EXPRESSION, it could be a TUPLE or ARITHMETIC
        self.isComposite = isComposite    # If the content is just a string, the False; Else, if it contains more parts, True
    def toString(self):
        if self.type == 'EXPRESSION':
            if self.subtype is not None:
                return self.type + '.' + self.subtype
            else:
                return self.type
        elif type(self.content) == list:
            return ' '.join(map(lambda word : word.toString(), self.content))
        else:
            return str(self.content)

class PartLine:
    def __init__(self, indentation, lineNumber, parts):
        self.parts = parts
        self.indentation = indentation
        self.lineNumber = lineNumber

    def toString(self):
        ret = ' ' * self.indentation
        for part in self.parts:
            ret += part.toString() + ' '
        return ret

    def find(self, string):
        for i, part in enumerate(self.parts):
            if part.content == string:
                return i
        return None

    ''' Finds on the given parenthesis level '''
    def findOnLevel(self, string, level):   # level = parenthesis level
        currentLevel = 0
        for i, part in enumerate(self.parts):
            if part.content == '(':
                currentLevel += 1
            elif part.content == ')':
                currentLevel -= 1
            if part.content == string and currentLevel == level:
                return i
        return None

def printPartLines(partLines):
    for partLine in partLines:
        print(partLine.toString())

def partListToString(partList):
    return ' '.join(map(lambda p : p.toString(), partList))




def wordToPart(word):
    

def wordLineToPartLine(wordLine):
    partLine = PartLine(indentation=wordLine.indentation, )