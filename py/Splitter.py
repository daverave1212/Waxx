import Words as W
import Utils as U
from Utils import lastpos
from Utils import isOperator
from Words import Word
from Words import WordLine

# # # Main function for this module # # #
# # # Takes in a list of strings  # # # #
# # # Outputs a list of WordLine  # # # #
def splitLines(lines, operators, separators):
    return Splitter(lines, operators, separators).parse()






print   = W.rewritePrint(print)
map     = U.rewriteMap(map)


# States for the following function
BLANKS     = 1      # Reading blanks
WORDS      = 2      # Reading words
OPERATORS  = 3      # Reading operators
STRING     = 4      # Reading string or comment of some sort

# Checks if text[position:] starts with any of the possible string separators
# Returns the separators as a string, or None
def startsString(text, position, separators):
    sepsStart = map(lambda pair : pair[0], separators)      # All 'operators' that start a string
    result = W.isAnySubstringAt(sepsStart, text, position)
    if result != None:
        return separators[result]
    return None
    
# Checks if text[position:] is equal to the given separator
def endsString(text, position, separator):
    result = W.isSubstringAt(separator, text, position)
    if result != None:
        return result
    return None

# Takes a string and counts how many spaces it has in front of it
def findIndentation(string):
    indentation = 0
    for char in string:
        if char == '\t':
            indentation += 4    # TODO make it variable or something
        elif char == ' ':
            indentation += 1
        else:
            break
    return indentation

class Splitter:
    def __init__(self, lines, operators, separators):
        self.lines = lines
        self.operators  = operators
        self.separators = separators

        self.outputLines = []

        self.currentLineIndex = 0
        self.currentCharIndex = -1
        self.start = 0

        self.currentOutputLine = []
        self.currentLineIndentation = 0

        self.theOperator = None
        self.theSeparatorPair = None

        self.state = BLANKS

    def getCurrentLine(self):
        return self.lines[self.currentLineIndex]

    def getCurrentChar(self):
        return self.lines[self.currentLineIndex][self.currentCharIndex]

    def pushWord(self, start, end):
        theLine = self.getCurrentLine()
        theWord = Word(theLine[start:end])
        self.currentOutputLine.append(theWord)

    def isAtAnOperator(self):
        theLine = self.getCurrentLine()
        self.theOperator = isOperator(theLine, self.currentCharIndex, self.operators)
        return self.theOperator != None

    def isAtStringStart(self):
        theLine = self.getCurrentLine()
        self.theSeparatorPair = startsString(theLine, self.currentCharIndex, self.separators)
        return self.theSeparatorPair != None

    def isAtStringEnd(self):
        return endsString(self.getCurrentLine(), self.currentCharIndex, self.theSeparatorPair[1])

    def splitLine(self, startingState=BLANKS):
        self.currentOutputLine = []
        line  = self.getCurrentLine()
        self.state = startingState
        indentation = findIndentation(line)
        self.currentCharIndex = indentation

        while self.currentCharIndex < len(line):
            if self.state is BLANKS:
                self.stepBlank()
            elif self.state is WORDS:
                self.stepWord()
            elif self.state is STRING:
                self.stepString()
            self.currentCharIndex += 1

        if self.state is WORDS:
            self.pushWord(self.start, len(line))
        elif self.state is STRING:
            self.pushWord(self.start, len(line))
        self.currentLineIndentation = indentation

    def stepBlank(self):
        if self.getCurrentChar().isspace(): # Space
            pass
        elif self.isAtAnOperator():         # Operator
            endPos = self.currentCharIndex + len(self.theOperator)
            self.pushWord(self.currentCharIndex, endPos)
            self.currentCharIndex += len(self.theOperator) - 1
        elif self.isAtStringStart():
            self.start = self.currentCharIndex
            self.state = STRING
        else:                               # Word
            self.start = self.currentCharIndex
            self.state = WORDS

    def stepWord(self):
        if self.getCurrentChar().isspace():
            self.pushWord(self.start, self.currentCharIndex)
            self.state = BLANKS
        elif self.isAtAnOperator():
            self.pushWord(self.start, self.currentCharIndex)
            endPos = self.currentCharIndex + len(self.theOperator)
            self.pushWord(self.currentCharIndex, endPos)
            self.state = BLANKS
            self.currentCharIndex += len(self.theOperator) - 1
        elif self.isAtStringStart():
            self.start = self.currentCharIndex
            self.state = STRING
        else:
            pass

    def stepString(self):
        if self.isAtStringEnd():
            self.pushWord(self.start, self.currentCharIndex + len(self.theSeparatorPair[1]))
            self.state = BLANKS
            self.currentCharIndex += len(self.theSeparatorPair[1]) - 1
        else:
            pass

    def parse(self):
        while self.currentLineIndex < len(self.lines):
            self.splitLine()
            words = self.currentOutputLine
            indentation = self.currentLineIndentation
            self.outputLines.append(WordLine(indentation, words))
            self.currentLineIndex += 1
        return self.outputLines

    def print(self):
        for line in self.outputLines:
            print(line.toString())





