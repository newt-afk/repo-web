% PLang implementation
% Zeno Xiao
% 2026-07-20

# Overview
This discusses the interpreter as written on 2026-07-20. 

By reading through, you should learn basic ideas for how interpreted languages work.

The process largely is lexing, parsing, then interpreting. 

This post uses Haskell, but you don't need to know Haskell to read the document.

Note: some of the data have weird names. That's my bad. Just ctrl-shift-i and change it yourself if it bothers you too much.

# Lexing
Lexing turns text into tokens, where tokens are explicitly the smallest unit of information for the programming language.

For example, writing `int` to the interpreter, reads as the INT_TYPE token or similar. 
Thus, the lexing function would have type 

~~~~~ {#lex .haskell .numberlines}
lexDirect :: String -> [Token]
~~~~~~~~

Bearing in mind that some data is user-defined (variable names, integer values, etc), tokens sometimes must hold other data.
In OOP languages, this might mean defining an enum or abstract class, where token types inherit from.
In Haskell, sum types act like enhanced enums which you can attach data to 
(maybe Rust as well? I've never used^[technically, Rust enhanced enums come after Haskell sum types, and enums are just a special case of sum types, but that's just technicalities]).
In the case of plang, the Haskell implementation uses the following definition:

~~~~~ {#tokens .haskell .numberlines }
data Token = INT
           | CHAR
           | ASSIGNMENT
           | END_STATEMENT
           | Num Int
           | Name String
           | Ch Char
           | OPEN_PARENS
           | CLOSE_PARENS
           | COMMA
           | LEX_ERROR
~~~~~~

To read: "Token can be INT, or CHAR, or ... or Num with an Int attached, or a Name with a String attached, or ...".

Plang ignores spaces, and the idea is:

~~~~~
"int" -> INT
"char" -> CHAR
";" -> END_STATEMENT
"=" -> ASSIGNMENT
"(" -> OPEN_PARENS
")" -> CLOSE_PARENS
"," -> COMMA
"'k'" -> Ch 'k'
"123" -> Num 123
"anything_else" -> Name "anything_else"
~~~~~

where the last 3 were examples. Specifically, characters are 3-character sequences with the first and last being single ticks, and the second character being the value.
Numbers are any sequence begun with a digit. Everything else is read as a name, terminated by any of (;=,) and space.
This logic is implemented by the `lex` function, which the `lexDirect` function calls multiple times, until the string is completely consumed.

In the webpage, the lexing is when the text turns into lines of rectangles

# Parsing
Once the text has turned into a line of tokens, the tokens can then be matched against to produce an AST: Abstract syntax tree. This is a tree structure which describes 
the structure of the code, and for simpler languages (like plang), traversing an AST tells you directly how to run it.

A parsing function has type signature `[Token] -> AST` (where `[a]` means a list, where each element is of type `a`).

In Haskell, the Plang AST is

~~~~ {#AST .haskell .numberlines}
data AST = PARSE_ERROR
         | VAR String
         | CoInt Int
         | CoChar Char
         | ASSIGN String AST
         | CALL String [AST]
         | PROGRAM [AST]
~~~~~   

`PROGRAM` takes a line of ASTs, which are statements, while `CALL` takes a String (name of the function) and a list of ASTs (its arguments) which are expressions. `ASSIGN` also takes
a string (name of the assigned variable) and an expression.

While not made explicit in the Plang AST, there is a difference between expressions and statements. One way to think about it is statements don't use what they return, while expressions are
just ASTs which evaluates to values. Above, `ASSIGN` is the only explicit statement, while each of `CALL`, `VAR`, `CoInt`, and `CoChar` return the function evaluation, the value of the variable, 
the number, and the character respectively. `PROGRAM` is neither statement or expression, because it represents the entire program.
Expressions can be statements, but their return values are discarded. Since expressions ultimately evaluate to characters or numbers, `CALL` and `ASSIGN` use them for their arguments/value.

Below are some railroad diagrams, showing how these are parsed.

In the webpage, parsing takes place when the lines of rectangles are rearranged into the tree.

# Interpretation

When interpreting, I prefer to use a map to store variables and values. Each function and variable is stored in the same map.
This means I can write a "standard library" fairly easily by writing a small map, which contains the subset of functions which are provided by default.

As said, Plang allows execution based entirely on the AST. Specifically, the expressions return values are fairly easy to evaluate.

`CoInt` and `CoChar` return the Int and Char associated, so `CoChar 'k'` returns `'k'` and `CoInt 1` returns 1.

`VAR` looks up the string in the map, and returns whatever the value is.

`CALL` evaluates all of its ASTs, looks up the string in the list, and tries to apply the result on the list of evaluated expressions.

`ASSIGN` evaluates its expression, and inserts it into the map, with its string as the key.

`PROGRAM` just evaluates each of its statements, ignoring the result until everything is done.

In the webpage, interpretation takes place when the AST starts flashing; the AST nodes which flash are being evaluated.

