
''

class State:
    def __init__(self, name):
        self.name = name
        self.transitions = []

class Transition:
    def __init__(self, on, type, to):
        self.on = on
        self.type = type
        self.to = to

def getIndentation(string):
    indentation = 0
    for letter in string:
        if letter == '\t':
            indentation += 4
        elif letter == ' ':
            indentation += 1
        else:
            break
    return indentation

def readFile():
    parserCode = None
    with open('parser.fsa', 'r') as f:
        parserCode = f.read()
    return parserCode



def generate(code):
    lines = [line for line in code.split('\n') if len(line.strip()) > 0]
    states = []
    for line in lines:
        if getIndentation(line) == 0:
            stateName = line.split(':')[0]
            states.append(State(stateName))
        else:
            if '->'
    


generate(readFile())