

import Splitter
import Words
import Grammar
import Parenthesiser
from sys import exit

lines = Words.readFileIntoLines('Test.waxx')
lines = Splitter.splitLines(lines, Grammar.operators, Grammar.separators)
print(lines[0].toString())
exit()
lines = Parenthesiser.parenthesise(lines)

Words.printWordLines(lines)
