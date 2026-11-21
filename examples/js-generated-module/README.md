# Browser Example: Using jison-lex with IIFE Standalone Module

This example demonstrates how to use jison-lex in a browser environment using the **IIFE standalone** module type (`-t js`).

## Setup

### 1. Generate the Lexer in IIFE Standalone Format

First, compile the lexer with the `-t js` option to create an IIFE standalone module:

```bash
jison-lex -t js examples/example.l -o examples/js-generated-module/example-browser.js
```

**Note:** The module-type flag `-t js` generates a self-executing function that creates a global `exampleBrowser` variable based in the name of the output file, which contains the lexer. This allows you to use the lexer directly in a browser environment, making it suitable for direct inclusion in HTML via `<script>` tags.

### 2. Use in HTML

Include the generated lexer file in your HTML:

```html
<script src="./example-browser.js"></script>
```

The `lexer` variable will be available globally in your page.

### 3. Tokenize Input

The lexer works the same way, but accessed through the global `lexer` variable:

```javascript
// Set the input
lexer.setInput("2 - 3");

// Get tokens
while ((token = lexer.lex()) !== 1) { // 1 is EOF
    console.log({
        type: token,
        lexeme: lexer.yytext,
        location: lexer.yylloc
    });
}
```

## Running the Example

Open `browser-example.html` in your web browser to see the interactive tokenizer in action.

## Module Types Comparison

| Feature | CommonJS | IIFE Standalone (js) | AMD |
|---------|----------|----------------------|-----|
| **Command** | `-t commonjs` | `-t js` | `-t amd` |
| **Environment** | Node.js | Browser | RequireJS |
| **Export** | `exports.lexer` | Global var | AMD module |
| **Usage** | `const { lexer } = require()` | `<script>` tag | `require(['lexer'])` |

## Example Files

- `example.l` - Lexer grammar definition
- `example-browser.js` - Generated lexer (IIFE standalone)
- `browser-example.html` - Interactive HTML demo
