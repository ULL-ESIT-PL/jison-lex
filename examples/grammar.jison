%token NUMBER OPERATOR EOF

%%

s: expr EOF { return $1; }
;

expr
  : expr NUMBER OPERATOR
      {
        $$ = {
          type: "operator",
          lexeme: $3,
          left: $1,
          right: {
            type: "number",
            value: Number($2),
            loc: @2
          },
          loc: @3
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

//const { lexer, lex } = require("./example.js");
//parser.lexer = lexer;