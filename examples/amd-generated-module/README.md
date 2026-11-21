# AMD Example: Using jison-lex with RequireJS

This example demonstrates how to use jison-lex in a browser environment with **AMD** (Asynchronous Module Definition) module format using **RequireJS**.

## Setup

### 1. Generate the Lexer in AMD Format

First, compile the lexer with the `-t amd` option to create an AMD module:

```bash
jison-lex -t amd examples/example.l -o examples/amd-generated-module/example-amd.js
```

**Note:** The module-type flag `-t amd` generates a module compatible with RequireJS and other AMD loaders. This is useful for large-scale applications that already use AMD/RequireJS for module management.

### 2. Project Structure

The example is organized to demonstrate AMD module loading:

```
amd-generated-module/
    ├── browser-example.html      # HTML with RequireJS configuration
    ├── styles.css                # CSS styling
    ├── app.js                    # Application module (depends on lexer)
    ├── example-amd.js            # Generated lexer (AMD module)
    └── README.md                # This file
```

### 3. How AMD Works

AMD modules use `define()` to declare dependencies:

**Lexer module (example-amd.js):**
```javascript
define([], function(){
  var lexer = {
    // lexer implementation
  };
  return lexer;
});
```

**Application module (app.js):**
```javascript
define(['./example-amd'], function(lexer) {
  // lexer is injected as a dependency
  function tokenize() {
    lexer.setInput("2 - 3");
    // ...
  }
});
```

### 4. Use in HTML

The HTML loads RequireJS and configures the module paths:

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/require.js/2.3.6/require.min.js"></script>

<script>
  require.config({
    paths: {
      app: './app'
    }
  });
  
  require(['./app']);
</script>
```

RequireJS automatically:
1. Loads and parses module dependencies
2. Manages the dependency graph
3. Injects dependencies in the correct order
4. Executes modules

### 5. Tokenize Input

The lexer works the same way, but injected as a dependency:

```javascript
define(['./example-amd'], function(lexer) {
  function tokenize() {
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
});
```

## Running the Example

Since modern browsers block local file loading for security reasons, you need an HTTP server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server -p 8000

# Using Ruby
ruby -run -ehttpd . -p8000
```

Then navigate to: `http://localhost:8000/examples/amd-generated-module/browser-example.html`

### Why HTTP is Required

- RequireJS loads modules dynamically via HTTP requests
- Browsers block file:// protocol for security (CORS restrictions)
- AMD is designed for web applications served over HTTP

## Lexer Grammar

The example uses the same grammar as the IIFE standalone version:

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
- `42 * 5`

## AMD vs Other Module Formats

| Feature | CommonJS | IIFE Standalone | AMD |
|---------|----------|-----------------|-----|
| **Command** | `-t commonjs` | `-t js` | `-t amd` |
| **Environment** | Node.js | Browser (global) | Browser (RequireJS) |
| **Wrapper** | `exports.lexer` | IIFE + global var | `define()` |
| **Dependencies** | Manual `require()` | None (global) | Declarative in `define()` |
| **Async Loading** | No | No | Yes |
| **Use Case** | Server-side | Simple scripts | Complex web apps |

## File Descriptions

- **`browser-example.html`** - Entry point with RequireJS configuration and module loading
- **`styles.css`** - Styling for the UI
- **`app.js`** - Application module that depends on the lexer
  - Declares dependency on `./example-amd`
  - Implements tokenization logic
  - Handles UI events
- **`example-amd.js`** - Generated lexer in AMD format
  - Wraps lexer in `define([])`
  - Returns lexer object
  - Compatible with RequireJS loader

## Key Concepts

### AMD (Asynchronous Module Definition)

AMD is a module format designed for browser-based applications with asynchronous module loading. Key features:

1. **Declarative Dependencies:** Dependencies are declared upfront
   ```javascript
   define(['dep1', 'dep2'], function(d1, d2) { ... });
   ```

2. **Asynchronous Loading:** Modules are loaded on-demand
   ```javascript
   require(['module'], function(mod) { ... });
   ```

3. **Flexible Module Names:** Module paths are configurable
   ```javascript
   require.config({ paths: { 'module': 'path/to/module' } });
   ```


## Advanced Usage

### Dynamic Module Loading

```javascript
require(['./example-amd'], function(lexer) {
  lexer.setInput("2 + 3");
  // Use lexer...
});
```

### Multiple Dependencies

```javascript
define(['./example-amd', './utils'], function(lexer, utils) {
  // Both modules are loaded before this function executes
  lexer.setInput(utils.getInput());
});
```

### Conditional Loading

```javascript
define(function(require) {
  var lexer = require('./example-amd');
  
  if (someCondition) {
    var utils = require('./utils');
  }
});
```
