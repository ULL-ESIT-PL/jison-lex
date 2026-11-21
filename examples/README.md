# jison-lex Examples

This directory contains examples demonstrating different ways to use jison-lex in various environments.

## Examples Overview

### 1. **Node.js / CommonJS** (`main.cjs`)
Simple Node.js example using the default CommonJS module format.

**Usage:**
```bash
# First compile the lexer
jison-lex -t commonjs examples/example.l -o examples/example.js

# Then run the example
node examples/main.cjs
```

**Output:**
```
[
  { type: 'NUMBER', lexeme: '2', loc: {...} },
  { type: 'OPERATOR', lexeme: '-', loc: {...} },
  { type: 'NUMBER', lexeme: '3', loc: {...} },
  { type: 'EOF', lexeme: '', loc: {...} }
]
```

---

### 2. **Browser with IIFE Standalone** (`js-generated-module/`)
Interactive browser example using IIFE standalone modules.

**Files:**
- `browser-example.html` - Main HTML page
- `app.js` - Application logic
- `styles.css` - Styling
- `example-browser.js` - Generated lexer

**Setup:**
```bash
# Generate the lexer
jison-lex -t js examples/example.l -o examples/js-generated-module/example-browser.js

# Open in browser or serve with HTTP
python -m http.server 8000
# Navigate to: http://localhost:8000/examples/js-generated-module/browser-example.html
```

**Documentation:** See [js-generated-module/README.md](./js-generated-module/README.md)

---

### 3. **Browser with AMD/RequireJS** (`amd-generated-module/`)
Modern browser example using AMD modules with RequireJS.

**Files:**
- `browser-example.html` - RequireJS configuration
- `app.js` - Application module (depends on lexer)
- `styles.css` - Styling
- `example-amd.js` - Generated lexer in AMD format

**Setup:**
```bash
# Generate the lexer
jison-lex -t amd examples/example.l -o examples/amd-generated-module/example-amd.js

# Start HTTP server (required for HTTP module loading)
python -m http.server 8000
# Navigate to: http://localhost:8000/examples/amd-generated-module/browser-example.html
```

**Documentation:** See [amd-generated-module/README.md](./amd-generated-module/README.md)

---

### 4. **ES6 Native Modules** (`ecma-generated-module/`)
Modern browser and Node.js example using native ES6 modules.

**Files:**
- `browser-example.html` - Native module loading with `<script type="module">`
- `app.mjs` - Application module using `import`/`export`
- `styles.css` - Styling
- `example-es6.mjs` - Generated lexer in ES6 module format
- `node-main.mjs` - Node.js example using the lexer

**Setup:**
```bash
# Generate the lexer
jison-lex -t es6 examples/example.l -o examples/ecma-generated-module/example-es6.mjs

# Start HTTP server (required for module security)
npx http-server -p 8000
# Navigate to: http://localhost:8000/examples/ecma-generated-module/browser-example.html
```

**Documentation:** See [ecma-generated-module/README.md](./ecma-generated-module/README.md)

---

## Module Types Comparison

| Feature | CommonJS | IIFE Standalone | AMD/RequireJS | ES6 Modules |
|---------|----------|-----------------|---------------|-------------|
| **Command** | `-t commonjs` | `-t js` | `-t amd` | `-t es6` |
| **Environment** | Node.js | Browser | Browser | Browser + Node.js |
| **Syntax** | `exports` | Global var | `define()` / `require()` | `import` / `export` |
| **Dependencies** | Synchronous | None (global) | Asynchronous | Async (browsers) |
| **Setup Complexity** | Minimal | Minimal | Moderate | Low-Moderate |
| **Use Case** | Server-side apps | Simple scripts | Legacy SPAs | Modern apps |
| **Tree-shaking** | ❌ No | ❌ No | ❌ No | ✅ Yes |
| **Standard** | Node.js custom | None (IIFE) | AMD spec | ES6/ESM |
| **Example File** | `main.cjs` | `js-generated-module/` | `amd-generated-module/` | `ecma-generated-module/` |

## Lexer Grammar

All examples use the same lexer grammar from `example.l`:

```flex
comment [/][*](.|[\r\n])*?[*][/]
%%
\s+|{comment}         /* skip whitespace and comments */
[0-9]+                return 'NUMBER';
[-+*/]                return 'OPERATOR';
<<EOF>>               return 'EOF';
.                     return 'INVALID';
```

## Running Examples

### CommonJS (Node.js)
```bash
node examples/main.cjs
```

### IIFE Standalone (Browser)
```bash
# Method 1: HTTP Server
python -m http.server 8000
# Open: http://localhost:8000/examples/js-generated-module/browser-example.html

# Method 2: Direct file (may have CORS issues)
# Double-click browser-example.html in file explorer
```

### AMD/RequireJS (Browser)
```bash
# MUST use HTTP server (dynamic module loading)
python -m http.server 8000
# Open: http://localhost:8000/examples/amd-generated-module/browser-example.html
```

### ES6 Modules (Browser or Node.js)
```bash
# Browser: MUST use HTTP server (security restrictions)
python -m http.server 8000
# Open: http://localhost:8000/examples/ecma-generated-module/browser-example.html

# Node.js (.mjs):
node examples/ecma-generated-module/app.mjs
```

## Quick Reference

### Generate Lexer for Different Environments

```bash
# Node.js / CommonJS
jison-lex -t commonjs examples/example.l -o examples/example.js

# Browser / IIFE Standalone
jison-lex -t js examples/example.l -o examples/example-browser.js

# Browser / AMD RequireJS
jison-lex -t amd examples/example.l -o examples/example-amd.js

# Browser + Node.js / ES6 Modules
jison-lex -t es6 examples/example.l -o examples/example-es6.mjs
```

### Basic API (Same for All Formats)

```javascript
// Set input
lexer.setInput("2 + 3");

// Get tokens in a loop
let token;
while ((token = lexer.lex()) !== 'EOF') {
  console.log(token);           // Token type
  console.log(lexer.yytext);    // Matched text
  console.log(lexer.yylloc);    // Location info
}

// Access to lexer info
lexer.yylineno;     // Current line number
lexer.yyleng;       // Length of matched text
lexer.matched;      // All matched text so far
```

## Learning Path

1. **Start with** `main.cjs` - Understand basic lexer API
2. **Then try** `js-generated-module/` - Learn browser usage with global vars
3. **Next explore** `amd-generated-module/` - Understand modular architecture with RequireJS
4. **Finally** `ecma-generated-module/` - Learn modern ES6 modules approach

## Troubleshooting

### Module not found in browser
- Ensure files are served over HTTP (not `file://`)
- Check browser DevTools console for specific errors
- Verify file paths are correct relative to HTML
- For ES6 modules, ensure `.mjs` extension or `type="module"` configuration

### CommonJS example doesn't run
- Ensure Node.js is installed: `node --version`
- Verify example.js is generated: `ls examples/example.js`
- Run from project root directory

### AMD/RequireJS not loading
- Start an HTTP server (required for dynamic module loading)
- Check RequireJS CDN is reachable
- Verify module paths in require.config match file paths

### ES6 Modules not loading
- Use HTTP server instead of `file://` protocol
- Check DevTools console for CORS errors
- Verify `.mjs` file extensions or `"type": "module"` in package.json
- For Node.js usage, ensure Node.js version 12.20+ is installed

## Module Format Guide

### CommonJS (Best for Node.js)
- Use when: Building server-side applications
- Syntax: `require()`, `module.exports`
- File extension: `.js` or `.cjs`
- Example: `examples/main.cjs`

### IIFE Standalone (Best for simple browser usage)
- Use when: Simple scripts, legacy browsers, no build tools
- Syntax: Global variables
- File extension: `.js`
- Example: `examples/js-generated-module/`
- Pros: No dependencies, straightforward
- Cons: Global namespace pollution

### AMD/RequireJS (Best for complex browser applications)
- Use when: Complex SPAs, need asynchronous loading
- Syntax: `define()`, `require()`
- File extension: `.js`
- Example: `examples/amd-generated-module/`
- Pros: Modular, asynchronous, good for large applications
- Cons: Requires RequireJS library, more complex setup

### ES6 Modules (Best for modern applications)
- Use when: Modern browsers, Node.js 12.20+, using bundlers
- Syntax: `import`, `export`
- File extension: `.mjs` or `.js` (with `"type": "module"`)
- Example: `examples/ecma-generated-module/`
- Pros: Official standard, tree-shaking, native browser support
- Cons: Requires HTTP for browser loading, needs modern environment

## Further Reading

- [jison-lex README](../README.md) - Main project documentation
- [MDN: Module Introduction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [RequireJS Documentation](https://requirejs.org/)
- [CommonJS Specification](http://wiki.commonjs.org/wiki/Modules/1.1.1)
