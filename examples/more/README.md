# Introduction to some advanced lexer methods and attributes

The lexical specification at file 
- [examples/more/more.l](./more.l) 
- and the driver [examples/more/main.cjs](examples/more/main.cjs) 

    ```js
    const { lexer, lex } = require("./lexer.js");
    const input = process.argv[2] || 'x"h\\nello\\"world\\""y';
    lexer.setInput(input);

    const results = [];

    while ((token = lex()) !== 'EOF') {
        results.push({ 
            type: token, 
            lexeme: lexer.yytext, 
            loc: lexer.yylloc, 
            matched: lexer.matched,
            _input: lexer._input, 

        });
    }

    console.log(JSON.stringify(results, null, 2));
    ```

demonstrate 
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
[
  {
    "type": "X",
    "lexeme": "x",
    "loc": {
      "first_line": 1,
      "last_line": 1,
      "first_column": 0,
      "last_column": 1
    },
    "matched": "x",
    "_input": "\"hello\\\"world\\\"\"y"
  },
  {
    "type": "STRING",
    "lexeme": "\"hello\\\"world\\\"\"",
    "loc": {
      "first_line": 1,
      "last_line": 1,
      "first_column": 15,
      "last_column": 17
    },
    "matched": "x\"hello\\\"world\\\"\"",
    "_input": "y"
  },
  {
    "type": "Y",
    "lexeme": "y",
    "loc": {
      "first_line": 1,
      "last_line": 1,
      "first_column": 17,
      "last_column": 18
    },
    "matched": "x\"hello\\\"world\\\"\"y",
    "_input": ""
  }
]
```

This example demonstrates the following points:

1. Inside an action you can access the lexer object via `this`
2. Use the `input()` method to get the next incoming character from the input stream

   ```js
   { 
     input: function () {
       var ch = this._input[0];
       this.yytext += ch;
       this.yyleng++;
       this.offset++;
       this.match += ch;
       this.matched += ch; // Append to the matched text so far
       var lines = ch.match(/(?:\r\n?|\n).*/g);
       if (lines) { // Update line and column tracking if we matched newlines
           this.yylineno++;
           this.yylloc.last_line++;
       } else {
           this.yylloc.last_column++;
       }
       if (this.options.ranges) {
           this.yylloc.range[1]++;
       }

       this._input = this._input.slice(1); // Remove the matched character from the input stream
       return ch;
     }
   }
   ```
3. Use the `more()` method to indicate that the next matched text should be appended to the current `yytext` instead of replacing it.

   ```js
   {
     more: function () {
       this._more = true;
       return this;
     }
   }
   ```
   and in the `next`method we can see:
   ```js
   next:function () {
        if (this.done) { return this.EOF; }
        if (!this._input) { this.done = true; }

        var token, match, tempMatch, index;
        if (!this._more) { // only reset the position tracking if we're not continuing a previous match
            this.yytext = '';
            this.match = '';
        }
        ...
        }
    ```
4. The `matched` attribute contains the entire matched text so far, including any text matched in previous calls to `more()`. The `_input` attribute contains the remaining input that has not yet been processed by the lexer.