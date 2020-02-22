
from Node import Node
from Node import NodeLine
from Node import ScopeNode

from Node import nodeListToString

def noprint(anything):
    pass

# print = noprint

'''
Takes a list of NodeLine.
Every NodeLine becomes a ScopeNode, even if it has nothing underneath it (case in which scopeNodes is None for it)
Returns a wrapper ScopeNode, containing a recursively scoped list of ScopeNodes
'''
def nodeLinesToScopeNodes2(nodeLines):
    wrapperScopeNode = ScopeNode(parent=None, line=None, content=[])
    currentScopeNode = wrapperScopeNode
    baseIndentation = nodeLines[0].indentation
    indentationStack = [baseIndentation]
    for nodeLine in nodeLines:

        if nodeLine.indentation < indentationStack[-1]:         # After this is done, we have either == or >
            while nodeLine.indentation < indentationStack[-1]:
                indentationStack.pop()
                currentScopeNode = currentScopeNode.parent

        if nodeLine.indentation == indentationStack[-1]:
            lineScopeNode = ScopeNode(parent=currentScopeNode, line=nodeLine.nodes, content=None)
            currentScopeNode.content.append(lineScopeNode)

        elif nodeLine.indentation > indentationStack[-1]:
            indentationStack.append(nodeLine.indentation)
            newCurrentScopeNode = ScopeNode(parent=currentScopeNode, line=nodeLine.nodes, content=[])
            currentScopeNode.content.append(newCurrentScopeNode)
            currentScopeNode = newCurrentScopeNode

    return wrapperScopeNode









def nodeLinesToScopeNodes(nodeLines):

    wrapperScopeNode = ScopeNode(parent=None, line=None, content=[], indentation=-1)
    previousScopeNode = wrapperScopeNode

    for nodeLine in nodeLines:

        if nodeLine.indentation < previousScopeNode.indentation:
            while nodeLine.indentation < previousScopeNode.indentation:
                previousScopeNode = previousScopeNode.parent

        if nodeLine.indentation > previousScopeNode.indentation:
            scopeNode = ScopeNode(
                parent = previousScopeNode,
                line = nodeLine.nodes,
                content = [],
                indentation = nodeLine.indentation)
            previousScopeNode.content.append(scopeNode)
            previousScopeNode = scopeNode
        
        elif nodeLine.indentation == previousScopeNode.indentation:
            parent = previousScopeNode.parent
            scopeNode = scopeNode = ScopeNode(
                parent = previousScopeNode.parent,
                line = nodeLine.nodes,
                content = [],
                indentation = nodeLine.indentation)
            parent.content.append(scopeNode)
            previousScopeNode = scopeNode

        else:
            print("This should not have happened")
        
    return wrapperScopeNode



