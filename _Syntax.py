# This file holds the design of the language's syntax
# It has nothing to do with python, it just looks nice





###############

def myFunc ( a , b ) :

'def'       > Expecting ATOM
'myFunc'    > True > Expecting '('
'('         > True > Expecting VAR_DECL_LIST
    a , b   > [a b]




Array < var > mystring 

# Idea : identify lists ( 'a,b,c' )

#####################





# ATOM
Any literal

# Operator
Any accepted literal or operators



# TYPE
ATOM < type_list >
ATOM

# TYPE_LIST
TYPE , TYPE , TYPE

# VAR_DECL
TYPE ATOM

# VAR_DECL_LIST
VAR_DECL , VAR_DECL , VAR_DECL

# FUNC_DECL
func ATOM ( VAR_DECL_LIST ) :

# EXPR
ATOM
EXPR OPERATOR EXPR


