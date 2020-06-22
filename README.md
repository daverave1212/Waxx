# Waxx
Waxx language




## State Machine for Parser

$-root:
    MODIFIER    >> $-modifiers
    FLOWCONTROL => $-flow-control-expression
    OVERHEAD    -> $-overhead-path -> $-no-state
    VAR         >> $-var
    CLASS       >> $-class-declaration
    FUNC        >> $-function-declaration
    default     -> $-normal-expression

$-normal-expression:
    default     -> $-normal-expression
    |           => $-normal-expression (PAREXPRESSION)
    YAML        => $-expecting-yaml-colon
    if isYaml:
        :       w> {wexp: YAMLPROPERTYVALUE, nexp: SAME, nst: none} <= => $-normal-expression

$-flow-control-expression:
    :           <= => $-normal-expression
    default     -> $-flow-control-expression

$-modifiers:
    MODIFIER    -> $-modifiers
    VAR         >> $-var
    CLASS       >> $-class-declaration
    FUNC        >> $-function-declaration

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
    =               >> $-expecting-attribution-equals
    INDEXEXPRESSION -> $-expecting-var-type-generic-or-equals

$-function-declaration:
    FUNC        -> $-expecting-function-generic

$-class-declaration:
    CLASS       -> $-expecting-class-generic

$-expecting-function-generic:
    INDEXEXPRESSION -> $-expecting-function-generic
    ATOM            >> $-function-name

$-class-generic:
    INDEXEXPRESSION -> $-class-generic
    ATOM            => $-class-name

$-class-name:
    ATOM        -> ...

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
- my
- overhead ...
- data class
- yaml support
- pipe operator