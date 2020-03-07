import Words

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
    result = Words.isAnySubstringAt(operators, text, position)
    if result != None:
        return operators[result]
    return None

def isNumber(string):
    return string[0].isdigit() and string[-1].isdigit()

def isString(string, separators):
    for sep in separators:
        if string.startswith(sep[0]) and string.endswith(sep[1]):
            return True
    return False

def spaces(n):
    return ' ' * n

def isAtom(str):
    


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
        if word == '(':
            parStack += 1
        elif word == ')':
            parStack -= 1
        elif word == wordToFind:
            if parStack == 0:
                return i
        i += 1
    return None