# jison-lex

A lexical analyzer generator used by [ull-esit-pl/jison](https://github.com/ull-esit-pl/jison). It takes a lexical grammar definition (either in JSON or Bison's lexical grammar format) and outputs a JavaScript lexer.

## Installation

The easiest way is to install the package from the GitHub repository:

```
npm install https://github.com/ull-esit-pl/jison-lex.git
```
The command above will install the latest version from the `master` branch of the repository and create a dependency like:

```json
{
  "dependencies": {
    "@ull-esit-pl/jison-lex": "github:ull-esit-pl/jison-lex"
  }
}
```

Alternatively, to install from the GitHub Package Registry, configure your `~/.npmrc` file with:

```ini
@ull-esit-pl:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=YOUR_GITHUB_TOKEN
```

Replace `YOUR_GITHUB_TOKEN` with your personal GitHub token that has `read:packages` permissions. Then you can install the package with npm:  

```console
npm install @ull-esit-pl/jison-lex
```

For more information see the section : https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-npm-registry#authenticating-with-a-personal-access-token of the GitHub documentation.

## Usage

```
Usage: jison-lex [file] [options]

file     file containing a lexical grammar

Options:
   -o FILE, --outfile FILE       Filename and base module name of the generated parser
   -t TYPE, --module-type TYPE   Module type to generate:
                                 "commonjs" - CommonJS (Node.js require/exports)
                                 "js" - IIFE standalone (global variable)
                                 "amd" - AMD/RequireJS modules
                                 "es6" (or "esm") - ES6 Modules (import/export)
   --version                     print version and exit
```

## The `lexer.lex()` function 

Given the following [examples/example.l](examples/example.l) file:

```flex
comment [/][*](.|[\r\n])*?[*][/]
%%
\s+|{comment}         /* skip whitespace */
[0-9]+                return 'NUMBER';
[-+*/]                return 'OPERATOR';
<<EOF>>               return 'EOF';
.                     return 'INVALID';
```
Which we can compile with the following command:

```console
npx jison-lex -t commonjs examples/example.l  -o examples/commonjs-generated-module/lexer.js
```

And the following [main.cjs](examples/commonjs-generated-module/main.cjs) file:


```js
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
```
The output of running `node examples/commonjs-generated-module/main.cjs` should be the following:

```js
  Token 1: NUMBER     | Lexeme: "2" | Location: 1:0
  Token 2: OPERATOR   | Lexeme: "-" | Location: 2:0
  Token 3: NUMBER     | Lexeme: "3" | Location: 3:0
```

## The `lexer.next()` function

Given the following [examples/commonjs-generated-module/main-next.cjs](examples/commonjs-generated-module/main-next.cjs) file:

```js
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
```
When running `node examples/commonjs-generated-module/main-next.cjs`, the output should be:

```
  Token 1: NUMBER   | Lexeme: "2              " | Location: 1:0
  Token 2: WHITE    | Lexeme: "\\n            " | Location: 1:1
  Token 3: OPERATOR | Lexeme: "-              " | Location: 2:0
  Token 4: WHITE    | Lexeme: "/* a comment*/ " | Location: 2:1
  Token 5: WHITE    | Lexeme: "\\n            " | Location: 2:15
  Token 6: NUMBER   | Lexeme: "3              " | Location: 3:0
  Token 7: EOF      | Lexeme: "               " | Location: 3:1
```
## The way it works

The way it works is that the lexer maintains an internal state, including the current input, the position in the input, and the matched text so far. 

Here is an example using the node.js REPL. First we require the `@ull-esit-pl/jison-lex` package and create a lexer from a simple grammar:

```js
➜  test-jison-lex node
> JisonLex = require('@ull-esit-pl/jison-lex');
[Function: RegExpLexer] { generate: [Function: generate] }
> grammar = { rules: [ ["x", "return 'X';" ], ["y", "return 'Y';"], ["$", "return 'EOF'"] ] } 
> // or load from a file
> // var grammar = fs.readFileSync('mylexer.l', 'utf8');
{
  rules: [
    [ 'x', "return 'X';" ],
    [ 'y', "return 'Y';" ],
    [ '$', "return 'EOF'" ]
  ]
}
```

We can create a lexer object from the grammar using the constructor `new JisonLex(grammar)`:

```js
> lexer = new JisonLex(grammar);
{
  EOF: 1,
  parseError: [Function: parseError],
  setInput: [Function: setInput],
  input: [Function: input],
  unput: [Function: unput],
  more: [Function: more],
  reject: [Function: reject],
  less: [Function: less],
  pastInput: [Function: pastInput],
  upcomingInput: [Function: upcomingInput],
  showPosition: [Function: showPosition],
  test_match: [Function: test_match],
  next: [Function: next],
  lex: [Function: lex],
  begin: [Function: begin],
  popState: [Function: popState],
  _currentRules: [Function: _currentRules],
  topState: [Function: topState],
  pushState: [Function: pushState],
  stateStackSize: [Function: stateStackSize],
  options: {},
  performAction: [Function: anonymous],
  rules: [ /^(?:x)/, /^(?:y)/, /^(?:$)/ ],
  conditions: { INITIAL: { rules: [Array], inclusive: true } },
  yy: {},
  generate: [Function (anonymous)],
  generateModule: [Function (anonymous)],
  generateCommonJSModule: [Function (anonymous)],
  generateAMDModule: [Function (anonymous)],
  generateESModule: [Function (anonymous)]
}
```

We already seen how to use the `lexer.setInput`, `lexer.lex()` and `lexer.next()` methods:

```js
> lexer.setInput('xyxxy');
```
The way the lexer works is by modifying its internal state. For example, the previous call to `lexer.setInput('xyxxy')` modifies or introduces new properties in the `lexer` object such as `_input`, `done`, `yylineno`, `yytext`, `yylloc`, etc.:

```js
> lexer
{ 
  ... /* other properties as before */
  _input: 'xyxxy', // internal input string
  done: false,     // indicates if the lexer has reached the end of the input
  yylineno: 0,     // current line number (0-based)
  _backtrack: false,
  _more: false, // indicates if the lexer is in "more" mode
  yyleng: 0,
  yylineno: 0,
  match: '', // the last matched string
  matched: '', // the entire matched string so far
  yytext: '',  // the current matched text
  conditionStack: [ 'INITIAL' ],
  yylloc: { first_line: 1, first_column: 0, last_line: 1, last_column: 0 },
  offset: 0 // the current offset in the input string
}
```
When we call `lexer.lex()` it will return the next token and update the internal state of the lexer accordingly:
```js
> lexer.lex();
'X'
```
Now the internal state of the lexer has changed:

```js 
> lexer
{
   ... /* other properties as before */
  _input: 'yxxy',
  done: false,
  _backtrack: false,
  _more: false,
  yyleng: 1,
  yylineno: 0,
  match: 'x',
  matched: 'x',
  yytext: 'x',
  conditionStack: [ 'INITIAL' ],
  yylloc: { first_line: 1, last_line: 1, first_column: 0, last_column: 1 },
  offset: 0,
  matches: [ 'x', index: 0, input: 'xyxxy', groups: undefined ]
}
```
We can call `lexer.lex()` again to get the next token:
```js
> lexer.lex();
'Y'
```
And the internal state of the lexer has changed again:

```js
{
  ... /* other properties as before */
  _input: 'xxy', // remaining input after matching  'x' and 'y'
  done: false,
  _backtrack: false,
  _more: false,
  yyleng: 1,
  yylineno: 0,
  match: 'y',
  matched: 'xy', // the entire matched string so far
  yytext: 'y',
  conditionStack: [ 'INITIAL' ],
  yylloc: { first_line: 1, last_line: 1, first_column: 1, last_column: 2 }, // Now the last_column is 2 because we have matched two characters so far
  offset: 0,
  matches: [ 'y', index: 0, input: 'yxxy', groups: undefined ]
}
```
Let us consume the rest of the input:

```js

> while (lexer.lex() !== 'EOF') ;
undefined
> lexer
{
  /* ... other properties as before */
  done: true, // indicates that the lexer has reached the end of the input
  yytext: '',
  match: '',
  _input: '',
  _backtrack: false,
  _more: false,
  yyleng: 0,
  yylineno: 0,
  matched: 'xyxxy',
  conditionStack: [ 'INITIAL' ],
  yylloc: { first_line: 1, last_line: 1, first_column: 5, last_column: 5 },
  offset: 0,
  matches: [ '', index: 0, input: '', groups: undefined ]
}
```

## The `lexer.generate*Module()` methods

The `lexer.generate*Module()` methods can be used to generate a string containing the source code of a module in the corresponding format that exports the lexer and the `lex` function. 

The `JisonLex.generate(grammar)` method returns a string containing the source code of a lexer. Continuing with the previous REPL loop:

```js
> lexerSource = JisonLex.generate(grammar);
'/* generated by jison-lex 0.3.13 */\n' +
  'var lexer = (function(){\n' +
  'var lexer = ({\n' +
  '        if (this.conditionStack.length && this.conditionStack[this.co'... 1199 more characters
```
The `lexer.generateCommonJSModule()` method creates a string containing the source code of a CommonJS module that exports the `lexer` object and the `lex` function:

```js
> target = lexer.generateCommonJSModule() 
> target.length                           
11295
> target.substr(11100) // The last 195 characters of the generated module, which contains the export statements
'?:y)/,/^(?:$)/],\n' +
  'conditions: {"INITIAL":{"rules":[0,1,2],"inclusive":true}}\n' +
  '});\n' +
  'return lexer;\n' +
  '})();\n' +
  'exports.lexer = lexer;\n' +
  'exports.lex = function () { return lexer.lex.apply(lexer, arguments); };'
>
```

You can also generate ES6 modules using the `lexer.generateESModule()` method:

```js
> target = lexer.generateESModule()
> target.substr(-100)  // Shows the ES6 export statements
'})();\n' +
  '\n' +
  'export { lexer };\n' +
  'export const lex = lexer.lex.bind(lexer);'
```



### Module Types Comparison

| Feature | CommonJS | IIFE Standalone | AMD/RequireJS | ES6 Modules |
|---------|----------|-----------------|---------------|-------------|
| **Command** | `-t commonjs` | `-t js` | `-t amd` | `-t es6` / `-t esm` |
| **Environment** | Node.js | Browser | Browser + RequireJS | Browser + Node.js |
| **Export Syntax** | `exports.lexer` | Global variable | AMD `define()` | ES6 `export { }` |
| **Import Syntax** | `require()` | `<script>` tag | `require()` | `import` |
| **Tree-shaking** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Standard** | Node.js custom | IIFE pattern | AMD spec | ES6/ESM official |
| **Use Case** | Server-side apps | Simple scripts | Legacy SPAs | Modern apps |

**Tree-shaking** is a technique of optimization that consists of removing dead code from your final JavaScript bundle.

### Module Type Examples

**CommonJS (Node.js):**
```js
const { lexer, lex } = require('./lexer.js');
lexer.setInput('input');
```

- See **[CommonJS Example](examples/commonjs-generated-module/)** - Node.js usage

**IIFE Standalone (Browser):**
```html
<script src="lexer.js"></script>
<script>
  lexer.setInput('input');  // lexer is global
</script>
```

- See **[IIFE Standalone Example](examples/js-generated-module/)** - Browser with global variable

**AMD/RequireJS (Browser):**
```js
require(['lexer'], function(lexer) {
  lexer.setInput('input');
});
```

- See **[AMD/RequireJS Example](examples/amd-generated-module/)** - Browser with RequireJS
  
**ES6 Modules (Browser + Node.js):**
```js
import { lexer } from './lexer.mjs';
lexer.setInput('input');
```

- See **[ES6 Modules Example](examples/ecma-generated-module/)** - Modern browser and Node.js

For detailed documentation and setup instructions for each module type, see [examples/README.md](examples/README.md).

## Manually writing a lexer for Jison

See folder [examples/manual-lexer](examples/manual-lexer) for an example of a hand written lexer compatible with a [@ull-esit-pl/jison parser](https://github.com/ull-esit-pl/jison).

## ES6 Modules Support

This version of jison-lex supports generating lexers as ES6 Modules, the official JavaScript module standard.

### Generate ES6 Module Lexer

```bash
jison-lex -t es6 input.l -o output.mjs
# or use the esm alias:
jison-lex -t esm input.l -o output.mjs
```

### Use in Node.js

```js
import { lexer, lex } from './lexer.mjs';

lexer.setInput('input text');
const token = lexer.lex();
```

### Use in Browser

```html
<script type="module">
  import { lexer } from './lexer.mjs';
  window.lexer = lexer;
</script>
```

For a complete example with HTML, CSS, and application code, see [examples/ecma-generated-module/](examples/ecma-generated-module/).

## Introduction to some advanced lexer methods and attributes

See folder [examples/more/](examples/more/) for an example demonstrating the use of some of the lexer methods and attributes, such as the use of `this`, the methods `input()`, and `more()`, the attributes `matched` and `_input`.

## Developers

See [DEVELOPMENT.md](DEVELOPMENT.md) for instructions on how to publish the package and test it during development.

## Author

[Zach Carter](https://github.com/zaach) <hi@znc.dev>

### Contributors 

- Casiano Rodríguez León (2026). 

## Changelog

- This version fixes a bug with the `--t --module-type` option and uses `commander` instead of `nomnom` for the command line interface. 
- It also changes the way the function `lex` is exported.

## Development

### Running Tests

```bash
npm test
```

### Generating API Documentation

JSDoc documentation is available for the main API functions. To generate HTML documentation:

```bash
npm run docs
```

Documentation will be generated in the `./docs` directory.

To serve the documentation locally:

```bash
npm run docs:serve
```

Then open `http://localhost:8080/docs` in your browser.

## license
MIT
