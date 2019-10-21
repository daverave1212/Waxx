

# TODO: Test this Analyzer shit


class Analyzer:
    def __init__(self, wordLines, fromLine, fromWord, toLine, toWord):
        self.fromLine = fromLine
        self.fromWord = fromWord
        self.toLine = toLine
        self.toWord = toWord
        self.currentLineIndex = fromLine
        self.currentWordIndex = toLine
        self.inputLines = wordLines

    def getCurrentWord(self):
        return self.inputLines[self.currentLineIndex][self.currentWordIndex]

    def getCurrentLine(self):
        return self.inputLines[self.currentLineIndex]

    def advance(self, nSteps = 1):
        self.currentWordIndex += nSteps
        if self.isOutOfLimits():
            return False
        while self.isWordOutOfBounds():
            self.currentWordIndex = 0
            self.currentLineIndex += 1
            if self.isLineOutOfBounds() or self.isLineOutOfLimits():
                return False
        return True

    def isLineOutOfLimits(self):
        return self.currentLineIndex > self.toLine
    
    def isWordOutOfLimits(self):
        return self.currentLineIndex == self.toLine and self.currentWordIndex >= self.toWord
    
    def isLineOutOfBounds(self):
        return self.currentLineIndex >= len(self.inputLines)
    
    def isWordOutOfBounds(self):
        return self.currentWordIndex >= len(self.inputLines[self.currentLineIndex])

    def isOutOfLimits(self):    # Is out of toLine and toWord
        return self.isLineOutOfLimits() or self.isWordOutOfLimits()

    def isOutOfBounds(self):
        return self.isLineOutOfBounds() or self.isWordOutOfBounds()

