'''
    isDigit(char)
    isBlank(char)
    isOperator(text, charPos, operators) : operators[result]
    isNumber(str)
'''

import Words as W

class Position:
    def __init__(self, i, j):
        self.i = i
        self.j = j

def rewriteMap(oldMap):
    def newMap(func, victim):
        if type(victim) is list:
            return list(oldMap(func, victim))
        else:
            return oldMap(func, victim)
    return newMap


def lastpos(li):        # Returns the position of the last element
    return len(li) - 1

def isOperator(text, position, operators):
    result = W.isAnySubstringAt(operators, text, position)
    if result != None:
        return operators[result]
    return None

def isNumber(string):
    return isNumber(string[0]) and isNumber(string[-1])


'''
Finds the given string (wordToFind) in a list of Words, from fromWord position to toWord position,
but only if the wordToFind is on a 0 parenthesis level.
Example: findOnTheSameLevel([x = foo ( 15 ) - 20, '15')
    - This returns None because '15' is not in 'x = foo _ - 20
'''
def findOnTheSameLevel(wordList, wordToFind, fromWord=0, toWord=None):
    if toWord is None:
        toWord = len(wordList)
    i = fromWord
    parStack = 0
    while i < toWord:
        word = wordList[i]
        print('At', word)
        if word == '(':
            parStack += 1
        elif word == ')':
            parStack -= 1
        elif word == wordToFind:
            if parStack == 0:
                return i
        i += 1
    return None


