
'''
A single function.
Takes a list of WordLine (see Main.py for the pipeline).
Outputs a list of WordLine, but makes sure everything in parentheses is put on a single line.
Ex:
    x = go (
        something ,      ---becomes--->     x = go ( something , something ) + do ( this )
        something
    ) + do (
        this
    )

It is not recursive because there is no need to. Expressions inside parentheses must make sens syntactically.
Indentation does not matter. It will always flatten those words between parentheses, no matter the indentation.

'''




from Words import Word
from Words import WordLine

def collapseParentheses(wordLines):
    newWordLines = []
    state = 'reading-code'
    currentWordLine = None
    nestEndLine = None
    nestEndWord = None

    for i, wordLine in enumerate(wordLines):

        if state == 'reading-code':
            currentWordLine = WordLine(wordLine.indentation, [], wordLine.lineNumber)
        if wordLine.getLength() == 0:
            continue

        for j, word in enumerate(wordLine.words):
            if state == 'reading-code':
                currentWordLine.words.append(word)
                if word.hasPair():
                    state = 'reading-nest'
                    nestEndLine, nestEndWord = word.getMatchingPair()

            elif state == 'reading-nest':
                currentWordLine.words.append(word)
                if (i, j) == (nestEndLine, nestEndWord):
                    state = 'reading-code'
        
        if state == 'reading-code':
            newWordLines.append(currentWordLine)

    return newWordLines
