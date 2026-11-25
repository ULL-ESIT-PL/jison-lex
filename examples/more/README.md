# Introduction to some advanced lexer methods and attributes

The lexical specification at file [examples/more/more.l](./more.l) 
and the driver [examples/more/main.cjs](examples/more/main.cjs) demonstrate 
the use of some of the lexer methods and attributes, such as the use of 
`this`, the methods `input()`, and `more()`, the attributes `matched` and `_input`.

Compile the lexer with the command:

```
npx jison-lex examples/more/more.l -t commonjs -o examples/more/lexer.js
```

and run the driver [examples/more/main.cjs](examples/more/main.cjs) with the command:

```
node examples/more/main.cjs 'x"he\"l\"lo"x'
```
You should see the following output:

```json
  {
    type: 'X',
    lexeme: 'x',
    loc: { first_line: 1, last_line: 1, first_column: 0, last_column: 1 },
    matched: 'x',
    _input: '"hello\\"world\\""y'
  },
  {
    type: 'STRING',
    lexeme: '"hello\\"world\\""',
    loc: { first_line: 1, last_line: 1, first_column: 15, last_column: 17 },
    matched: 'x"hello\\"world\\""',
    _input: 'y'
  },
  {
    type: 'Y',
    lexeme: 'y',
    loc: { first_line: 1, last_line: 1, first_column: 17, last_column: 18 },
    matched: 'x"hello\\"world\\""y',
    _input: ''
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
