% Starting parser
% Zeno Xiao
% 2026-04-27

# Parser
To be able to read pcode, the interpreter/compiler must first "tokenize" the code, and create an "abstract syntax tree". This
process is split into 2 steps, "lexing" and "parsing".

Tokens
: A "word" in the programming language. It can be a variable name, function name, number, whatever. It's the smallest unit of information
the language will recognize.

Tokenize
: To turn a string into a bunch of tokens. These tokens are typically stored in an array. 

Abstract Syntax Tree
: A tree representing the tokens structure. It is often easier to move from abstract syntax tree to interpretation, than to immediately try
to interpret the list of tokens. 

Lexer
: Something that turns a string into a list of tokens. Verb form: lexing.

Parser
: Something that turns a list of tokens into an AST. Verb form: parsing. Technically, a parser simply takes
one form of data and transforms it into another, so a lexer is just a special type of parser. They are seperated in this way
to make explicit the different stages of translation; the first more pattern matching, and the later more understanding.

For example: Every function could have, as its children, all its arguments. Then we get a few things:

- Children resolve before their parents ^[Most languages work like this, but Haskell among others allows resolution to be delayed until use]
- The number of children should match the number of arguments the function expects. If it doesn't, it's known the function doesn't work.
- The type of each child should match the corresponding argument's type. If it doesn't, we can throw an error at the programmer

What does the code look like?
```
int x = 4;
char y = 'y';
int xy = +(x, -(1, 2));
```

Without worrying about creating functions, this is likely what the code will look like. There are a few things left out explicitly:

* Variables aren't modifiable. Haskell doesn't modify them, so we don't have to either. It'll be explored in a later branch.
* Strings don't exist. I'll wait until I implement lists, and then try creating a combination data type for strings.
* Parentheses don't exist outside function calls. This is mostly just because everything is either constant or a function, and so 
everything carries with it the order it should be run. I will implement parentheses on their own in the parser, because trying to 
add that in later seems like a pain.

For now, the lexer should transform that into:
```
INT name(x) ASSIGNMENT 4 END_STATEMENT
CHAR name(y) ASSIGNMENT char(y) END_STATEMENT
INT name(xy) ASSIGNMENT name(+) OPEN_PARENS name(x) COMMA name(-) OPEN_PARENS int(1) COMMA int(2) CLOSE_PARENS CLOSE_PARENS END_STATEMENT
```

which should be fairly easy. However, for purposes of visualization, it'll be done token by token.
First, let's what the names are allowed to have. It seems like our names have to be rather permissive, but they can't include commas or parentheses.
They can't coincide with keywords, so `int` and `char` are out, and so is '=' and ';'. For now, that can be the rules.
