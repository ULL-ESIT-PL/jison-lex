# jison-lex Examples

This directory contains examples demonstrating different ways to use jison-lex in various environments.

## Examples Overview

### 1. **Node.js / CommonJS** (`main.cjs`)
Simple Node.js example using the default CommonJS module format.

**Features:**
- Uses CommonJS (`require()` syntax)
- Runs directly with `node`
- Best for server-side applications
- No build tools needed

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

**Features:**
- Module type: `-t js` (IIFE standalone)
- Global variable access in browser
- Minimal setup required
- Separated HTML, CSS, and JavaScript
- Interactive UI with real-time tokenization

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

**Key Concepts:**
- IIFE (Immediately Invoked Function Expression)
- Global variable creation
- Simple, no dependencies

**Documentation:** See [js-generated-module/README.md](./js-generated-module/README.md)

---

### 3. **Browser with AMD/RequireJS** (`amd-generated-module/`)
Modern browser example using AMD modules with RequireJS.

**Features:**
- Module type: `-t amd` (AMD/RequireJS)
- Asynchronous module loading
- Dependency injection
- Scalable for complex applications
- Works with RequireJS

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

**Key Concepts:**
- AMD (Asynchronous Module Definition)
- RequireJS module loader
- Declarative dependencies
- Dependency injection pattern

**Documentation:** See [amd-generated-module/README.md](./amd-generated-module/README.md)

---

## Module Types Comparison

| Feature | CommonJS | IIFE Standalone | AMD/RequireJS |
|---------|----------|-----------------|---------------|
| **Command** | `-t commonjs` | `-t js` | `-t amd` |
| **Environment** | Node.js | Browser | Browser |
| **Syntax** | `exports` | Global var | `define()` / `require()` |
| **Dependencies** | Synchronous | None (global) | Asynchronous |
| **Setup Complexity** | Minimal | Minimal | Moderate |
| **Use Case** | Server-side apps | Simple scripts | Complex SPAs |
| **Example File** | `main.cjs` | `js-generated-module/` | `amd-generated-module/` |

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

## Quick Reference

### Generate Lexer for Different Environments

```bash
# Node.js / CommonJS
jison-lex -t commonjs examples/example.l -o examples/example.js

# Browser / IIFE Standalone
jison-lex -t js examples/example.l -o examples/example-browser.js

# Browser / AMD RequireJS
jison-lex -t amd examples/example.l -o examples/example-amd.js
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
3. **Finally explore** `amd-generated-module/` - Understand modular architecture

## Troubleshooting

### Module not found in browser
- Ensure files are served over HTTP (not `file://`)
- Check browser DevTools console for specific errors
- Verify file paths are correct relative to HTML

### CommonJS example doesn't run
- Ensure Node.js is installed: `node --version`
- Verify example.js is generated: `ls examples/example.js`
- Run from project root directory

### AMD/RequireJS not loading
- Start an HTTP server (required for dynamic module loading)
- Check RequireJS CDN is reachable
- Verify module paths in require.config match file paths

## Further Reading

- [jison-lex README](../README.md) - Main project documentation
- [MDN: Module Introduction](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
- [RequireJS Documentation](https://requirejs.org/)
- [CommonJS Specification](http://wiki.commonjs.org/wiki/Modules/1.1.1)
