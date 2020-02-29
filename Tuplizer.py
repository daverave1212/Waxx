
from Node import ExpressionNode
from Node import TupleExpressionNode

'''
Takes a list of Node.
Returns a list of either Node, or ExpressionNode, and also the type of what was returned (node-list or tuple-elems)
'''
def nodesToTupledNodes(nodeList):

    tupleElemStart = 0
    tupleElems = []
    for i, node in enumerate(nodeList):

        if type(node) is ExpressionNode:
            newNode = expressionToTupledExpression(node)
            nodeList[i] = newNode

        elif node.content == ',':
            slicedNodes = nodeList[tupleElemStart:i]
            if len(slicedNodes) == 1:   # If it contains a single element
                tupleElems.append(slicedNodes[0])   # No need to make it an expression. Just add it
            else:
                newExpression = ExpressionNode(slicedNodes)
                tupleElems.append(newExpression)
            tupleElemStart = i + 1

    if tupleElemStart == 0:  # If not found any commas
        return (nodeList, 'node-list')
    else:
        if tupleElemStart < len(nodeList):
            slicedNodes = nodeList[tupleElemStart:len(nodeList)]
            if len(slicedNodes) == 1:
                tupleElems.append(slicedNodes[0])
            else:
                newExpression = ExpressionNode(slicedNodes)
                tupleElems.append(newExpression)
        return (tupleElems, 'tuple-elems')

def expressionToTupledExpression(expressionNode):
    assert expressionNode is not None, 'expressionNode is None'
    assert isinstance(expressionNode, ExpressionNode), 'expressionNode is not a subtype of ExpressionNode'
    (newContent, returnedType) = nodesToTupledNodes(expressionNode.content)
    if returnedType == 'node-list':
        expressionNode.content = newContent
        return expressionNode
    elif returnedType == 'tuple-elems':
        newNode = TupleExpressionNode(newContent)
        return newNode
    else:
        print('Error in expressionToTupledExpression: this should not have happened!')




def tuplizeScope(scopeNode):
    if scopeNode.line is not None and len(scopeNode.line) > 0:
        for i, node in enumerate(scopeNode.line):
            if type(node) is ExpressionNode:
                scopeNode.line[i] = expressionToTupledExpression(node)
    
    if scopeNode.content is not None and len(scopeNode.content) > 0:
        for nestedScope in scopeNode.content:
            tuplizeScope(nestedScope)
        

 