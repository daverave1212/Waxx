

import Splitter
import Words
import Grammar
import Parenthesiser
import LineNumberer
import Scoper

import Expressizer
from sys import exit

stringLines = Words.readFileIntoLines('Test.waxx')      # Reads the file into a list of str

lines = Splitter.splitLines(stringLines, Grammar.operators, Grammar.separators) # For each str, splits it into tokens (Word) and for that line, returns a WordLine
lines = Parenthesiser.parenthesise(lines)   # Looks for matching parenthesis: if a Word is '(', sets its pairLine and pairWord to the matching ')' position
lines = LineNumberer.numberLines(lines)     # Sets each line's lineNumber to its index in the list

partLines = Expressizer.expressizeLinesByParenthesis(lines)
partLines = Expressizer.expressizeLinesByConditionKeyword(partLines)
partLines = Expressizer.expressizeLinesByEquals(partLines)
Expressizer.printPartLines(partLines)

# Expressizer.printPartLines(partLines)

# lines = Scoper.scope(lines)
# Scoper.printScopeList(lines)


