

import WordUtils as WU

def rewriteMap(oldMap):
    def newMap(func, victim):
        if type(victim) is list:
            return list(oldMap(func, victim))
        else:
            return oldMap(func, victim)
    return newMap


def lastpos(li):        # Returns the position of the last element
    return len(li) - 1

def last(li):
    return li[len(li) - 1]

def isDigit(char):
    return char in '0987654321'

def isBlank(char):
    return char == ' ' or char == '\t'

def isOperator(text, position, operators):
    result = WU.isAnySubstringAt(operators, text, position)
    if result != None:
        return operators[result]
    return None

def isNumber(string):
    return isNumber(string[0]) and isNumber(last(string))
    