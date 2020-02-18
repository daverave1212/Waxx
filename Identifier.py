
def isNumber(part):
    if type(part.content) is str:
        if len(part.content) > 0:
            return part.content[0].isdigit() and part.content[-1].isdigit()
    return False

def identifyNumbersInPartLine(partLine):
    for part in partLine.parts:
        if isNumber(part):
            if part.type is not None:
                message = 'ERROR at line ' + str(partLine.lineNumber) + ', a part has two types?'
                raise Exception(message)
            else:
                part.type = 
        