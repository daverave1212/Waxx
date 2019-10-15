# Waxx
Waxx language


# Flow:
> file.waxx
> Lexer.readFileAndSplit(file.waxx)     ->   WordUtils.StringLine[]
> WordUtils.stringLinesToWordLines(stringLines) ->  WordUtils.WordLine[]
> Parenthesiser.parenthesise(...)