
import Words

# Use a stack of states!!!

class Expression:
    def __init__(self, parent, content, type):
        self.content = content
        self.type = type
        self.parent = parent

def parse(wordLine):
    root = Expression(content=[], type='expression', parent=None)
    currentNode = root

    state = 'none'
    for i, word in wordLine:
        string = word.string


        if string == '(':
            pass
        else:

