# Manual Lexer Example: Building a Custom Lexer by Hand

This example demonstrates how to **manually write a lexer** without using jison-lex. It shows the fundamental concepts behind lexical analysis and how lexers work internally.

## Overview

Instead of generating a lexer with jison-lex, this example implements a custom lexer object that:
- Reads input character by character
- Recognizes tokens (NUMBERS and OPERATORS)
- Tracks location information (line and column)
- Maintains lexer state (position, text matched, etc.)
- Returns tokens compatible with Jison parsers

## Project Structure

```
manual-lexer/
├── manual-lexer.js      # Hand-written lexer implementation
├── grammar.jison        # Jison parser grammar
├── parser.js            # Generated parser (output of Jison)
├── use-manual-lexer.cjs # Example usage script
└── README.md            # This file
```

## The Manual Lexer

### Core Components

**[`manual-lexer.js`](./manual-lexer.js)** implements a simple lexer with these key parts:

#### 1. **Lexer Object Properties**
```javascript
const lexer = {
  input: "",           // Input string being processed
  index: 0,           // Current position in input
  yytext: "",         // Matched text for current token
  yylineno: 0,        // Current line number (0-based internally)
  yylloc: {},         // Location information
  column: 0           // Current column position
};
```

#### 2. **setInput() Method**
Resets the lexer to begin processing new input:
```javascript
setInput(input) {
  this.input = input;
  this.index = 0;
  this.yylineno = 0;
  this.column = 0;
  return this;
}
```

#### 3. **lex() Method**
The main lexing function that:
1. Skips whitespace
2. Checks if we reached EOF
3. Matches tokens (OPERATOR or NUMBER)
4. Returns the token type
5. Throws errors on unrecognized characters

```javascript
lex() {
  // Skip whitespace
  while (/\s+/.test(this.input[this.index])) {
    this.advance(this.input[this.index]);
  }

  // Match OPERATOR: +, -, *, /
  if (/[-+*\/]/.test(char)) {
    // ... return "OPERATOR"
  }

  // Match NUMBER: one or more digits
  if (/\d/.test(char)) {
    // ... return "NUMBER"
  }

  // Error on unknown characters
  throw new Error("Unexpected character: " + char);
}
```

#### 4. **advance() Method**
Moves forward in input and updates position tracking:
```javascript
advance(char) {
  this.index++;
  
  if (char === "\n") {
    this.yylineno++;    // New line
    this.column = 0;
  } else {
    this.column++;      // Next column
  }
}
```

### Lexer State

The lexer maintains several properties that parsers depend on:

| Property | Type | Purpose |
|----------|------|---------|
| `yytext` | string | The matched text for the current token |
| `yylineno` | number | Current line number (0-based, Jison uses 1-based) |
| `yylloc` | object | Location info: `{first_line, last_line, first_column, last_column}` |
| `index` | number | Current position in input string |
| `column` | number | Current column number |

## Token Recognition

The lexer recognizes two token types:

### 1. **OPERATOR**
Matches: `+`, `-`, `*`, `/`

```javascript
if (/[-+*\/]/.test(char)) {
  this.yytext = char;      // Single character
  this.advance(char);
  return "OPERATOR";
}
```

### 2. **NUMBER**
Matches: One or more consecutive digits

```javascript
if (/\d/.test(char)) {
  let num = "";
  while (/\d/.test(this.input[this.index])) {
    num += this.input[this.index];
    this.advance(this.input[this.index]);
  }
  this.yytext = num;      // e.g., "123"
  return "NUMBER";
}
```

## Grammar

The `grammar.jison` file defines how tokens combine into expressions:

```jison
s: expr EOF { return $1; }
;

expr
  : expr OPERATOR expr  { return { type: "OPERATOR", lexeme: $2, left: $1, right: $3 }; }
  | NUMBER              { return { type: "number", value: Number($1) }; }
  ;
```

This creates a simple calculator AST for expressions like:
- `2 + 3` → `{ type: "OPERATOR", lexeme: "+", left: {type: "number", value: 2}, right: {type: "number", value: 3} }`
- `10 * 5 - 2` → Nested structure with left-to-right evaluation

## Setup

### 1. Generate the Parser

The parser needs to be generated once from the grammar:

```bash
npx jison grammar.jison -o parser.js
```

This creates `parser.js` from `grammar.jison`.

### 2. Integrate the Manual Lexer

The generated parser expects a `lexer` object with:
- `setInput(input)` method
- `lex()` method
- `yytext`, `yylineno`, `yylloc` properties

Our manual lexer provides all of these!

## Usage

### Running the Example

```bash
node use-manual-lexer.cjs
```

**Example code from `use-manual-lexer.cjs`:**

```javascript
const { lexer } = require('./manual-lexer.js');
const parser = require('./parser.js');

// Connect the manual lexer to the parser
parser.lexer = lexer;

// Parse an expression
const result = parser.parse('2+3');
console.log(result);
```

**Output:**
```javascript
{
  type: "OPERATOR",
  lexeme: "+",
  left: { type: "number", value: 2, loc: {...} },
  right: { type: "number", value: 3, loc: {...} },
  loc: {...}
}
```

## Why Write Lexers Manually?

### When to Use Manual Lexing

✅ **Good for:**
- Learning how lexers work internally
- Simple grammars with few token types
- Embedded lexing (lexer inline in parser)
- Performance-critical systems (less overhead)
- Languages with unusual tokenization needs
- Building custom lexers for DSLs

❌ **Not ideal for:**
- Complex grammars with many tokens
- Detailed location tracking
- Error recovery and reporting
- Maintenance (easier to maintain generated code)
- Large projects (generator scales better)

### Comparison: Manual vs Generated

| Aspect | Manual Lexer | Generated (jison-lex) |
|--------|------------|----------------------|
| **Learning** | Shows internals clearly | Black box |
| **Maintenance** | Manual updates needed | Auto-regenerated |
| **Features** | Only what you code | Automatic location, state |
| **Debugging** | Manual inspection | Generated, harder to debug |
| **Performance** | Often faster | Slightly more overhead |
| **Complexity** | Grows with token count | Same regardless |

## Understanding Lexer Concepts

### Character-by-Character Processing

The lexer reads one character at a time:

```
Input: "2 + 3"
       ↑
       └─ Read '2'
          └─ Token: NUMBER, yytext: "2"
       
       ↑ (skip space)
       └─ Read '+'
          └─ Token: OPERATOR, yytext: "+"
       
       ↑ (skip space)
       └─ Read '3'
          └─ Token: NUMBER, yytext: "3"
       
       ↑
       └─ EOF reached
          └─ Token: EOF
```

### State Tracking

The lexer maintains position information for error messages:

```javascript
this.yylloc = {
  first_line: 1,     // Where token starts (1-based for Jison)
  last_line: 1,
  first_column: 2,
  last_column: 3
};
```

### Regular Expressions

The lexer uses regex for pattern matching:

```javascript
/\s+/       // One or more whitespace characters
/[-+*\/]/   // Operators: +, -, *, / (note: / is escaped)
/\d/        // Single digit
```

## Advanced: Extending the Lexer

### Add More Tokens

To recognize identifiers (variable names), add before the error:

```javascript
// IDENTIFIER
if (/[a-zA-Z_]/.test(char)) {
  let id = "";
  while (/[a-zA-Z0-9_]/.test(this.input[this.index])) {
    id += this.input[this.index];
    this.advance(this.input[this.index]);
  }
  this.yytext = id;
  return "IDENTIFIER";
}
```

### Add Comments

To skip `/* ... */` comments:

```javascript
// Skip comments
if (char === '/' && this.input[this.index + 1] === '*') {
  this.advance('/');
  this.advance('*');
  while (this.index < this.input.length) {
    if (this.input[this.index] === '*' && this.input[this.index + 1] === '/') {
      this.advance('*');
      this.advance('/');
      break;
    }
    this.advance(this.input[this.index]);
  }
  return this.lex(); // Recursively get next token
}
```

### Handle Strings

To recognize quoted strings:

```javascript
// STRING
if (char === '"') {
  this.advance('"');
  let str = "";
  while (this.input[this.index] !== '"') {
    str += this.input[this.index];
    this.advance(this.input[this.index]);
  }
  this.advance('"');
  this.yytext = str;
  return "STRING";
}
```

## Troubleshooting

### "Unexpected character" Error

The input contains a character the lexer doesn't recognize.

```
Error: Unexpected character: @
```

**Solution:** Add token recognition for that character or update the grammar.

### Parser expects different tokens

If you change tokens in the lexer, update `grammar.jison`:

```jison
%token NUMBER OPERATOR IDENTIFIER EOF
```

Then regenerate: `npx jison grammar.jison -o parser.js`

### Location information is wrong

Ensure `advance()` is called for every character:

```javascript
// WRONG - doesn't track position
this.yytext = char;

// RIGHT - tracks position
this.advance(char);
```

## Comparison with jison-lex Generated Lexer

**Manual approach (this example):**
- 80 lines of code
- Full control and understanding
- Easier to debug
- Good for learning
- Harder to maintain complex grammars

**Generated with jison-lex:**
- 300+ lines of generated code
- Automatic handling of regex, state machine, location tracking
- More features (lexer conditions, exclusion ranges, etc.)
- Easier for complex grammars
- Black box (harder to understand internals)

## Learning Path

1. **Study this example** - Understand how lexers work at the character level
2. **Try modifying the grammar** - Add new operators or token types
3. **Look at generated lexers** - Compare with output from jison-lex
4. **Use jison-lex for real projects** - Leverage automatic generation for complex lexers

## Further Reading

- [Lexical Analysis (Wikipedia)](https://en.wikipedia.org/wiki/Lexical_analysis)
- [Finite State Machines](https://en.wikipedia.org/wiki/Finite-state_machine)
- [Jison Manual](https://jison.org/)
- [jison-lex README](../../README.md)
- [Other Examples](../README.md)

## Related Examples

- **[CommonJS Example](../main.cjs)** - Using generated CommonJS lexer with Node.js
- **[ES6 Modules](../ecma-generated-module/)** - Generated lexer with modern modules
- **[AMD/RequireJS](../amd-generated-module/)** - Generated lexer with AMD
- **[IIFE Standalone](../js-generated-module/)** - Generated lexer in browser

This manual example is perfect for understanding the foundations that all lexers build upon!
