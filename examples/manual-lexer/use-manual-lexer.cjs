// npx jison examples/grammar.jison -o examples/parser.js
const lexer = require('./manual-lexer.js');
const parser = require('../parser.js')
parser.parser.lexer = lexer;
let input = process.argv[2] || '2 3 +';
try {
  lexer.setInput(input);
  const result = parser.parse(input);
  console.log(JSON.stringify(result, null, 2));
} catch (error) {
  console.error('Parsing error:', error.message);
  process.exit(1);
}
