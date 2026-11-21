# Browser Example: Using jison-lex with IIFE Standalone Module

This example demonstrates how to use jison-lex in a browser environment using the [**IIFE standalone**](https://developer.mozilla.org/es/docs/Glossary/IIFE) module type (`-t js`).

## Setup

### 1. Generate the Lexer in IIFE Standalone Format

First, compile the lexer with the `-t js` option to create an IIFE standalone module:

```bash
jison-lex -t js examples/example.l -o examples/js-generated-module/example-browser.js
```

**Note:** The module-type flag `-t js` generates a self-executing function that creates a global variable based on the output filename. In this case, `example-browser.js` becomes `var exampleBrowser = (function(){...})()`. This allows you to use the lexer directly in a browser environment via `<script>` tags.

### 2. Project Structure

The example is organized with separation of concerns:

```
js-generated-module/
├── browser-example.html     # HTML structure
├── styles.css               # CSS styling
├── app.js                   # JavaScript application logic
├── example-browser.js       # Generated lexer (IIFE standalone)
└── README.md                # This file
```

### 3. Use in HTML

Include the generated lexer and application files in your HTML:

```html
<link rel="stylesheet" href="./styles.css">
<script src="./example-browser.js"></script> <!-- The variable `exampleBrowser` will be available globally and contain the lexer -->
<script src="./app.js"></script>
```

The `exampleBrowser` variable (the lexer) will be available globally, and the `app.js` script will initialize the event listeners.

### 4. Tokenize Input

In your JavaScript, access the global lexer and tokenize:

```javascript
// Set the input
exampleBrowser.setInput("2 - 3");

// Get tokens
let token;
while ((token = exampleBrowser.lex()) !== 'EOF') {
    console.log({
        type: token,
        lexeme: exampleBrowser.yytext,
        location: exampleBrowser.yylloc
    });
}
// Add EOF token
console.log({
    type: 'EOF',
    lexeme: exampleBrowser.yytext,
    location: exampleBrowser.yylloc
});
```

**Note:** The EOF token is the string `'EOF'` (as defined in the grammar), not a numeric constant.

## Running the Example

1. **In a browser:** Open `browser-example.html` directly in your web browser
2. **With a local server:** Serve the directory with any HTTP server:
   ```bash
   python -m http.server 8000
   # or with Node.js
   npx http-server
   ```
3. Then navigate to `http://localhost:8000/browser-example.html`

The interactive tokenizer will display:
- Input field with sample text
- Tokenize button
- Detailed token output with type, lexeme, and location

## Lexer Grammar

The example uses [example.l](../example.l) with the following rules:

```flex
comment [/][*](.|[\r\n])*?[*][/]
%%
\s+|{comment}         /* skip whitespace */
[0-9]+                return 'NUMBER';
[-+*/]                return 'OPERATOR';
<<EOF>>               return 'EOF';
.                     return 'INVALID';
```

Try tokenizing inputs like:
- `2 - 3`
- `10 + /* comment */ 20`
- `42`

## File Descriptions

- **`browser-example.html`** - Clean HTML structure with form and results container
- **`styles.css`** - Styling for a professional UI with form inputs and token display
- **`app.js`** - Application logic including:
  - `tokenize()` function to process input
  - Event listeners for button clicks and Enter key
  - Error handling and token display
- **`example-browser.js`** - Generated lexer (IIFE standalone module)
- **`example.l`** - Lexer grammar definition (in parent directory)

## Key Concepts

### IIFE Standalone Module

The `-t js` option generates code like:

```javascript
var exampleBrowser = (function(){
  var lexer = {
    // lexer implementation
    lex: function() { ... },
    setInput: function(input) { ... },
    // ... other methods
  };
  return lexer;
})();
```

The outer IIFE immediately executes and returns the lexer object, making `exampleBrowser` available globally. See [example-browser.js](./example-browser.js) for the full generated code.


