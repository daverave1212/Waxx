'''
    isDigit(char)
    isBlank(char)
    isOperator(text, charPos, operators) : operators[result]
    isNumber(str)
'''

import Words as W

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
    