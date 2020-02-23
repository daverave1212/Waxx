
from sys import exit
import json

import Splitter
import Words
import Grammar
import Parenthesiser
import LineNumberer
import Scoper
import Collapser
import Node

import Expressizer
import Tuplizer



stringLines = Words.readFileIntoLines('Test.waxx')      # Reads the file into a list of str

wordLines = Splitter.splitLines(stringLines, Grammar.operators, Grammar.separators) # For each str, splits it into tokens (Word) and for that line, returns a WordLine
wordLines = Parenthesiser.parenthesise(wordLines)       # Looks for matching parenthesis: if a Word is '(', sets its pairLine and pairWord to the matching ')' position
wordLines = Collapser.collapseParentheses(wordLines)    # Aligns lines by parentheses
wordLines = Parenthesiser.parenthesise(wordLines)       # We look again for matching parentheses, because some parts were flattened

nodeLines = Expressizer.nodifyByParentheses(wordLines)  # Transforms all parentheses into ExpressionNodes and all other words into SomethingNodes

baseScope = Scoper.nodeLinesToScopeNodes(nodeLines)    # Transforms nodeLines into ScopeNodes based on indentation

Tuplizer.tuplizeScope(baseScope)   # Looks for ExpressionNodes. For each found, if it's actually a tuple, transforms it into a TupleExpressionNode

with open('logs.json', 'w') as f:
    f.write(json.dumps(baseScope.toDict()))

print('')
print(baseScope.toDetailedString())

