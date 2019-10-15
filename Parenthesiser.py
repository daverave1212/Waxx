from WordUtils import Word
from Utils import lastpos



# Take in a list of WordLine
# Returns the same list, but with parentheses paired up
class Parenthesiser:

    def __init__(self, stringLines):
        self.lines = stringLines
    
    def parseLine(self, line):
        words = []
        parStack = []
        for string in line:
            words.append(Word(string))
            if string == '(':
                parStart.append(lastpos(words))
            elif string == ')':
                parStartPos = parStack.pop()
                parEndPos    = lastpos(words)
                words[parStartPos].parenthesisEnd = parEndPos
                words[parEndPos].parenthesisStart = parStartPos
        return words

    def parse(self):
        wordLines = []
        for line in self.lines:
            words = self.parseLine(line)
            wordLines.append(words)
        return wordLines


def parenthesise(lines):
    return Parenthesiser(lines).parse()


