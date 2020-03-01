
from Node import OperatorNode
from Node import OperatorExpressionNode
from Node import ExpressionNode
from Node import TupleExpressionNode

# Returns either an ExpressionNode or an OperatorExpressionNode
# First, we parse the nodes
def expressionToEqualityExpression(expressionNode):

    newContent = []
    operatorPosition = None
    for i, node in enumerate(expressionNode.content):
        if node.content == '=' and operatorPosition is None:
            operatorPosition = i
            break
        if type(node) is ExpressionNode:
            newNode = expressionToEqualityExpression(node)
            newContent.append(newNode)
        else:
            newContent.append(node)
    
    if operatorPosition is None:
        return ExpressionNode(newContent)
    else:
        leftSlice = newContent[0:operatorPosition]
        return OperatorExpressionNode()


    

# x = 2 + 5 = y + 1
