

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
        return False
    for char in sub:
        if char != string[start]:
            return False
        start += 1
    return True

def isAnySubstringAt(subs, string, start):
    for i, sub in enumerate(subs):
        result = isSubstringAt(sub, string, start)
        if result:
            return i
    return False




