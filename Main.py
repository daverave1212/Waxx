

import Splitter
import Words
import Grammar
from sys import exit

lines = Words.readFileIntoLines('Test.waxx')
lines = Splitter.splitLines(lines, Grammar.operators, Grammar.separators)

Words.printWordLines(lines)
