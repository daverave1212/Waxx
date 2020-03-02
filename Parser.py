
import Words

# Use a stack of states!!!

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
        return self.currentExpression

    def branchOut(self, expresisonType):
        newExpression = Expression(content=[], type=expresisonType, parent=self.currentExpression)
        self.push(newExpression)
        self.currentExpression = newExpression

    def branchBack(self):
        self.stateStack.pop()
        self.currentExpression = self.currentExpression.parent
            
    def inRoot(self, string):
        if string == '(':
            self.branchOut('expression-or-tuple')
            self.stateStack.append('in-expression-or-tuple')
        else:
            self.push(Node(string, 'node'))




    def inExpressionOrTuple(self, string):
        if string == '(':
            self.branchOut('expression-or-tuple')
            self.stateStack.append('in-expression-or-tuple')
        elif string == ',':
            self.currentExpression.type = 'tuple'
            self.stateStack[-1] = 'in-tuple'
            thisContent = self.currentExpression.content
            tupleElement = Expression(content=thisContent, type='expression', parent=self.currentExpression)
            self.currentExpression.content = [tupleElement]
            self.branchOut('expression')
            self.stateStack.append('in-tuple-element')
        elif string == ')':
            self.currentExpression.type = 'expression'
            self.branchBack()
        else:
            self.push(Node(string, 'node'))

    def inTuple(self, string):
        print('Not ok')
        pass

    def inTupleElement(self, string):
        print('At: ' + string)
        if string == '(':
            self.branchOut('expresison-or-tuple')
            self.stateStack.append('in-expression-or-tuple')
        elif string == ',':
            self.branchBack()
            self.branchOut('in-tuple-element')
        elif string == ')':
            self.branchBack()
            self.branchBack()
        else:
            self.push(Node(string, 'node'))

