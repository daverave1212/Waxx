# Waxx
Waxx language







root:
    MODIFIER    >> reading-modifiers

reading-modifiers:
    MODIFIER    -> reading-modifiers
    ATOM        >> reading-type
    CLASS       >> reading-class-declaration
    FUNC        >> reading-function-declaration

reading-function-declaration:
    FUNC        -> expecting-function-generic

reading-class-declaration:
    CLASS       -> expecting-class-generic

expecting-function-generic:
    <           => reading-generic-inner
    ATOM        => reading-function-name

expecting-class-generic:
    <           => reading-generic-inner
    ATOM        => reading-class-name

reading-type:
    ATOM        -> expecting-generic

expecting-generic:
    <           => reading-generic-inner
    ATOM        >> reading-var-name

reading-generic-inner:
    >           <=
    ATOM        -> reading-generic-inner

reading-var-name:
    ATOM        -> expecting-attribution-equals

reading-class-name:
    ATOM        -> ...

reading-function-name:
    ATOM        -> ...

expecting-attribution-equals:
    =           w> {wexp: attribution, nexp: SAME, nst: none} <= => reading-attribution-right






Tentative below:
...
    (           => reading-par-expression

reading-par-expression:
    )           <=
    (           => reading-par-expression
    ,           w> reading-sub-expression <= => reading-sub-expression
    _           -> reading-par-expression

reading-sub-expression:
    (           => reading-par-expression
    ,           <= => reading-sub-expression
    )           <= <=



Legend:
    ->  Set state and continue
    =>  Branch out to state and continue
    >>  Redirect to state
    <=  brateIn (branch in and state back)
    w>  wrapOver (wrap the current expression in another)
    s=  set state
    e=  set expression type









public static ATOM              = variable declaration
public static CLASS             = class definition
public static FUNCTION          = function definition





Expressions:
    type:
        content = [atom, generic]
    generic:
        content = [type, type, type...]
    variable-declaration:
        content = [type, name]