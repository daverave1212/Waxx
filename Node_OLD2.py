'''
    A node represents a node in the AST.
'''

import json

from Utils import spaces

import Grammar
import Utils

class NodeLine:
    def __init__(self, indentation, nodes):
        self.indentation = indentation
        self.nodes = nodes
    def __str__(self):
        return spaces(self.indentation) + ' '.join([str(node) for node in self.nodes])
    def toDict(self):
        return { 'NodeLine' : [node.toDict() for node in self.nodes]}



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


class Node:
    def __init__(self, content, nodeType):
        self.content = content
        self.type = nodeType
    def __str__(self):
        return str(self.content) if self.content is not None else '<Null>'
    def toDict(self):
        return {
            'type' : self.type,
            'content' : self.content
        }
    def toDetailedString(self):
        return self.type[0:2] + '(' + (str(self.content) if self.content is not None else '<Null>') + ')'



class ExpressionNode(Node): # Contains a list of nodes as content
    def __str__(self):
        return '(' + nodeListToString(self.content) + ')'
    def toDetailedString(self):
        return self.type[0:2] + '(' + nodeListToStringDetailed(self.content) + ')'
    def toDict(self):
        return {
            'type' : self.type,
            'content' : [node.toDict() for node in self.content]
        }


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
    def toDetailedString(self, indentation=0):
        if self.content == None or len(self.content) == 0:
            return spaces(indentation) + nodeListToStringDetailed(self.line)
        else:
            ret = spaces(indentation) + nodeListToStringDetailed(self.line) + '\n'
            ret += '\n'.join([ scopeNode.toDetailedString(indentation + 4) for scopeNode in self.content])
            return ret
    def lineToString(self):
        return nodeListToString(self.line)

    def toDict(self):
        if self.content is None or len(self.content) == 0:
            return {
                'line' : [node.toDict() for node in self.line] if self.line is not None else None,
                'content' : None
            }
        else:
            return {
                'line' : [node.toDict() for node in self.line] if self.line is not None else None,
                'content' : [scopeNode.toDict() for scopeNode in self.content]
            }
    









def nodeListToString(nodes, indentation=0):
    if nodes == None:
        return spaces(indentation) + 'None'
    return spaces(indentation) + ' '.join([str(node) for node in nodes])

def nodeListToStringDetailed(nodes, indentation=0):
    if nodes == None:
        return spaces(indentation) + 'None'
    return spaces(indentation) + ' '.join([node.toDetailedString() for node in nodes])

def printNodeLines(nodeLines):
    for nodeLine in nodeLines:
        print(str(nodeLine))

def printNodeLinesDetailed(nodeLines):
    nodeLinesObject = {
        'nodeLines' : [nodeLine.toDict() for nodeLine in nodeLines]
    }
    print(yaml.dump(nodeLinesObject))



