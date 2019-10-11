from Token import *
import WordUtils as WU
import Fake
from Utils import lastpos

print = WU.rewritePrint(print)


# States for the following function
BLANKS     = 1      # Reading blanks
WORDS      = 2      # Reading words
OPERATORS  = 3      # Reading operators
STRING     = 4      # Reading string

def isBlank(char):
    return char == ' ' or char == '\t'

def isOperator(text, position, operators):
    result = WU.isAnySubstringAt(operators, text, position)
    if result:
        return operators[result]
    return None

class Splitter:
    def __init__(self, text, operators):
        self.operators = operators
        self.text  = text
        self.words = []
        self.currentPos = -1
        self.char  = None
        self.indentation = 0
        self.state = BLANKS
        self.theOperator = None

    def pushWord(self, start, end):
        self.words.append(self.text[start:end])

    def isAtAnOperator(self):
        self.theOperator = isOperator(self.text, self.currentPos, self.operators)
        print(f'My operator: {self.theOperator}')
        return self.theOperator != None


    def findIndentation(self):
        while self.advance():
            if self.char == ' ':
                self.indentation += 1
            elif self.char == '\t':
                self.indentation += 4
            else:
                print('Ended indentation well')
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
        else:
            pass

    def splitLine(self):
        text  = self.text
        while self.advance():
            if self.state is BLANKS:
                self.stepBlank()
            elif self.state is WORDS:
                self.stepWord()
        if self.state is WORDS and self.start != lastpos(self.text):
            self.pushWord(self.start, len(self.text))

    def advance(self, times=1):
        self.currentPos += times
        if self.currentPos == len(self.text):
            print("Finished")
            self.char = None
            return False
        else:
            self.char = self.text[self.currentPos]
            return True

    def getResult(self):
        return StringLine(self.indentation, self.words)

    def parse(self):
        self.findIndentation()
        self.splitLine()
        return self.getResult()

        
splitter = Splitter('  def advance(self, times=1):', Fake.operators)
line = splitter.parse()
print(' Here it is.... ')
print(line.toString())
'''
def splitTextIntoWords(text, operators):
    start = -1
    state = BLANKS
    words = []
    skip = 0

    indentation = 0
    firstCharIndex = 0
    firstChar = 'tba'
    if len(text) > 0:
        firstChar = text[0]
        while isBlank(firstChar):
            if firstChar == ' ':
                indentation += 1
            elif firstChar == '\t':
                indentation += 4
            firstCharIndex += 1
            firstChar = text[firstCharIndex]
        skip = firstCharIndex

    for i, char in enumerate(text):
        if skip:
            skip -= 1
            continue

        if state is BLANKS:
            if isBlank(char):                           
                continue
            theOperator = isOperator(text, i, operators)                
            if theOperator:
                newI = i + len(theOperator)
                print(text[i:newI])
                words.append(text[i:newI])
                state = BLANKS
                skip = len(theOperator) - 1
            else:
                start = i
                state = WORDS

        elif state is WORDS:
            if isBlank(char):
                words.append(text[start:i])
                state = BLANKS
            theOperator = isOperator(text, i, operators)                
            if theOperator:
                words.append(text[start:i])
                newI = i + len(theOperator)
                words.append(text[i:newI])
                state = BLANKS
                skip = len(theOperator) - 1
            else:
                continue
    if state is WORDS and start < len(text) - 1:
        words.append(text[start:len(text)])
    return StringLine(indentation, words)
'''

def readFileAndSplit(fileName):
    lines = WU.readFileIntoLines(fileName)
    lines = list(map(lambda line : splitTextIntoWords(line, Fake.operators), lines))

    strLines = list(map(lambda x : x.toString(), lines))
    print(strLines)

readFileAndSplit('Test.waxx')