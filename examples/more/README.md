# Introduction to some of the lexer methods

The lexical specification at file [examples/more/more.l](./more.l) demonstrates the use of some of the lexer methods:

```js
%%
x             { console.log(getInfo(this)); return 'X'; }
y             { console.log(getInfo(this)); return 'Y'; }
\"[^"]*       {  // When executed with node examples/more/main.cjs 'x"he\"l\"lo"x'
                 if(yytext.charAt(yyleng-1) == '\\') { // The first time the match will be '"he\\'
                   this.more(); 
                   console.log(getInfo(this));
                 } else {
                    yytext += this.input(); // swallow end quote
                    console.log(getInfo(this));
                    return "STRING";
                 }
               } 
.              return 'INVALID';
$              return 'EOF';

%%
function getInfo(lexer) {
    // this.matched contains the matched text so far, and 
    // this._input contains the rest of the input string. 
    const { yytext, matched, _input } = lexer;
    return JSON.stringify({ yytext, matched, _input }, null, 0);
}
```

We compile the lexer with the command:

```
npx jison-lex examples/more/more.l -t commonjs -o examples/more/lexer.js
```

and run the driver `examples/more/main.cjs` with the command:

```
node examples/more/main.cjs 'x"he\"l\"lo"x'
```
```
{"yytext":"x","matched":"x","_input":"\"he\\\"l\\\"lo\"x"}
{"yytext":"\"he\\","matched":"x\"he\\","_input":"\"l\\\"lo\"x"}
{"yytext":"\"he\\\"l\\","matched":"x\"he\\\"l\\","_input":"\"lo\"x"}
{"yytext":"\"he\\\"l\\\"lo\"","matched":"x\"he\\\"l\\\"lo\"","_input":"x"}
{"yytext":"x","matched":"x\"he\\\"l\\\"lo\"x","_input":""}
[
  {
    type: 'X',
    lexeme: 'x',
    loc: { first_line: 1, last_line: 1, first_column: 0, last_column: 1 }
  },
  {
    type: 'STRING',
    lexeme: '"he\\"l\\"lo"',
    loc: { first_line: 1, last_line: 1, first_column: 8, last_column: 12 }
  },
  {
    type: 'X',
    lexeme: 'x',
    loc: { first_line: 1, last_line: 1, first_column: 12, last_column: 13 }
  }
]
```

1. to access the lexer object via `this`
2. The use of the `input()` method to get the next incoming input

   ```js
   { 
     input: function () {
       var ch = this._input[0];
       this.yytext += ch;
       this.yyleng++;
       this.offset++;
       this.match += ch;
       this.matched += ch;
       var lines = ch.match(/(?:\r\n?|\n).*/g);
       if (lines) {
           this.yylineno++;
           this.yylloc.last_line++;
       } else {
           this.yylloc.last_column++;
       }
       if (this.options.ranges) {
           this.yylloc.range[1]++;
       }

       this._input = this._input.slice(1);
       return ch;
     }
   }
   ```
3. The use of the `more()` method to indicate that the next matched text should be appended to the current `yytext` instead of replacing it. When called from action, caches matched text and appends it on next action

   ```js
   {
     more: function () {
       this._more = true;
       return this;
     }
   }
   ```
