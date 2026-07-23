% Interpreting an AST
% 2026-06-06
% Zeno Xiao
# Interpretation
Now that the AST is set up, it's as simple as: 

1. run the program from top to bottom (first to last element)
2. Given an assignment, add a new symbol to a symbol table of variables and functions
3. Given a name used as a variable, look it up in the table
4. Given a name used as a function, look it up in another, function table, and pass in the values of the corresponding expressions.

From here, the programmer need only provide the "primitive functions", and the program can run.

Of course, compilation is slightly different. That will be discussed in another post, translating to LLVM. I'm debating whether to do one compiling to x86-64 or RISC.
