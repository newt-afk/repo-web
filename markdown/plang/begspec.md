% Initial spec
% Zeno
% 2026-04-26

# Initial Spec
Because this language is mostly for aiding visualization of how existing
languages work, it'll take some common conventions. Such as:

* `function(arg1, arg2,...)` for calling functions
* a simple type system (`int`, `char`, maybe arrays and `bool`)
* a define system similar to `#define` in C.^[If the preprocessor allows recursion, just the define system is enough to implement lambda calculus, and thus be turing complete by the Church-Turing thesis.]
* a standard library providing simple functions

At this point, most of the language could probably be written, albeit very unergonomically. 
For example, `if` could just be standard function:

```
if(condition, result_if_true, result_if_false);
```

and arithmetic would be very clear, although look quite strange
```
==(+(1, -(2, 3)), 0) // true
```

Will I end up making those keywords, or will I leave them as a standard library functions? We'll see I guess. I think it'd be funny.

The only thing that can't be made into a function is assignment, because that would be how you'd make the other functions. There, there really is nothing better than the conventional
`x = 10`. 

What'll probably happen is I'll write something that can do 3 things (in order of importance):
1. Call functions
2. Create variables
3. Create functions

The rest I'll shove into the standard library. I'll then slowly patch in various other features. 
