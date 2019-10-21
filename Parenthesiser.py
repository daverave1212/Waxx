from Words import Word
from Words import WordLine

class Position:
    def __init__(self, i, j):
        self.i = i
        self.j = j

def parenthesise(wordLines):
    parStack = []
    for i, line in enumerate(wordLines):
        for j, word in enumerate(line.words):
            string = word.string
            if string == '(':
                parStack.append(Position(i, j))
            elif string == ')':
                openPos = parStack.pop()
                wordLines[openPos.i].words[openPos.j].pairLine = i
                wordLines[openPos.i].words[openPos.j].pairWord = j
                word.pairLine = openPos.i
                word.pairWord = openPos.j
    return wordLines

