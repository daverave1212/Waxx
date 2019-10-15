import WordUtils as WU
import Utils as U
import Fake
from Utils import lastpos
from Utils import isBlank
from Utils import isOperator

print   = WU.rewritePrint(print)
map     = U.rewriteMap(map)


# States for the following function
BLANKS     = 1      # Reading blanks
WORDS      = 2      # Reading words
OPERATORS  = 3      # Reading operators
STRING     = 4      # Reading string or comment of some sort



def startsString(text, position, separators):
    sepsStart = map(lambda pair : pair[0], separators)
    result = WU.isAnySubstringAt(sepsStart, text, position)
    if result != None:
        return separators[result]
    return None
    
def endsString(text, position, separator):
    result = WU.isSubstringAt(separator, text, position)
    if result != None:
        return result
    return None


class Splitter:
    def __init__(self, text, operators, separators):
        self.operators  = operators
        self.separators = separators
        self.text  = text
        self.words = []
        self.currentPos = -1
        self.char  = None
        self.indentation = 0
        self.state = BLANKS
        self.theOperator = None
        self.theSeparatorPair = None

    def pushWord(self, start, end):
        self.words.append(self.text[start:end])

    def isAtAnOperator(self):
        self.theOperator = isOperator(self.text, self.currentPos, self.operators)
        return self.theOperator != None

    def isAtStringStart(self):
        self.theSeparatorPair = startsString(self.text, self.currentPos, self.separators)
        return self.theSeparatorPair != None

    def isAtStringEnd(self):
        return endsString(self.text, self.currentPos, self.theSeparatorPair[1])



    def findIndentation(self):
        while self.advance():
            if self.char == ' ':
                self.indentation += 1
            elif self.char == '\t':
                self.indentation += 4
            else:
                self.advance(-1)
                break


    def stepBlank(self):
        if isBlank(self.char):      # Space
            pass
        elif self.isAtAnOperator(): # Operator
            endPos = self.currentPos + len(self.theOperator)
            self.pushWord(self.currentPos, endPos)
            skips  = len(self.theOperator) - 1
            self.advance(skips)
        elif self.isAtStringStart():
            self.start = self.currentPos
            self.state = STRING
        else:                       # Word
            self.start = self.currentPos
            self.state = WORDS
    
    def stepWord(self):
        if isBlank(self.char):
            self.pushWord(self.start, self.currentPos)
            self.state = BLANKS
        elif self.isAtAnOperator():
            self.pushWord(self.start, self.currentPos)
            endPos = self.currentPos + len(self.theOperator)
            self.pushWord(self.currentPos, endPos)
            skips  = len(self.theOperator) - 1
            self.state = BLANKS
            self.advance(skips)
        elif self.isAtStringStart():
            self.start = self.currentPos
            self.state = STRING
        else:
            pass

    def stepString(self):
        if self.isAtStringEnd():
            self.pushWord(self.start, self.currentPos + len(self.theSeparatorPair[1]))
            self.state = BLANKS
            skips  = len(self.theSeparatorPair[1]) - 1
            self.advance(skips)
        else:
            pass
        

    def splitLine(self):
        text  = self.text
        while self.advance():
            if self.state is BLANKS:
                self.stepBlank()
            elif self.state is WORDS:
                self.stepWord()
            elif self.state is STRING:
                self.stepString()

        if self.state is WORDS:
            self.pushWord(self.start, len(self.text))
        elif self.state is STRING:
            self.pushWord(self.start, len(self.text))

    def advance(self, times=1):
        self.currentPos += times
        if self.currentPos == len(self.text):
            self.char = None
            return False
        else:
            self.char = self.text[self.currentPos]
            return True

    # Returns a list of StringLine objects
    def getResult(self):
        return WU.StringLine(self.indentation, self.words)

    def parse(self):
        self.findIndentation()
        self.splitLine()
        return self.getResult()

def readFileAndSplit(fileName):
    lines = WU.readFileIntoLines(fileName)
    lines = map(lambda line : Splitter(line, Fake.operators, Fake.separators).parse(), lines)
    strLines = map(lambda line : line.toString(), lines)
    print(strLines)
    return lines

