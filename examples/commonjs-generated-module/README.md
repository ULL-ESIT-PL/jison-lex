# jison-lex Example generating a CommonJS Module

Simple Node.js example using the default CommonJS module format.

See files [/examples/example.l](/examples/example.l) and [main.cjs](main.cjs).

**Usage:**

```bash
# First compile the lexer
jison-lex -t commonjs examples/example.l -o examples/commonjs-generated-module/example.js

# Then run the example
node examples/commonjs-generated-module/main.cjs
```
