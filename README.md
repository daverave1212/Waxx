# Waxx
Waxx language


# Flow:
> lines = WordUtils.readFIleIntoLines('file.waxx')  : 
> lines = Splitter.splitLines(lines)
> Lexer.readFileAndSplit(file.waxx)     ->   WordUtils.StringLine[]
> WordUtils.stringLinesToWordLines(stringLines) ->  WordUtils.WordLine[]
> Parenthesiser.parenthesise(...)