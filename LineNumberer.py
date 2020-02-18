

def numberLines(wordLines):
    i = 0
    for line in wordLines:
        line.lineNumber = i
        i += 1
    return wordLines