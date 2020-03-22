
import Words
import Grammar
import logging
import re   # Regex

from Grammar import isAccessModifier

logging.basicConfig(format='[%(filename)s:%(lineno)d] %(message)s', level=logging.DEBUG)
debug = logging.debug

def isAtom(string):
    return re.search("^([a-zA-Z_][a-zA-Z0-9_]*)$", string)




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
        self.accessModifiers = []
    def __str__(self):
        if True:
            pass
        else:
            logging.error('ERROR: Type ' + self.type + ' not handled!')

class Node:
    def __init__(self, content, type=None):
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

    def exit(self, message):
        logging.error(message)

    def push(self, what):
        self.currentExpression.content.append(what)
        logging.debug('Pushing ' + str(what.content))

    def getCurrentState(self):
        return self.stateStack[-1]
    def setState(self, newState):
        self.stateStack[-1] = newState

    def branchOut(self, expressionType, newState=None):
        newExpression = Expression(content=[], type=expressionType, parent=self.currentExpression)
        self.push(newExpression)
        self.currentExpression = newExpression
        if newState is not None:
            self.stateStack.append(newState)

    def brateIn(self):
        self.stateStack.pop()
        self.currentExpression = self.currentExpression.parent

    def wrapOver(self, newExpressionType, nextState):  # Wraps the current expression in another expression
        accessModifiers = self.currentExpression.accessModifiers
        content = self.currentExpression.content
        self.currentExpression.accessModifiers = []
        self.currentExpression.content = []
        newExpression = Expression(self.currentExpression, content, newExpressionType)
        newExpression.accessModifiers = accessModifiers
        self.currentExpression.content = [newExpression]
        self.currentExpression = newExpression
        self.stateStack.append(nextState)

    def parse(self):
        strings = [word.string for word in self.wordLine.words]
        stateFunctions = {
            'no-state'                      : self.noState,
            'in-root'                       : self.inRoot
        }

        for word in strings:
            state = self.getCurrentState()
            if state in stateFunctions:
                stateFunctions[state](word)
            else:
                logging.debug('Error: State ' + state + ' not handled.')
            logging.debug('> ' + str(self.root) + '\t\t|\t' + state)
        return self.root







    def noState(self, string):
        self.exit('No state for string ' + string)
            
    def inRoot(self, string):
        if isAccessModifier(string):
            self.currentExpression.accessModifiers.append(string)
            self.setState('reading-modifiers')

    def readingModifiers(self, string):
        if isAccessModifier(string):
            self.currentExpression.accessModifiers.append(string)
        elif isAtom(string):
            self.readingType(string)
            
    def readingType(self, string):
        if isAtom(string):
            self.push(Node(string))
            self.setState('expecting-generic')
    
    def expectingGeneric(self, string):
        if string == '<':
            self.branchOut('generic-inner', 'reading-generic-inner')
        elif isAtom(string):
            self.readingVarName(string)
    
    def readingGenericInner(self, string):
        if string == '>':
            self.brateIn()
        elif isAtom(string):
            self.push(Node(string)) # For now, allows < anything anything anything... >

    def readingVarName(self, string):
        if isAtom(string):
            self.push(Node(string))



















    def inParenthesisExpression(self, string):
        if string == '(':
            self.branchOut('expression-or-tuple', 'in-parenthesis-expression')
        elif string == ',':
            self.currentExpression.type = 'tuple'
            self.stateStack[-1] = 'in-parenthesis-tuple'
            thisContent = self.currentExpression.content
            tupleElement = Expression(content=thisContent, type='expression', parent=self.currentExpression)
            self.currentExpression.content = [tupleElement]
            self.branchOut('expression', 'in-tuple-element')
        elif string == ')':
            self.brateIn()
        else:
            self.push(Node(string, 'node'))

    def inParenthesisTuple(self, string):
        logging.error('Not ok')
        pass

    def inTupleElement(self, string):
        if string == '(':
            self.branchOut('expression-or-tuple', 'in-parenthesis-expression')
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
        logging.debug(str(expression))

