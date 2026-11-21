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
├── browser-example.html      # HTML with native module loading
├── styles.css               # CSS styling
├── app.mjs                  # Application module (imports lexer)
├── example-es6.mjs          # Generated lexer (ES6 module)
└── README.md               # This file
```

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

Key differences from other module systems:
- **No external loaders required** (unlike AMD/RequireJS)
- **Native browser support** (modern browsers)
- **Synchronous resolution** but asynchronous loading
- **Automatic dependency management**

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

**Note:** The EOF token is the string `'EOF'` (as defined in the grammar).

## Running the Example

### Option 1: Using HTTP Server (Recommended)

Since modern browsers enforce security restrictions for local file access:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using Ruby
ruby -run -ehttpd . -p8000
```

Then navigate to: `http://localhost:8000/examples/ecma-generated-module/browser-example.html`

### Option 2: Using a Development Server

If you have a development server set up (Vite, webpack-dev-server, etc.):

```bash
# Example with Vite
npm run dev
# Then open the example URL
```

### Why HTTPS/HTTP is Required

- Browsers block `file://` protocol for security (CORS)
- ES6 modules require proper HTTP headers
- Dynamic import resolution needs HTTP

## Node.js Usage with the Generated Lexer

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

## File Descriptions

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

## Key Concepts

### ES6 Modules (ESM)

ES6 modules are the **official JavaScript module standard**:

1. **Static Imports:** Dependencies are declared at the top
   ```javascript
   import { lexer } from './lexer.mjs';
   ```

2. **Explicit Exports:** Modules export specific items
   ```javascript
   export { lexer };
   export const lex = ...;
   ```

3. **Automatic Dependency Resolution:** No build tools needed (browsers handle it)

4. **Tree-shaking:** Bundlers can eliminate unused code

### Native Browser Support

Modern browsers support ES6 modules natively:

```html
<!-- This works directly in browsers! -->
<script type="module">
  import { lexer } from './lexer.mjs';
  lexer.lex();
</script>
```

**Browser support:**
- Chrome 61+
- Firefox 67+
- Safari 10.1+
- Edge 79+

### CommonJS vs ES6 Modules

**CommonJS (Node.js):**
```javascript
const { lexer } = require('./lexer.js');
module.exports = { lexer };
```

**ES6 Modules:**
```javascript
import { lexer } from './lexer.mjs';
export { lexer };
```

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

### Dynamic Imports

```javascript
// Import on-demand instead of at top-level
async function loadLexer() {
  const { lexer } = await import('./lexer.mjs');
  lexer.setInput("2 + 3");
}
```

### Bundling

ES6 modules work great with modern bundlers:

```bash
# With Vite
vite build

# With Webpack
webpack bundle

# With Rollup
rollup -i app.mjs -o bundle.js -f iife
```

## When to Use ES6 Modules

**Use ES6 when:**
- ✅ Building modern web applications
- ✅ Using modern bundlers (Vite, Webpack, Rollup)
- ✅ Targeting modern browsers (Chrome 61+, Firefox 67+, Safari 10.1+)
- ✅ Want tree-shaking and dead code elimination
- ✅ Using Node.js 12.20+ with `.mjs` or `"type": "module"`
- ✅ Want the official JavaScript standard

**Use alternatives for:**
- Legacy browser support → CommonJS or IIFE
- RequireJS projects → AMD
- Server-side only (older Node.js) → CommonJS

## Troubleshooting

### "Cannot use import statement outside a module"

The file needs to be treated as a module. Solution:
- Use `.mjs` extension, OR
- Add `"type": "module"` to package.json (Node.js)

### Module not found in browser

- Ensure files are served over HTTP/HTTPS (not `file://`)
- Check DevTools console for exact error
- Verify relative paths are correct (e.g., `./example-es6.mjs`)

### CORS errors with modules

- Use an HTTP server instead of `file://` protocol
- Check server headers allow module loading

### Import/Export Syntax Errors

- Ensure target browser/Node.js version supports ES6 modules
- Use a transpiler (Babel) for older environments
- Check file extensions (`.mjs` for Node.js modules)

## Migration Path

If you're already using another format:

**From CommonJS:**
```javascript
// Before
const { lexer } = require('./lexer.js');

// After
import { lexer } from './lexer.mjs';
```

**From IIFE:**
```javascript
// Before (global variable)
// lexer is globally available

// After
import { lexer } from './lexer.mjs';
```

**From AMD:**
```javascript
// Before
define(['./lexer'], function(lexer) { ... });

// After
import { lexer } from './lexer.mjs';
```

## Resources

- [MDN: ES6 Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [Node.js: ES Modules](https://nodejs.org/en/docs/guides/ecmascript-modules/)
- [Can I Use: ES6 Modules](https://caniuse.com/es6-module)
- [Vite Documentation](https://vitejs.dev/)