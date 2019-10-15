

import Lexer
import WordUtils
from sys import exit

print = WordUtils.rewritePrint(print)



lines = Lexer.readFileAndSplit('Test.waxx')
wordLines = WordUtils.stringLinesToWordLines(lines)


print('Done')

wordLines = list(map(lambda line : line.toString(), wordLines))
print(wordLines)