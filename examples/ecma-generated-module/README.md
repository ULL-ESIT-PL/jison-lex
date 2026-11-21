# ES6 Modules Example: Using jison-lex with Native JavaScript Modules

This example demonstrates how to use jison-lex with **ES6 Modules** (ECMAScript modules), the modern standard for JavaScript module system in browsers and Node.js.

## Setup

### 1. Generate the Lexer in ES6 Module Format

Compile the lexer with the `-t es6` (or `-t esm`) option to create an ES6 module:

```bash
jison-lex -t es6 examples/example.l -o examples/ecma-generated-module/example-es6.mjs
```

**Note:** The module-type flag `-t es6` generates a module compatible with native JavaScript ES6 module syntax. Files use the `.mjs` extension to indicate ES6 modules.

### 2. Project Structure

The example is organized using ES6 module imports/exports:

```
ecma-generated-module/
├── browser-example.html     # HTML with native module loading
├── styles.css               # CSS styling
├── app.mjs                  # Application module (imports lexer)
├── example-es6.mjs          # Generated lexer (ES6 module)
├── node-main.mjs            # Node.js example using the lexer
└── README.md                # This file
```

### File Descriptions

- **`browser-example.html`** - Entry point using native module loading
  - Uses `<script type="module">` for ES6 module support
  - Imports `app.mjs` and exposes `tokenize()` globally
  
- **`styles.css`** - Styling for the UI (shared from IIFE example)

- **`app.mjs`** - Application module
  - Imports lexer from `example-es6.mjs`
  - Exports `tokenize()` function
  - Handles UI events
  - Uses `.mjs` extension for clarity

- **`example-es6.mjs`** - Generated lexer in ES6 module format
  - Exports `lexer` object
  - Exports `lex` convenience function
  - Uses `.mjs` extension (ES6 Module JavaScript)

### 3. How ES6 Modules Work

ES6 modules use `import` and `export` statements:

**Lexer module (example-es6.mjs):**
```javascript
var lexer = { /* lexer implementation */ };

export { lexer };
export const lex = lexer.lex.bind(lexer);
```

**Application module (app.mjs):**
```javascript
import { lexer } from './example-es6.mjs';

export function tokenize() {
  lexer.setInput("2 - 3");
  // ...
}
```

**HTML loading module:**
```html
<script type="module">
  import { tokenize } from './app.mjs';
  window.tokenize = tokenize;  // Export to global for onclick handler
</script>
```

### 4. Use in HTML

Modern browsers support native module loading:

```html
<script type="module">
  import { tokenize } from './app.mjs';
  
  // Use the imported function
  window.tokenize = tokenize;
</script>
```

### 5. Tokenize Input

The lexer works the same way, imported directly at the top:

```javascript
import { lexer } from './example-es6.mjs';

export function tokenize() {
  lexer.setInput("2 - 3");
  
  let token;
  while ((token = lexer.lex()) !== 'EOF') {
    console.log({
      type: token,
      lexeme: lexer.yytext,
      location: lexer.yylloc
    });
  }
}
```

## Running the Example

Since modern browsers enforce security restrictions for local file access:

```bash
# Using Node.js
npx http-server -p 8000

# Using Python
python -m http.server 8000

# Using Ruby
ruby -run -ehttpd . -p8000
```

Then navigate to: `http://localhost:8000/examples/ecma-generated-module/browser-example.html`


## Lexer Grammar

The example uses the same grammar as other examples:

```flex
comment [/][*](.|[\r\n])*?[*][/]
%%
\s+|{comment}         /* skip whitespace and comments */
[0-9]+                return 'NUMBER';
[-+*/]                return 'OPERATOR';
<<EOF>>               return 'EOF';
.                     return 'INVALID';
```

Try tokenizing inputs like:
- `2 - 3`
- `10 + /* comment */ 20`
- `42 * 5 / 2`

## Module System Comparison

| Feature | CommonJS | IIFE | AMD | ES6 Modules |
|---------|----------|------|-----|-------------|
| **Command** | `-t commonjs` | `-t js` | `-t amd` | `-t es6` |
| **Environment** | Node.js | Browser | Browser | Browser + Node.js |
| **Syntax** | `require()`, `exports` | Global var | `define()`, `require()` | `import`, `export` |
| **Extension** | `.js` | `.js` | `.js` | `.mjs` or `.js` |
| **Loading** | Synchronous | Synchronous | Asynchronous | Async (browsers) |
| **Standard** | Node.js custom | None (IIFE) | AMD spec | ES6/ESM standard |
| **Tree-shaking** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Native Support** | Node.js | ✅ Browser | No (needs RequireJS) | ✅ Modern browsers |
| **Complexity** | Low | Very low | Moderate | Low-Moderate |

## Node.js Usage

ES6 modules can also be used in Node.js:

### Method 1: Use `.mjs` extension
```javascript
// lexer.mjs
export { lexer };

// app.mjs
import { lexer } from './lexer.mjs';
lexer.setInput("2 + 3");
```

Run with:
```bash
node app.mjs
```

### Method 2: Use `"type": "module"` in package.json

```json
{
  "type": "module",
  "name": "my-app"
}
```

Then use `.js` files with ES6 syntax:
```javascript
// lexer.js (with "type": "module")
export { lexer };
```



### Example of Node.js usage with the Generated Lexer

The generated ES6 module works directly in Node.js (12.20+). Try the included example:

```bash
node node-main.mjs
```

**Output:**
```
==================================================
ES6 Lexer Module Example - Node.js
==================================================

Input: "42 + 3 * 7 - 5"

Method 1: Using lexer.lex() bound function
--------------------------------------------------
  Token 1: NUMBER     | Value: "42"
  Token 2: OPERATOR   | Value: "+"
  Token 3: NUMBER     | Value: "3"
  Token 4: OPERATOR   | Value: "*"
  Token 5: NUMBER     | Value: "7"
  Token 6: OPERATOR   | Value: "-"
  Token 7: NUMBER     | Value: "5"

Method 2: Using lexer.next()
--------------------------------------------------
  Token 1: NUMBER     | Text: "42"
  Token 2: OPERATOR   | Text: "+"
  ... (more tokens)

==================================================
Total tokens recognized: 7
==================================================
```

**Code example from `node-main.mjs`:**

```javascript
import { lexer, lex } from './example-es6.mjs';

const input = '42 + 3 * 7 - 5';

// Method 1: Using the convenient lex() function
lexer.setInput(input);
let token;

while ((token = lex()) !== 'EOF') {
  console.log({
    token,
    value: lexer.yytext,
    line: lexer.yylineno + 1
  });
}

// Method 2: Using lexer.next() for more control
lexer.setInput(input);
while (!lexer.done) {
  const result = lexer.next();
  if (result && result !== 'EOF') {
    console.log(`${result}: "${lexer.yytext}"`);
  }
}
```

**Key points:**
- Use `.mjs` extension or add `"type": "module"` to package.json
- Import both `lexer` and the convenient `lex` function
- Access token metadata via `lexer.yytext`, `lexer.yylineno`, etc.
- Two approaches: `lex()` for simplicity or `lexer.next()` for control

## Advanced Usage

### Named and Default Exports

```javascript
// In generated lexer:
export { lexer };              // Named export
export default lexer;          // Default export (optional)
export const lex = ...;        // Additional named export
```

### Using in Application

```javascript
// Import named exports
import { lexer, lex } from './lexer.mjs';

// Or default export
import LexerModule from './lexer.mjs';

// Use them
lexer.setInput("text");
const token = lex();
```

## Resources

- [MDN: ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Node.js: ES Modules](https://nodejs.org/en/docs/guides/ecmascript-modules/)
- [Can I Use: ES6 Modules](https://caniuse.com/es6-module)
- [Vite Documentation](https://vitejs.dev/)