
import Words
import Grammar
import logging
import re   # Regex

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
        if self.type == 'attribution-left':
            return ' '.join(self.accessModifiers) + '(' + ' '.join([str(node) for node in self.content]) + ')'
        if self.type == 'expression' or self.type == 'attribution-right':
            return '(' + ' '.join([str(node) for node in self.content]) + ')'
        elif self.type == 'attribution':
            logging.debug(len(self.content))
            logging.debug(self.content[0])
            logging.debug(self.content[1])
            return str(self.content[0]) + ' = ' + str(self.content[1])
        elif self.type == 'tuple':
            return '(' + ' , '.join([str(node) for node in self.content]) + ')'
        elif self.type == 'class-definition':   # only has 2: [0] is the class name, [1] is a class-extra (mostly just <T>'s)
            if len(self.content) == 1:
                return ' '.join(self.accessModifiers) + ' class ' + str(self.content[0]) + ':'
            elif len(self.content) == 2:
                return ' '.join(self.accessModifiers) + ' class ' + str(self.content[0]) + ' ' + str(self.content[1]) + ':'
            else:
                return ''
        elif self.type == 'class-extra':
            return ' '.join([str(elem) for elem in self.content])
        else:
            logging.error('ERROR: Type ' + self.type + ' not handled!')

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

    def exit(self, message):
        logging.error(message)

    def push(self, what):
        self.currentExpression.content.append(what)
        logging.debug('Pushing ' + str(what.content))

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
            'in-root'                       : self.inRoot,
            'in-parenthesis-expression'     : self.inParenthesisExpression,
            'in-parenthesis-tuple'          : self.inParenthesisTuple,
            'in-tuple-element'              : self.inTupleElement,
            'reading-class-name'            : self.readingClassName,
            'reading-class-extra'           : self.readingClassExtra,
            'no-state'                      : self.noState
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
            
    def inRoot(self, string):   # Prioritizes = over ,
        if string == '(':
            self.branchOut('expression-or-tuple', 'in-parenthesis-expression')
        elif Grammar.isAccessModifier(string):
            self.currentExpression.accessModifiers.append(string)
        elif string == '=':
            self.currentExpression.type = 'attribution'
            self.wrapOver('attribution-left', nextState='in-attribution')
            self.brateIn()
            self.branchOut('attribution-right', 'in-parenthesis-expression')
        elif string == 'class':
            self.currentExpression.type = 'class-definition'
            self.stateStack[-1] = 'reading-class-name'
            logging.debug('CLASS')
        else:
            self.push(Node(string, 'node'))

    def readingClassName(self, string):
        debug('YES')
        if len(self.currentExpression.content) > 0:
            self.exit('Invalid syntax for class definition')
        debug('HERE')
        debug(string)
        self.push(Node(string, 'keyword'))
        self.branchOut('class-extra', newState='reading-class-extra')

    def readingClassExtra(self, string):
        if string == ':':
            self.stateStack[-1] = 'no-state'
        else:
            self.push(string)


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

