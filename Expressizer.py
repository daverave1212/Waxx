
from Words import Word
from Words import WordLine

from Node import Node
from Node import ExpressionNode
from Node import NodeLine
from Node import wordToNode

'''
Always use this AFTER collapsing parentheses with Collapser
Takes in a list of Word and returns a list of Node, with parentheses expressized and basic Node types sorted out.
'''
def expressizeParenthesesAndGetNodes(words):
    nodes = []
    i = 0
    while i < len(words):
        word = words[i]
        if word.hasPair():
            (_, wordPos) = word.getMatchingPair()               # It will always be on the same line
            nestedWords = words[i + 1:wordPos]
            nestedNodes = expressizeParenthesesAndGetNodes(nestedWords)
            nodes.append(ExpressionNode(nestedNodes))
            i = wordPos
        else:
            nodes.append(wordToNode(word))
        i += 1
    return nodes

def nodifyByParentheses(wordLines):
    nodeLines = []
    for wordLine in wordLines:
        nodeList = expressizeParenthesesAndGetNodes(wordLine.words)
        nodeLine = NodeLine(indentation = wordLine.indentation, nodes = nodeList)
        nodeLines.append(nodeLine)
    return nodeLines