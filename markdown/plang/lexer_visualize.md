% Visualizing the lexer
% 2026-04-30
% Zeno Xiao

The ideal would be to have SVGs animate the text turning into tokens.

For example:

<svg width="350" height="60" xmlns="http://www.w3.org/2000/svg">
    <text y="20">int x = 4;</text>
</svg>

should have a following frame, turning into 

<svg width="350" height="60" xmlns="http://www.w3.org/2000/svg">
    <rect width="35" height="35" fill="lightgreen"/>
    <text y="20">INT</text>
    <text x="40" y="20">x = 4;</text>
</svg>

or similar. The colours of the rectangles would represent the type of token
the lexer has decided the token was (data type, name, etc), and perhaps different hues from the parser
would further distinguish, but for now the idea is to make some SVGs.

SVGs can be very pretty (see [here](https://www.joshwcomeau.com/svg/friendly-introduction-to-svg/))
but complicated animations might seem out of reach. Thankfully, the animations
needed for this step are just the two: a slide to the right, and a transition from a single word to a 
token's box-name combo. This can be done with a simple zoom in and out. After the animation finishes, 
simply replace it with another SVG, which is simply the next frame. Repeat until the entire document is done. 

In that case, each lex must take in a few more things, and output a few more things. Ideally, the 
type signature would look something like
```
lex_visual:: ([Token], String, SVG_Diagram) -> ([Token], String, SVG_Diagram, SVG_Diagram)
```

where the inputs SVG_Diagram is the input state, the outputs first SVG_Diagram is the one with the transitions, and 
the second is just the ending state. At that point, the entire thing can be simply written directly into the document, 
because SVGs are inline-able in HTML. 

A better first step may, however, be to first ignore the animations, and just work on a weaker version:
```
lex_visual_fast :: ([Token], String, SVG_Diagram) -> ([Token], String, SVG_Diagram)
```
where the input and output diagrams are strictly the beginning and ending frames. 

Some more contracts we can try implementing:

1) Lines can only shift down, and they shift down once per entry into a line.
2) Words in a line only shift right, and only shift right when a token is introduced.
3) Otherwise, every token, word, and line has no effect on each other.

These guarantee that all previously generated tokens don't change, and only text moves. 
