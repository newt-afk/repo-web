% Assembly specification
% 2026-05-12
% Zeno Xiao

# Setting up instructions

Obviously the instructions in TIS-100 cannot be directly input into something; 
they have to be converted into instructions. 

This post will work out specifically the word size and instruction formats.

Looking at [the TIS-100 manual](https://www.zachtronics.com/images/TIS-100P%20Reference%20Manual.pdf) 
the needed assembly instructions can be determined:

- MOV
- SWP
- SAV
- ADD
- SUB
- NEG
- JMP
- JEZ
- JNZ
- JGZ
- JLZ
- JRO

NOTE: NOP is defined in the manual as equivalent to ADD NIL; it doesn't have to have its own instruction.
Then there is a total of 12 instructions, which means it fits in theoretically $\ceil{\log_2(12))=4$ bits. 

Some behaviour: after the last instruction is run, the entire things restarts from the first instruction. 
This all occurs in a single clock tick. Thus, perhaps during the fetching of the next instruction, an 
instruction of 0x0 (of the given width) will automatically trigger fetching the first instruction instead. Alternatively, 
the program could be written repeatedly into memory. 

Some more architecture details: there are 2 working memory registers, and 4 IO registers; the two working memory registers are ACC and BAK; BAK is not 
addressable by the program directly, and thus doesn't need an address encoded for it. ACC is the accumulator, and is what ADD, SUB, etc work upon. 
The IO registers are TOP, DOWN, LEFT, and RIGHT. While not explicitly referred to as registers, they hold information until something else notices and 
reads the information from them, after which normal execution continues. There are also the NIL, ANY, and LAST ports which 
sound very hard to implement. 

All in all though, there are 9 registers, 8 addressable. Thus 3 bits can be used to address the register.

However, the data word size goes from -999 to 999, which means it has 1999 possible values, so at least 11 bits have to be used if I want it to perfectly mirror the 
original. However, I don't believe the actual maximum and minimum values matter, so I'm willing to compromise, if the other stuff
mean I can deal with simple 8-bit registers instead of 16-bit (which will be slightly harder to design for).

Every instruction should take the same amount of clock cycles, but I'm unwilling to restrict myself to
making every instruction take 1 clock cycle. My ideal would have any instruction which takes a number, be itself an explicit instruction, and implicitly
require 2 clock cycles; one for fetching and reading the instruction, and the second for fetching and loading the data.
This way the entire thing can theoretically sync with duplicates of itself.

This is all prework, next up will be matching instructions to codes, and figuring out how things work better.
