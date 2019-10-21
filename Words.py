
class Word:
    def __init__(self, string):
        self.string = string
        self.pairLine = None
        self.pairWord = None
    def toString(self):
        if self.pairLine != None:
            return self.string + '/' + str(self.pairLine) + ',' + str(self.pairWord)
        else:
            return self.string

class WordLine:
    def __init__(self, indentation, words):
        self.indentation = indentation
        self.words = words
    def toString(self):
        strings = list(map(lambda word : word.toString(), self.words))
        return spaces(self.indentation) + '  '.join(strings)






def printWordLines(wordLines):
    for line in wordLines:
        print(line.toString())

def rewritePrint(oldPrint):
    def newPrint(what):
        if type(what) is list:
            if len(what) == 0:
                print('[]')
            elif type(what[0]) is list:
                for li in what:
                    print(li)
            elif type(what[0]) is str:
                print('  '.join(what))
            else:
                oldPrint(what)
        else:
            oldPrint(what)
    return newPrint

def readFileIntoLines(fileName):
    with open(fileName, 'r') as file: 
        text = file.read()
        return text.splitlines()
    return ''




def isSubstringAt(sub, string, start=0):
    if len(string) - start < len(sub):
        return None
    for char in sub:
        if char != string[start]:
            return None
        start += 1
    return True

def isAnySubstringAt(subs, string, start):
    for i, sub in enumerate(subs):
        result = isSubstringAt(sub, string, start)
        if result:
            return i
    return None

def spaces(n):
    return ' ' * n




