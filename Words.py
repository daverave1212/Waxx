'''
    Contains various functions and classes, such as Word and WordLine

    Classes:
        Word
        WordLine

    Functions:
        o printWordLines(wordLines)
        o readFileIntoLines(fileName) : [str]
        o isSubstringAt(sub, string, start=0) : Bool
            Checks if sub starts the same as string from position start
        o isAnySubstringAt(subs, string, start) : Int
            Checks if any of the subs starts the same as string from position start
            Returns the index of the sub, or None if not found
        

    Word:
        A string (a literal word, operator, keyword, etc) which holds some metadata
        For example, it can hold where its matching paranthesis is

    WordLine:
        A list of Word which holds some metadata, such as indentation.
'''

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
    def getMatchingParenthesis(self):
        return (self.pairLine, self.pairWord)

class WordLine:
    def __init__(self, indentation, words, lineNumber=None):
        self.indentation = indentation
        self.words = words
        self.lineNumber = lineNumber
    def toString(self, fromPos=0, toPos=None):
        if toPos is None:
            toPos = len(self.words)
        strings = list(map(lambda word : word.toString(), self.words))
        strings = strings[fromPos:toPos]
        return spaces(self.indentation) + '  '.join(strings)
    def getLength(self):
        return len(self.words)





# Prints a list of WordLine
def printWords(words):
    ret = ''
    for word in words:
        ret += word.string + ' '
    print(ret)

def printWordLines(wordLines):
    for line in wordLines:
        print(line.toString())

# Overwrites the 'print' function to give it better functionality
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

'''
Reads the contents of the file directly into a list of str
'''
def readFileIntoLines(fileName):
    with open(fileName, 'r') as file: 
        text = file.read()
        return text.splitlines()
    return ''




def isSubstringAt(sub, string, start=0):
    return string.startswith(sub, start)

def isAnySubstringAt(subs, string, start):
    for i, sub in enumerate(subs):
        result = isSubstringAt(sub, string, start)
        if result:
            return i
    return None

def spaces(n):
    return ' ' * n



