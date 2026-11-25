// Compile first `npx jison-lex examples/exammle.l -t commonjs -o examples/example.js` and 
// then run `node examples/main.js 
const { lexer, lex } = require("./lexer.js");
const input = process.argv[2] || 'x"ad"x';
lexer.setInput(input);

const results = [];

while ((token = lex()) !== 'EOF') {
    results.push({ type: token, lexeme: lexer.yytext, loc: lexer.yylloc });
}

console.log(results);
