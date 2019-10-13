

def rewriteMap(oldMap):
    def newMap(func, victim):
        if type(victim) is list:
            return list(oldMap(func, victim))
        else:
            return oldMap(func, victim)
    return newMap


def lastpos(li):        # Returns the position of the last element
    return len(li) - 1