




class Scope:
    def __init__(self, parent, expression, content, indentation=0):          # parent refers to its parent Scope
        self.expression = expression
        self.content = content                    # content is always made up of other Scopes
        self.parent = parent
        self.indentation = indentation
    def __str__(self):
        ret = self.indentation * ' ' + str(self.expression) + '\n'
        if len(self.content) > 0:
            ret += '\n'.join([str(scope) for scope in self.content])
            ret += '\n'
        return ret



'''
Takes a list of ExpressionWithIndentations.
Every Expression becomes a Scope, even if it has nothing underneath it (case in which content is [] for it)
Returns a wrapper Scope, containing a recursively scoped list of Scope
'''

def scopify(expressionsWithIndentation):
    wrapperScope = Scope(parent=None, expression=None, content=[], indentation=-1)
    previousScope = wrapperScope

    for expr in expressionsWithIndentation:
        
        if expr.indentation < previousScope.indentation:
            while expr.indentation < previousScope.indentation:
                previousScope = previousScope.parent
        
        if expr.indentation > previousScope.indentation:
            scope = Scope(
                parent = previousScope,
                expression = expr.expression,
                content = [],
                indentation = expr.indentation)
            previousScope.content.append(scope)
            previousScope = scope

        elif expr.indentation == previousScope.indentation:
            parent = previousScope.parent
            scope = Scope(
                parent = previousScope.parent,
                expression = expr.expression,
                content = [],
                indentation = expr.indentation)
            parent.content.append(scope)
            previousScope = scope

        else:
            print("This should not have happened")
        
    return wrapperScope



