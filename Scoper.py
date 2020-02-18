
import Words

'''
    Takes a list of WordLine

    fromLine - including
    fromWord - including
    toLine - including
    toWord - excluding

'''


'''
A scope is a block of code which holds other lines underneath it.
It can have a content (a list of multiple scopes) or not.
If it has no content, it simply means it's just a line and is not a block of code
'''
class Scope:
    def __init__(self, wordLine):
        self.line = wordLine.words
        self.content = []

    def print(self):
        Words.printWords(self.line)
        if len(self.content) > 0:
            printScopeList(self.content)

def printScopeList(scopes):
    for scope in scopes:
        scope.print()

'''
Takes a list of WordLines (after it was parenthesized by Parenthseiser.py).
Returns a list of Scopes - basically an abstract syntax tree but containing only lines
It is reccursive. It will automatically scope everything in it.
Ex:
    Scope: def foo ( x ) :
        Scope: y = 20
        Scope: return x + y
'''
def scope(lines, fromLine=0, toLine=None):
    if toLine is None:
        toLine = len(lines)
    i = fromLine
    baseIndentation = lines[fromLine].indentation
    scopes = []
    while i < toLine:
        line = lines[i]
        if line.indentation > baseIndentation:  # We found a subblock of code
            lastScope = scopes[-1]
            blockStart = i  # Start of the block
            while lines[i].indentation > baseIndentation:
                i += 1
                if i >= toLine:
                    break
            blockEnd = i    # End of the block
            lastScope.content = scope(lines, blockStart, blockEnd)
        else:
            scopes.append(Scope(line))
        i += 1
    return scopes


                
            
