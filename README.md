# Waxx
Waxx language







root:
    MODIFIER    >> reading-modifiers

reading-modifiers:
    MODIFIER    -> reading-modifiers
    ATOM        >> reading-type
    CLASS       >> reading-class-declaration

reading-class-declaration:
    CLASS       -> expecting-class-generic

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
    ATOM        -> ...

reading-class-name:
    ATOM        -> ...



Legend:
    ->  Set state and continue
    =>  Branch out to state and continue
    >>  Redirect to state
    <=  brateIn (branch in and state back)









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