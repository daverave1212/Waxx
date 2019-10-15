
class Word:
    def __init__(self, string):
        self.string = string
        self.parenthesisEnd = None      # If it's "(", then self.parenthesisEnd is the position of the other parenthesis
        self.parenthesisStart = None    # Same here
    def toString(self):
        return self.string

# A pair of a list of strings plus indentation
class StringLine:
    def __init__(self, indent, theList=[]):
        self.words = theList
        self.indentation = indent
    def toString(self):
        return spaces(self.indentation) + '  '.join(self.words)

class WordLine:
    def __init__(self, stringLine):
        self.indentation = stringLine.indentation
        self.words = list(map(lambda word : Word(word), stringLine.words))
    def toString(self):
        strings = list(map(lambda word : word.string, self.words))
        return spaces(self.indentation) + '  '.join(strings)

def stringLinesToWordLines(stringLines):
    return list(map(lambda stringLine : WordLine(stringLine), stringLines))




def rewritePrint(oldPrint):
    def newPrint(what):
        if type(what) is list:
            if type(what[0]) is list:
                for li in what:
                    print(','.join(li))
            else:
                for string in what:
                    print(string)
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




