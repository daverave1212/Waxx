'''
Takes a list of WordLine and transforms it into a list of PartLine
For start, it takes each WordLine and makes Parts:
A Part is either a str (the .string of a Word) or a list of nested Parts.
Ex: In
    x = 400 + ( 20 * 5 )
x becomes a Part('ATOM'), while '( 20 * 5 )' becomes a Part('EXPRESSION')
For now, the output Parts are always ATOM or EXPRESSION.
'''


import Utils
import Grammar
import sys

from Part import Part
from Part import PartLine
from Part import partListToString
from Part import printPartLines

'''
An Expression is basically a list of Parts.
A Part can be either a single word or an Expression
The 'analyze' function will call this recursively
ALWAYS returns a list of Parts
'''

def parseExpressionByParenthesis(wordLine, fromWord=0, toWord=None):
    if toWord is None:
        toWord = len(wordLine.words)
    parts = []
    i = fromWord
    while i < toWord:
        word = wordLine.words[i]
        if word.string == '(':
            if word.pairLine != wordLine.lineNumber:
                raise Exception('ERROR: Multiline expressions not currently supported')
            nestedExpressionStart = i + 1
            nestedExpressionEnd = word.pairWord
            i = nestedExpressionEnd
            listOfParts = parseExpressionByParenthesis(wordLine, nestedExpressionStart, nestedExpressionEnd)
            part = Part(listOfParts, 'EXPRESSION', isComposite=True)
            parts.append(part)
        else:
            parts.append(Part(word.string, 'ATOM'))
        i += 1
    return parts

def expressizeLineByParenthesis(wordLine):
    parts = parseExpressionByParenthesis(wordLine)
    partLine = PartLine(wordLine.indentation, wordLine.lineNumber, parts)
    return partLine

def expressizeLinesByParenthesis(wordLines):
    ret = []
    for line in wordLines:
        ret.append(expressizeLineByParenthesis(line))
    return ret



############################ By Keyword ################################



''' Is it like: if _ _ _ : '''
def isPartLineConditionFlowControl(partLine):
    return partLine.parts[0].content in Grammar.flowControlConditions and partLine.parts[-1].content == ':'


'''
We look for structures like:
    if _ _ _ :
If we have:
    if EXPR :
We keep it that way
'''
def expressizeLineByConditionKeyword(partLine):
    parts = partLine.parts
    if len(parts) < 2:
        return partLine
    if parts[0].isComposite:
        return partLine
    if isPartLineConditionFlowControl(partLine):
        inner = partLine.parts[1:-1]
        if len(inner) == 1 and inner[0].type == 'EXPRESSION':
            return partLine
        else:
            inner = Part(inner, type='EXPRESSION', subtype='CONDITION', isComposite=True)
            parts[0].type = 'CONDITION-FLOW'
            parts[-1].type = 'BLOCK-END'
            partLine.parts = [parts[0], inner, parts[-1]]
    return partLine

def expressizeLinesByConditionKeyword(partLines):
    return list(map(expressizeLineByConditionKeyword, partLines))


############################ By Equals ################################

def expressizeLineByEquals(partLine):
    parts = partLine.parts
    if len(parts) < 3:
        return partLine
    equalsIndex = partLine.findOnLevel('=', 0)
    if equalsIndex is None:
        return partLine
    left = parts[0:equalsIndex]
    right = parts[equalsIndex+1:]
    if len(left) == 0 or len(right) == 0:
        print('Syntax error at line ', partLine.lineNumber)
        sys.exit()
    if len(left) > 1:
        left = Part(left, type='EXPRESSION', subtype=None, isComposite=True)
    else:
        left = left[0]
    if len(right) > 1:
        right = Part(right, type='EXPRESSION', subtype=None, isComposite=True)
    else:
        right = right[0]
    partLine.parts = [left, parts[equalsIndex], right]
    return partLine
    
def expressizeLinesByEquals(partLines):
    return list(map(expressizeLineByEquals, partLines))



