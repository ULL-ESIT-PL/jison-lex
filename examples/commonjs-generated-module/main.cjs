// Compile first `npx jison-lex -t commonjs examples/example.l  -o examples/commonjs-generated-module/lexer.js` and 
// then run `node examples/commonjs-generated-module/main.js 
const { lexer, lex } = require("./lexer.js");
const input = process.argv[2] || "2\n-/* a comment*/\n3";
lexer.setInput(input);
let token;
let tokens = [];

while ((token = lex()) !== 'EOF') {
    tokens.push({
        token,
        lexeme: lexer.yytext,
        loc: lexer.yylloc, // { first_line, last_line, first_column, last_column }
        line: lexer.yylineno + 1
    });
}
tokens.forEach((t, index) => {
    console.log(`  Token ${index + 1}: ${t.token.padEnd(10)} | Lexeme: "${t.lexeme}" | Location: ${t.loc.first_line}:${t.loc.first_column}`);
});