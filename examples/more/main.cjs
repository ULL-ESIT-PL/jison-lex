// Compile first `npx jison-lex examples/more/more.l -t commonjs -o examples/more/lexer.js` and 
// then run `node examples/more/main.cjs` 
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
