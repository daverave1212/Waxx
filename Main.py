

import Splitter
import Words
import Grammar
import Parenthesiser
import LineNumberer
import Scoper
import Collapser

import Expressizer
from sys import exit

stringLines = Words.readFileIntoLines('Test.waxx')      # Reads the file into a list of str

wordLines = Splitter.splitLines(stringLines, Grammar.operators, Grammar.separators) # For each str, splits it into tokens (Word) and for that line, returns a WordLine
wordLines = Parenthesiser.parenthesise(wordLines)   # Looks for matching parenthesis: if a Word is '(', sets its pairLine and pairWord to the matching ')' position
wordLines = LineNumberer.numberLines(wordLines)     # Sets each line's lineNumber to its index in the list

wordLines = Collapser.collapseParentheses(wordLines)
Words.printWordLines(wordLines)
# align up lines with parenthesis on different lines first

# lines = Scoper.scope(lines)


exit()

# Now, lines contains a list of WordLine

partLines = Expressizer.expressizeLinesByParenthesis(lines)
partLines = Expressizer.expressizeLinesByConditionKeyword2(partLines)
Expressizer.printPartLines(partLines)
exit()


partLines = Expressizer.expressizeLinesByEquals(partLines)


# Expressizer.printPartLines(partLines)

# lines = Scoper.scope(lines)
# Scoper.printScopeList(lines)


