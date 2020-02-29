
import Words
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

def expressizeParenthesesAndGetNodes(words, fromWord=0, toWord=None):
    if toWord is None:
        toWord = len(words)
    
    nodes = []
    i = fromWord
    while i < toWord:
        word = words[i]
        if word.hasPair():
            (_, wordPos) = word.getMatchingPair()
            nestedNodes = expressizeParenthesesAndGetNodes(words, i+1, wordPos)
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