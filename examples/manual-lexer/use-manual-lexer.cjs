// npx jison grammar.jison -o parser.js
const lexer = require('./manual-lexer.js');
const parser = require('./parser.js')
parser.parser.lexer = lexer;
const result = parser.parse('2+3');
console.log(result);