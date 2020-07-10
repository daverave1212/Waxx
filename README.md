# Waxx
Waxx language




## State Machine for Parser

$-root:
    MODIFIER    >> $-modifiers
    FLOWCONTROL => $-flow-control-expression
    ELSE        -> $-expecting-colon
    OVERHEAD    -> $-overhead-path
    VAR         >> $-var
    DATA        >> $-data-declaration
    CLASS       >> $-class-declaration
    FUNC        >> $-function-declaration
    default     -> $-normal-expression

$-normal-expression:
    default     -> $-normal-expression
    YAML        -> $-expecting-yaml-colon
    FLOWCONTROL => $-inline-if-condition (INLINEIFEXPRESSION)
    if isYaml:
        :       w> {wexp: YAMLPROPERTYVALUE, nexp: SAME, nst: none} <= => $-normal-expression

$-inline-if-condition:
    :           <= => $-inline-if-statement
    default:    -> $-inline-if-condition

$-inline-if-statement:
    else        <= => $-normal-expression
    default:    -> inline-if-statement

$-flow-control-expression:
    :           <= => $-normal-expression
    default     -> $-flow-control-expression

$-modifiers:
    MODIFIER    -> $-modifiers
    VAR         >> $-var
    CLASS       >> $-class-declaration
    FUNC        >> $-function-declaration
    DATA        >> $-data-declaration

$-var:
    VAR         -> $-var-name

$-var-name:
    ATOM        -> $-expecting-var-type

$expecting-var-type:
    :           -> $-var-type
    =           >> $-expecting-attribution-equals

$-var-type:
    ATOM        -> $-expecting-var-type-generic-or-equals

$-expecting-var-type-generic-or-equals:
    =                   >> $-expecting-attribution-equals
    GENERICEXPRESSION   -> $-expecting-var-type-generic-or-equals

$-function-declaration:
    FUNC        -> $-expecting-function-generic

$-class-declaration:
    CLASS       -> $-class-generic

$-data-declaration:
    DATA        -> $-data-name

$-expecting-function-generic:
    GENERICEXPRESSION   -> $-expecting-function-generic
    ATOM                >> $-function-name

$-class-generic:
    GENERICEXPRESSION   -> $-class-generic
    ATOM                => $-class-name

$-class-name:
    ATOM        -> ...

$-data-name:
    ATOM        => $-normal-expression

$-function-name:
    ATOM        -> $-expecting-function-parameters

$-expecting-function-parameters:
    PAREXPRESSION  ---> $-normal-expression -> $-expecting-colon

$-expecting-colon:
    :           -> $-normal-expression

$-expecting-yaml-colon:
    :           -> $-expecting-nothing

$-expecting-nothing:
    default     -> $-no-state

$-expecting-attribution-equals:
    =           w> {wexp: ATTRIBUTION, nexp: SAME, nst: none} <= => $-normal-expression

$-overhead-path:
    STRING      -> $-no-state


## Legend:
    ->  Set state and continue
    =>  Branch out to state and continue
    >>  Redirect to state
    <=  brateIn (branch in and state back)
    w>  wrapOver (wrap the current expression in another)
    s=  set state
    ---> parse that expression recursively starting with state

## Expression Types After Expressizer:
ATOM                            = ATOM
( _ )                           = Expr PAREXPRESSION: content=_  isTuple=false
(EXPRESSION, EXPRESSION, ...)   = Expr PAREXPRESSION: content=EXPRESSION,EXPRESSION,...  isTuple=true
[ _ ]                           = Expr INDEXEXPRESSION: content=_  isTuple=false
[EXPRESSION, EXPRESSION, ...]   = Expr INDEXEXPRESSION: content=EXPRESSION,EXPRESSION,...  isTuple=true

## Allowed Structures:
[MODIFIER]* VAR ATOM                            = Expr VARDECLARATION: content=ATOM
[MODIFIER]* VAR ATOM1 [: ATOM2]                 = Expr VARDECLARATION: content=ATOM1,ATOM2
[MODIFIER]* VAR ATOM1 [: ATOM2 INDEXEXPRESSION] = Expr VARDECLARATION: content=ATOM1,ATOM2,GENERICEXPRESSION
[MODIFIER]* VAR ATOM = _                        = Expr ATTRIBUTION: content=VARDECLARATION,EXPR

[MODIFIER]* CLASS ATOM                          = Expr CLASSDECLARATION: content=ATOM

[MODIFIER]* FUNC ATOM PAREXPRESSION [:]         = Expr FUNCDECLARATION: content=ATOM,PAREXPRESSION

FLOWCONTROL _1 [:] [_2]                         = Expr FLOWCONTROLEXPRESSION: content=FLOWCONTROL ATOM,PAREXPRESSION _1,EXPRESSION _2

_1 | _2                                         = _1, Expr PAREXPR: content=_2

_ YAML :                                          -> parses yaml






## Features mentioned in the thesis:
- overhead ...







Expression(_):                 ( _ )
Type(atom, Type):              : atom [ { Type } ]
Vardecl(atom, Type, _):        var atom Type [ = _ ]

var x : Array{Int} = new

    Vardecl
        var
        atom




