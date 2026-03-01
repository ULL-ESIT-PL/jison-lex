const {lexer, lex}  = require("./example");
const input = process.argv[2] || "2\n-/* a comment*/\n3";
lex.setInput(input);

const results = [];

results.push({ type: lex(), lexeme: lexer.yytext, loc: lexer.yylloc });
console.log(results);
