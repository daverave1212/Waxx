'''
    Word = {
        string : 'miau',
        pairLine : 10,
        pairWord : 6,

        toString(),
        hasPair(),
        getMatchingPair() : (pairLine, pairWord)
    }

    WordLine = {
        indentation : 4,
        words : Word[],
        lineNumber : 512,

        toString(),
        getLength()
    }

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

from Utils import spaces


class Word:
    def __init__(self, string):
        self.string = string
        self.pairLine = None
        self.pairWord = None
    def toString(self, printPairs=False):
        if self.pairLine != None and printPairs:
            return self.string + '/' + str(self.pairLine) + ',' + str(self.pairWord)
        else:
            return self.string
    def getMatchingPair(self):
        return (self.pairLine, self.pairWord)
    def hasPair(self):
        return self.pairWord is not None

class WordLine:
    def __init__(self, indentation, words, lineNumber=None):
        self.indentation = indentation
        self.words = words
        self.lineNumber = lineNumber
    def toString(self, fromPos=0, toPos=None, printPairs=False):
        if toPos is None:
            toPos = len(self.words)
        strings = list(map(lambda word : word.toString(printPairs=printPairs), self.words))
        strings = strings[fromPos:toPos]
        return spaces(self.indentation) + '  '.join(strings)
    def getLength(self):
        return len(self.words)





# Prints a list of WordLine
def printWords(words, indentation=0):
    ret = spaces(indentation)
    for word in words:
        ret += word.string + ' '
    print(ret)

def printWordLines(wordLines, printPairs=False):
    for line in wordLines:
        print(line.toString(printPairs=printPairs))

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






