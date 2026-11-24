// Compile first `npx jison-lex -t commonjs examples/example.l  -o examples/commonjs-generated-module/lexer.js` and 
// then run `node examples/commonjs-generated-module/main-next.cjs 
const { lexer } = require("./lexer.js");
const next = lexer.next.bind(lexer);
const input = process.argv[2] || "2\n-/* a comment*/\n3";
lexer.setInput(input);
let token;
let tokens = [];

while (!lexer.done) {
    token = next(); // next returns even for comments and white spaces but in such case returns false
    
    if (!token) {
        tokens.push({
            token: "WHITE",  
            lexeme: /* escape new lines and carriage returns for better console output */ lexer.yytext.replace(/\n/g, "\\\\n").replace(/\r/g, "\\r"),
            loc: lexer.yylloc,
            line: lexer.yylineno
        });
    }
    else { // New token available
        tokens.push({
            token,
            lexeme: lexer.yytext.replace(/\n/g, "\\\\n").replace(/\r/g, "\\r"), // Replace newlines and carriage returns for better console output
            loc: lexer.yylloc, // { first_line, last_line, first_column, last_column }
            line: lexer.yylineno + 1
        });
    }
}
tokens.forEach((t, index) => {
    console.log(`  Token ${index + 1}: ${t.token.padEnd(8)} | Lexeme: "${t.lexeme.padEnd(15)}" | Location: ${t.loc.first_line}:${t.loc.first_column}`);
});