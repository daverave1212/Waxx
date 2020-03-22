'''
    The only relevant function of this script is parenthesise(wordLines)
    Takes a list of WordLine and outputs the same list, but does the parenthesis pairing up
'''

from Words import Word
from Words import WordLine
from Utils import Position

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

