# Waxx
Waxx language






$-root:
    MODIFIER    >> $-modifiers
    FLOWCONTROL => $-flow-control-expression
    default     >> $-normal-expression
    OVERHEAD    -> $-overhead-path -> $-no-state

$-normal-expression:
    default     -> $-normal-expression

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
    PAREXPRESSION  ---> $-function-parameters -> $-expecting-colon

$-expecting-colon:
    :           -> $-normal-expression

$-expecting-attribution-equals:
    =           w> {wexp: attribution, nexp: SAME, nst: none} <= => $-normal-expression










Legend:
    ->  Set state and continue
    =>  Branch out to state and continue
    >>  Redirect to state
    <=  brateIn (branch in and state back)
    w>  wrapOver (wrap the current expression in another)
    s=  set state
    ---> parse that expression recursively starting with state








public static ATOM              = variable declaration
public static CLASS             = class definition
public static FUNCTION          = function definition





Expressions:
    type:
        content = [atom, generic]
    generic:
        content = [type, type, type...]
    variable-declaration:
        content = [type, *generic, name]








EXPRESSION: MODIFIER VAR ATOM : TYPE

ATTRIBUTION:    EXPRESSION = EXPRESSION