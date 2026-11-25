# jison-lex Example generating a CommonJS Module

Simple Node.js example using the default CommonJS module format.

See files [/examples/example.l](/examples/example.l), [/examples/commonjs-generated-module/lexer.js](/examples/commonjs-generated-module/lexer.js), [main.cjs](main.cjs) and [main-next.cjs](main-next.cjs).

**Usage:**

```bash
# First compile the lexer
jison-lex -t commonjs examples/example.l -o examples/commonjs-generated-module/lexer.js

# Then run the example
node examples/commonjs-generated-module/main.cjs

## Run also the "next" version

node examples/commonjs-generated-module/main-next.cjs 
```

