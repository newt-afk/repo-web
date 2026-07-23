function printDebug(msg) { document.getElementById("DEBUG ELEMENT").innerHTML = "<samp>" + msg + "</samp>" }

let outTerminal = {
    cmdMode: true,
    tprint(msg) {
        const newspan = document.createElement("span");
        newspan.classList.add("termhistory");
        newspan.innerText = msg;
        terminal.insertBefore(newspan, line);
    },
    tprinterr(msg) {
        const newspan = document.createElement("span");
        newspan.innerText = msg+"\n";
        newspan.classList.add("termhistory","error");
        terminal.insertBefore(newspan, line);
    },
    tprintline(msg) {
        outTerminal.tprint(msg+"\n");
    },
    tprintint(int) {
        outTerminal.tprint(msg.toString());
    },
    tprintintln(int) {outTerminal.tprintline(int.toString());},
    async treadline() {
        return new Promise(resolve => {
            let handler = (e) => {
                if (e.keyCode == 13) {
                    terminput.removeEventListener("keydown",handler);
                    resolve(terminput.value);
                }
            }
            terminput.addEventListener("keydown",handler);
        });
    }
}

const display = document.getElementById("interpretation visualization").getContext("2d");
// gotta somehow implement algebraic data types here
// also use canvas; probably easier than trying to hack them into SVGs after the fact
display.font = "20px arial";

const animationdelay = 20;
const frameperiod = 250;

function sleep(ms) {
    return new Promise(r => setTimeout(r,ms));
}

const max = (a,b) => a>b?a:b;
const min = (a,b) => a<b?a:b;

// Tokens and lexing
class Token {
    constructor(settype, data) {
        if (typeof settype != "string") this.type = "LEX_ERROR";
        else this.type = settype;
        let validTypes = "INT_TOK CHAR_TOK ASSIGNMENT_TOK END_TOK INTEGER NAME CHAR OPEN_PAREN CLOSE_PAREN COMMA LEX_ERROR".split(" ");
        let dataTypes = "INTEGER CHAR NAME".split(" ");
        if (!validTypes.includes(this.type)) throw new Error(this.type + " is not a valid token type");
        if (dataTypes.includes(this.type)) {
            switch (this.type) {
                case "INTEGER":
                    if (typeof data != "number" || !Number.isInteger(data)) throw new Error("Bad token dressed as Integer");
                    else this.data = data;
                    break;
                case "CHAR":
                    if (typeof data != "string" || data.length !== 1) throw new Error("Errored on "+data+": Bad token dressed as Character");
                    else this.data = data;
                    break;
                case "NAME":
                    if (typeof data != "string") throw new Error("Bad token dressed as Name");
                    else this.data = data;
                    break;
                case "LEX_ERROR":
                    this.data = data; // no type checks; whatever the error is, please give it.
                    break;
                default:
                    throw new Error("Internal logic error, IDK how you got here");
            }
        }
    }

    toString() {
        if ("INT_TOK CHAR_TOK ASSIGNMENT_TOK END_TOK OPEN_PAREN CLOSE_PAREN COMMA".split(" ").includes(this.type)) return this.type;
        return this.type + "(" + this.data.toString() + ")";
    }
    toRect() {
        let colour = this.data? "red": "blue";
        return {innerText: this.toString(), colour: colour, width: display.measureText(this.toString()).width + 10};
    }
}

class ASTNode {
    constructor(toks) {
        this.data = toks;
        this.type = "unresolved";
        this.active = false;
        this.children = [];
    }
    resolve() {
        if (this.data.filter(v => v.type == "END_TOK").length != 0) { // if you have statement end pieces, you're a program.
            this.type = "PROGRAM"
            this.children = [[]];
            for (let dat of this.data) {
                if (dat.type == "END_TOK") this.children.push([]);
                else this.children.at(-1).push(dat);
            }
            this.children = this.children.slice(0,-1).map(v => new ASTNode(v));
        }else if (this.data.length > 2 && this.data[2].type == "ASSIGNMENT_TOK") {
            this.type = "ASSIGN";
            this.children = [new ASTNode(this.data.slice(3))];
            this.name = this.data[1].data;
        } else if (this.data.length == 1 && "CHAR INTEGER".slice(" ").includes(this.data[0].type)) {
            this.type = "CONSTANT"
            this.val = this.data[0].data;
        } else if (this.data.length == 1 && this.data[0].type == "NAME") {
            this.type = "VARIABLE"
            this.name = this.data[0].data;
        }else if (this.data.length > 1 && this.data[0].type == "NAME" && this.data[1].type == "OPEN_PAREN" && this.data.at(-1).type == "CLOSE_PAREN") {
            this.type = "CALL"
            this.name = this.data[0].data;
            if (this.data[2].type != "CLOSE_PAREN") { // start collecting variables.
                let arg = [];
                let args = [];
                let parenCounter = 0;
                for (let ttok of this.data.slice(2,-1)) {
                    if (ttok.type == "COMMA" && parenCounter == 0) {
                        args.push(new ASTNode(arg));
                        arg = [];
                    }
                    else arg.push(ttok);
                    if (ttok.type == "OPEN_PAREN") parenCounter++;
                    else if (ttok.type == "CLOSE_PAREN") parenCounter--;
                }
                args.push(new ASTNode(arg));
                this.children = args;
            }
        } else {
            this.type = "PARSE_ERROR";
        }
    }
    toString() {
        switch (this.type) {
            case "PARSE_ERROR":
                return "PARSE_ERROR";
            case "CONSTANT":
                return "CON(" + this.val +")";
            case "VARIABLE": 
                return "V(" + this.name + ")";
            case "CALL":
                return "C(" + this.name + ")";
            case "ASSIGN":
                return "A(" + this.name + ")";
            case "PROGRAM": return "PROGRAM";
            case "unresolved":
                return this.data.map(v => v.toString()).join(" ")
                break;
            default:
                throw Error("SOMETHING TERRIBLE HAPPENED WITH YOUR LOGIC PLEASE ADVISE");
        }
    }
    toRect() {
        // program = black, parse error = red, blue, green, turqoise, purple
        let colour = "red";
        switch (this.type) {
            case "PROGRAM": 
                colour = "black";
                break;
            case "ASSIGN": 
                colour = "blue";
                break;
            case "CALL": 
                colour = "green";
                break;
            case "VARIABLE": 
                colour = "violet";
                break;
            case "CONSTANT": 
                colour = "purple";
                break;
        }
        
        return {innerText: this.toString(),strokecolour:colour,fillcolour:this.active?"#ff000060":"#ffffff00",width:display.measureText(this.toString()).width + 10};
    }
}

let stdmap = new Map(Object.entries({
    "+": (a,b) => a+b,
    "-": (a,b) => a-b,
    "*": (a,b) => a*b,
    "/": (a,b) => a/b,
    "print": outTerminal.tprint,
    "println": outTerminal.tprintline,
    "printint": outTerminal.tprintint,
    "printintln": outTerminal.tprintintln,
    "readChar": async () => {
        let c = await outTerminal.treadline();
        if (c=="") {throw Error("No character typed")} 
        else return c[0];
    },
}));

// only does a single token at a time for integration with visualization function.
function lex(code) {
    if (typeof code !== "string") throw new Error("Attempted to lex " + typeof code);
    while (/\s/.test(code.at(0))) code = code.slice(1);
    let tok = new Token("LEX_ERROR", "EMPTY");
    let cut = 0;
    if (code === "") return {token: tok, rest: ""};
    const possibleToks = [
        ["int", "INT_TOK"],
        ["char", "CHAR_TOK"],
        ["=","ASSIGNMENT_TOK"],
        [";","END_TOK"],
        ["(","OPEN_PAREN"],
        [")","CLOSE_PAREN"],
        [",","COMMA"]
    ]
    for (let i = 0; i < possibleToks.length; i++) {
        if (code.startsWith(possibleToks[i][0])) {
            tok = new Token(possibleToks[i][1]);
            cut = possibleToks[i][0].length;
        }
    }
    if (tok.type == "LEX_ERROR") {
        let i = 0;
        if (code.startsWith("'")) { // character
            if (code.at(2) !== "'") throw new Error("Character not correctly terminated");
            tok = new Token("CHAR", code.at(1));
            cut = 3;
        }else if (/\d/.test(code.at(0))) { // digit
            for (; /\d/.test(code.at(i)) && code.at(i) != undefined; i++);
            tok = new Token("INTEGER", parseInt(code.slice(0,i)));
            cut = i;
        } else {
            for (; /[^\s(),;=']/.test(code.at(i)) && code.at(i) != undefined; i++);
            tok = new Token("NAME", code.slice(0,i));
            cut = i;
        }
    }
    return {token: tok, rest: code.slice(cut)};
}

document.getElementById("interpret button").addEventListener("click", async function () {
    display.font = "30px Arial";
    line.innerText = "";
    terminput.focus();
    outTerminal.cmdMode = false;
    display.maxheight = display.canvas.height;
    display.maxwidth = display.canvas.width;
    let inputstring = document.getElementById("interpretted text").value;
    let evalmap = new Map(stdmap);

    let lines = inputstring.split("\n");
    let tokenlines = [];
    display.maxheight = max(display.canvas.height,lines.length*40+10);
    while (lines.length != 0) {
        let nextline = lines.shift();
        tokenlines.push([]);

        while (nextline.length != 0) {
            let tokp = {token:new Token("LEX_ERROR",""),rest:""};
            try {
                tokp = lex(nextline);
            } catch(e) {
                printDebug(e);
                return;
            }
            nextline = tokp.rest;

            if (tokp.token.type == "LEX_ERROR") {
                printDebug("Lexing error!!");
                throw Error("Error lexing input text");
            }

            tokenlines.at(-1).push(tokp.token);
            // clear screen
            display.clearRect(0,0,display.maxwidth,display.maxheight);
            // add scaling so everything fits
            display.maxwidth = max(
                max(
                    display.canvas.width,
                    lines.map(v => display.measureText(v).width+10).reduce((p,v)=>p+v,0)
                ), 
                max(
                    tokenlines.slice(0,-1).map(
                        va=>va.map(v=>v.toRect().width+10).reduce((p,v)=>p+v)
                    ).reduce((a,b) => max(a,b),0),
                    tokenlines.at(-1).map(v=>v.toRect().width+10).reduce((p,v)=>p+v,0) + display.measureText(nextline).width + 10
                )
            )
            
            let scaling = min(display.canvas.width/display.maxwidth,display.canvas.height/display.maxheight);
            display.scale(scaling,scaling);

            // now just display: each token line corresponds to a new line of all tokens
            // except the last, which is continued by text from lines.
            // so tokenlines[0..-2] are on their own lines, while tokenlines[-1] is continued by
            // nextline, and the after that is all the lines from lines[0..].
            let lx = 10, ly = 40;
            
            for (let tokenline of tokenlines) {
                lx = 10;
                for (let token of tokenline) {
                    display.save();
                    let rect = token.toRect();
                    display.strokeStyle = rect.colour;
                    display.strokeRect(lx-5,ly-30+2,rect.width,37);
                    display.fillText(token.toString(),lx,ly,rect.width - 10);
                    lx += rect.width + 10;
                    display.restore();
                }
                display.maxwidth = max(display.maxwidth, lx);
                ly += 40;
            }
            display.fillText(nextline,lx,ly-40);
            for (let pline of lines) {
                display.fillText(pline,10,ly);
                ly +=40;
            }
            display.setTransform(1,0,0,1,0,0);
            await sleep(frameperiod);
        }
    }
    let programtoks = tokenlines.flat();
    let tree = new ASTNode(programtoks);
    // take rendering inspiration from token rendering
    // do a BFS so we don't have to worry about layers; first everything is in a single unresolved PROGRAM node
    // then the next resolves one layer of the AST, yada yada until it's all done
    // maybe use a queue if you wanna do one by one?
    // rendering can use a recursive function which takes coords: first calculate max width of each layer, then use recursion to return the height.
    let layerwidths = [];
    let resolvequeue = [tree];
    let rendererer = function () {};
    while (resolvequeue.length != 0) {
        // resolve
        let resolvenode = resolvequeue.shift();
        resolvenode.resolve();
        resolvenode.children.forEach(v => resolvequeue.push(v));

        // render
        display.setTransform(1,0,0,1,0,0);
        display.clearRect(0,0,display.maxwidth,display.maxheight);
        display.beginPath();
        display.closePath();
        // width calculation
        let layerwidths = [0];
        let widthqueue = [tree];
        let layerlength = 1;
        while (widthqueue.length != 0) {
            if (layerlength == 0) {
                layerwidths.push(0);
                layerlength = widthqueue.length;
            }
            layerlength--;
            if (layerwidths.at(-1) < widthqueue[0].toRect().width) 
                layerwidths[layerwidths.length-1] = widthqueue[0].toRect().width;
            widthqueue.shift().children.forEach(v => widthqueue.push(v));
        }
        let layerxcoord = layerwidths.map((v,i) => v+40).reduce((p,v) => p.concat([p.at(-1)+v]),[10]);
        let connections = [];
        display.maxwidth = max(layerxcoord.at(-1),display.canvas.width);
        heightcalc = (y, ast) => {
            let cy=y;
            for (let c of ast.children) {
                cy = heightcalc(cy,c);
            }
            return ast.children.length == 0?y+40:cy;
        }
        display.maxheight = max(heightcalc(40,tree),display.canvas.height);
        let scaling = min(display.canvas.width/display.maxwidth,display.canvas.height/display.maxheight);
        display.scale(scaling,scaling);

        // recursive function that renders
        let recfunc = (x,y,n) => {
            let xcoord = x[0];
            display.save();
            let rect = n.toRect();
            display.strokeStyle = rect.strokecolour;
            display.fillStyle = rect.fillcolour;
            display.fillRect(xcoord-5,y-30+2,rect.width,37);
            display.strokeRect(xcoord-5,y-30+2,rect.width,37);
            display.fillStyle = "black";
            display.fillText(n.toString(),xcoord,y,rect.width-10);
            display.restore();
            let cy = y; // child y

            // draw children
            for (let c of n.children) {
                let v = [xcoord+rect.width-5,y-10,x[1]-5,cy-10];
                let mid = v[0]+(v[2]-v[0])/2;
                display.moveTo(v[0],v[1]);
                display.lineTo(mid,v[1]);
                display.lineTo(mid,v[3]);
                display.lineTo(v[2],v[3]);
                display.stroke();
                cy = recfunc(x.slice(1),cy,c);
            }
            return n.children.length == 0?y+40:cy;
        }
        recfunc(layerxcoord,40,tree);
        await sleep(frameperiod);
        rendererer = () => { // done here because the layerxcoords in local to the while loop
            // didn't move the layerxcoords outside because it doesn't matter for the rest of the code, outside of for rendering
            display.clearRect(0,0,display.maxwidth,display.maxheight);
            display.beginPath();
            display.closePath();
            recfunc(layerxcoord,40,tree);
            while (vartable.rows.length > 1) vartable.deleteRow(1);
            evalmap.forEach((v,j) => {
                let row=vartable.insertRow(1);
                if (!stdmap.has(j)) {
                    row.insertCell().innerHTML="<samp>"+j+"</samp>";
                    row.insertCell().innerHTML=v.toString();
                }
            })
        }
    }
    let eval = async (ast) => {
        ast.active = true;
        let retval;
        rendererer();
        await sleep(frameperiod);
        switch (ast.type) {
            case "PROGRAM":
                for (let a of ast.children) await eval(a);
                break;
            case "CONSTANT": 
                retval = ast.val;
                break;
            case "VARIABLE":
                retval = evalmap.get(ast.name);
                break;
            case "CALL":
                let args = [];
                for (let arg of ast.children) args.push(await eval(arg));
                retval = await evalmap.get(ast.name)?.call(undefined,...args);
                if (retval == undefined) throw Error("Something went wrong calling the function");
                break;
            case "ASSIGN":
                evalmap.set(ast.name, await eval(ast.children[0]))
        }
        ast.active = false;
        rendererer();
        await sleep(frameperiod);
        return retval;
    }
    try {
        await eval(tree);
    } catch (e) {
        outTerminal.tprinterr(e.toString());
        outTerminal.tprintline("Program killed.");
    } finally {
        // program isn't running, so clean up actives.
        let p = (ast) => {
            ast.active = false;
            ast.children.forEach(p);
        }
        p(tree);
        rendererer();

        line.innerText = "> ";
        outTerminal.cmdMode = true;
    }
});

terminput.addEventListener("keydown", async function (e) {
    if (e.keyCode == 13) {
        outTerminal.tprintline(line.innerText + terminput.value);
        if (outTerminal.cmdMode) {
            switch (terminput.value) {
                case "clear":
                    document.querySelectorAll('.termhistory').forEach(e => e.remove());
                    break;
                default:
                    break;
            }
        }
        await sleep(1);
        terminput.value = "";
    }
})