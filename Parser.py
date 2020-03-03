
import Words

class ExpressionWithIndentation:
    def __init__(self, expression, indentation):
        self.expression = expression
        self.indentation = indentation
    def __str__(self):
        return ' '*self.indentation + str(self.expression)

class Expression:
    def __init__(self, parent, content, type):
        self.content = content
        self.type = type
        self.parent = parent
    def __str__(self):
        if self.type == 'expression':
            return '(' + ' '.join([str(node) for node in self.content]) + ')'
        else:
            return '(' + ' , '.join([str(node) for node in self.content]) + ')'

class Node:
    def __init__(self, content, type):
        self.content = content
        self.type = type
    def __str__(self):
        return str(self.content)






class Parser:
    def __init__(self, wordLine):
        self.wordLine = wordLine
        self.root = Expression(content=[], type='expression', parent=None)
        self.currentExpression = self.root
        self.stateStack = ['in-root']

    def push(self, what):
        self.currentExpression.content.append(what)

    def getCurrentState(self):
        return self.stateStack[-1]

    def branchOut(self, expressionType, newState=None):
        newExpression = Expression(content=[], type=expressionType, parent=self.currentExpression)
        self.push(newExpression)
        self.currentExpression = newExpression
        if newState is not None:
            self.stateStack.append(newState)

    def brateIn(self):
        self.stateStack.pop()
        self.currentExpression = self.currentExpression.parent

    def parse(self):
        strings = [word.string for word in self.wordLine.words]
        for word in strings:
            if self.getCurrentState() == 'in-root':
                self.inRoot(word)
            elif self.getCurrentState() == 'in-expression-or-tuple':
                self.inExpressionOrTuple(word)
            elif self.getCurrentState() == 'in-tuple':
                self.inTuple(word)
            elif self.getCurrentState() == 'in-tuple-element':
                self.inTupleElement(word)
            print('  ' + str(self.root))
        return self.currentExpression

    
            
    def inRoot(self, string):
        if string == '(':
            self.branchOut('expression-or-tuple', 'in-expression-or-tuple')
        else:
            self.push(Node(string, 'node'))




    def inExpressionOrTuple(self, string):
        if string == '(':
            self.branchOut('expression-or-tuple', 'in-expression-or-tuple')
        elif string == ',':
            self.currentExpression.type = 'tuple'
            self.stateStack[-1] = 'in-tuple'
            thisContent = self.currentExpression.content
            tupleElement = Expression(content=thisContent, type='expression', parent=self.currentExpression)
            self.currentExpression.content = [tupleElement]
            self.branchOut('expression', 'in-tuple-element')
        elif string == ')':
            self.currentExpression.type = 'expression'
            self.brateIn()
        else:
            self.push(Node(string, 'node'))

    def inTuple(self, string):
        print('Not ok')
        pass

    def inTupleElement(self, string):
        if string == '(':
            self.branchOut('expresison-or-tuple', 'in-expression-or-tuple')
        elif string == ',':
            self.brateIn()
            self.branchOut('expression','in-tuple-element')
        elif string == ')':
            self.brateIn()
            self.brateIn()
        else:
            self.push(Node(string, 'node'))


def parseWordLines(wordLines):
    return [ExpressionWithIndentation(Parser(wordLine).parse(), wordLine.indentation) for wordLine in wordLines]

def printExpressionWithIndentationList(expressionWithIndentationList):
    for expression in expressionWithIndentationList:
        print(expression)