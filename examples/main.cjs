const { lexer, lex } = require("./example.js");
const input = process.argv[2] || "2\n-/* a comment*/\n3";
lexer.setInput(input);

const results = [];

results.push({ type: lex(), lexeme: lexer.yytext, loc: lexer.yylloc });

results.push({ type: lex(), lexeme: lexer.yytext, loc: lexer.yylloc });
results.push({ type: lex(), lexeme: lexer.yytext, loc: lexer.yylloc });
results.push({ type: lex(), lexeme: lexer.yytext, loc: lexer.yylloc });

console.log(results);
