% Setting up Haskell
% Me
% 2026-04-25

# Motivation

I wanna try writing a programming language. I wrote an interpreter in 11th grade for a final project, but that was following a tutorial. 
This time, I will be taking my learnings, and attempting to write a programming language from scratch. 

The language is called plang, for programming language. It's not gonna be very useful, so the name doesn't matter.

The language will fulfill some other goals though:

* AST is visualizable while generating
* Can be compiled to run on a static site
  - Might lead to performance concerns for the parser
* Must have an interpreter
* Maybe a compiler?
* Maybe an error checker?

# Setup

I selected Haskell as my language because I like it, and the result should be viewable on this site (linked here when finished).
Haskell also has an experimental WASM backend, which makes running on a static site easier.

In terms of testing, apparently Haskell has testing frameworks; I haven't dealt with those before because 
I'm used to coding for small problems (think LeetCode type questions; not project scale). Given my previous experience writing
an interpreter, there were many things to test, and so I'm thinking about how to test immediately. 

For testing, I'll try out using [HSpec](https://hspec.github.io/). It seems to be a wrapper around [HUnit](https://github.com/hspec/HUnit#readme), and can call into [Quickcheck](https://github.com/nick8325/quickcheck), 
which covers unit testing and property checking. Plus, its syntax is nice. This might change later.

Regardless, the only thing left is to decide on the syntax of the language. That will be discussed later.
