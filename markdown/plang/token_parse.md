% Parsing tokens
% 2026-05-07
% Zeno Xiao

# Understanding tokens
Now that tokens exist, we must turn the sequence of tokens into an abstract syntax tree. 
Since the language is so simple, there is very little to actually talk about.

First off, what is the lowest possible expression that can be run? It'll be one of two things: 
a value (a character or integer), or a function call that evaluates to some value (character, integer, not at all).
For now, simply assume if a function doesn't return meaningful values, the returned value is garbage.

A function call is simply a name, followed by paired brackets, optionally with commas. 
The first comma denotes the end of the first argument, the second comma the second, etc.
For the interpreter, then, it is simply a matter of evaluating all the children of the function, 
and then passing those in as simple value arguments. 

A variable declaration requires a type, a name, and '=', with the entire statement ending at some point.

Since the language consists of only these possibilities, we're done. Every line ended with END_STATEMENT 
is conceptually the child to a "program" node, with the first line being the first child, the second line the second, etc.
Because the first child is evaluated first, this executes normally.

AT SOME POINT, I'LL PUT RAILROAD DIAGRAMS HERE DESCRIBING WHAT I SAID VISUALLY.
