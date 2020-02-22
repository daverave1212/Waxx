'''
    A node represents a node in the AST.
'''

import json

from Utils import spaces

import Grammar
import Utils
import yaml

import CustomPrinter

class NodeLine:
    def __init__(self, indentation, nodes):
        self.indentation = indentation
        self.nodes = nodes
    def __str__(self):
        return spaces(self.indentation) + ' '.join([str(node) for node in self.nodes])
    def toDict(self):
        return { 'NodeLine' : [node.toDict() for node in self.nodes]}

class Node:
    def __init__(self, content):
        self.content = content
    def __str__(self):
        return str(self.content)
    def toDict(self):
        return self.content
        return { type(self).__name__ : self.content }

class OperatorNode(Node):
    pass

class StringNode(Node):
    pass

class NumberNode(Node):
    pass

class WordNode(Node):
    pass

class ExpressionNode(Node): # Contains a list of nodes as content
    def __str__(self):
        return '(' + ' '.join([str(node) for node in self.content]) + ')'
    def toDict(self):
        return { type(self).__name__ : [node.toDict() for node in self.content] }


class ScopeNode(Node):
    def __init__(self, parent, line, content, indentation=0):          # parent refers to its parent ScopeNode
        self.line = line
        self.content = content                    # content is always made up of other ScopeNodes
        self.parent = parent
        self.indentation = indentation
    def toString(self, indentation=0):
        if self.content == None or len(self.content) == 0:
            return spaces(indentation) + nodeListToString(self.line)
        else:
            ret = spaces(indentation) + nodeListToString(self.line) + '\n'
            ret += '\n'.join([ scopeNode.toString(indentation + 4) for scopeNode in self.content])
            return ret
    def toDict(self):
        if self.content is None or len(self.content) == 0:
            return {
                'line' : nodeListToString(self.line) if self.line is not None else 'None'
            }
        else:
            return {
                'ScopeNode' : [node.toDict() for node in self.line] if self.line is not None else 'None',
                'content' : [scopeNode.toDict() for scopeNode in self.content]
            }
    def prettyPrint(self):
        CustomPrinter.printDict(self.toDict())



def wordToNode(word):
    node = None
    string = word.string
    if string in Grammar.operators:
        node = OperatorNode(content = string)
    elif Utils.isString(string, Grammar.separators):
        node = StringNode(content = string)
    elif Utils.isNumber(string):
        node = NumberNode(content = string)
    else:
        node = WordNode(content = string)
    return node





def nodeListToString(nodes, indentation=0):
    if nodes == None:
        return spaces(indentation) + 'None'
    return spaces(indentation) + ' '.join([str(node) for node in nodes])

def printNodeLines(nodeLines):
    for nodeLine in nodeLines:
        print(str(nodeLine))

def printNodeLinesDetailed(nodeLines):
    nodeLinesObject = {
        'nodeLines' : [nodeLine.toDict() for nodeLine in nodeLines]
    }
    print(yaml.dump(nodeLinesObject))



