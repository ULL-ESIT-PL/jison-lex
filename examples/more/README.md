# Introduction to some of the lexer methods

The lexical specification at file [examples/more/more.l](./more.l) demonstrates the use of some of the lexer methods:

```js
%%
x             return 'X';
y             return 'Y';
\"[^"]*       {  // When executed with node examples/more/main.cjs 'x"he\"l\"lo"x'
                 if(yytext.charAt(yyleng-1) == '\\') { 
                   this.more(); // this.matched contains the matched text so far, and this._input contains the rest of the input string
                   console.log("yytext: "+yytext+" matched: " + this.matched + " _input: " + this._input);
                 } else {
                    console.log("yytext: "+yytext+" matched: " + this.matched + " _input: " + this._input);
                    yytext += this.input(); // swallow end quote
                    return "STRING";
                 }
               } 
.              return 'INVALID';
$              return 'EOF';
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
