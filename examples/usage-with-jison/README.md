## Use with @ull-esit-pl/jison

Given the grammar [`examples/grammar.jison`](examples/grammar.jison) and the lexer generated from [`examples/example.l`](examples/example.l), we can use the lexer in the parser by assigning it to `parser.lexer` in the tail section of the grammar file:

```
➜  test-jison-lex cat grammar.jison 
```
```yacc
%locations
%token NUMBER OPERATOR EOF

%left OPERATOR
%%

s: expr EOF { return $1; }
;

expr
  : expr OPERATOR expr
      {
        $$ = {
          type: "OPERATOR",
          lexeme: $2,
          left: $1,
          right: $3,
          loc: @2
        };
      }
  | NUMBER
      {
        $$ = {
          type: "number",
          value: Number($1),
          loc: @1
        };
      }
  ;

%%

const { lexer, lex } = require("./example.js");
parser.lexer = lexer;
```

**The `parser` variable is available in the tail section of the grammar file**, and we can assign the lexer to it. The generated parser will then use the provided lexer to tokenize the input.

First, install the `@ull-esit-pl/jison` package:

```
npm install --save-dev https://github.com/ull-esit-pl/jison.git
```
or
```
npm install --save-dev @ull-esit-pl/jison
```
We compile it with the following command:

```
npx jison grammar.jison -o parser.js
```

And then we can use the generated parser in the node.js REPL:

```js
➜  test-jison-lex node                                
> p = require("./parser")
{
  parser: { yy: {} },
  Parser: [Function: Parser],
  parse: [Function (anonymous)],
  main: [Function: commonjsMain]
}
> p.parse("3+4")
{
  type: 'OPERATOR',
  lexeme: '+',
  left: {
    type: 'number',
    value: 3,
    loc: { first_line: 1, last_line: 1, first_column: 0, last_column: 1 }
  },
  right: {
    type: 'number',
    value: 4,
    loc: { first_line: 1, last_line: 1, first_column: 2, last_column: 3 }
  },
  loc: { first_line: 1, last_line: 1, first_column: 1, last_column: 2 }
}
> 
```