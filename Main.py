

import Splitter
import Words
import Grammar
import Parenthesiser
from sys import exit

lines = Words.readFileIntoLines('Test.waxx')
lines = Splitter.splitLines(lines, Grammar.operators, Grammar.separators)
lines = Parenthesiser.parenthesise(lines)

Words.printWordLines(lines)
