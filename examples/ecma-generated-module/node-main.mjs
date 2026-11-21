#!/usr/bin/env node

/**
 * Simple Node.js Example: Using ES6 Lexer Module
 * 
 * This example demonstrates how to use the ES6 module-generated lexer
 * directly in Node.js with ES6 import syntax.
 * 
 * Requirements:
 * - Node.js 12.20+ (supports ES6 modules)
 * - The file must have .mjs extension or package.json must have "type": "module"
 * 
 * Usage:
 *   node node-main.mjs
 */

import { lexer, lex } from './example-es6.mjs';

// Example input with numbers and operators
const input = '42 + 3 * 7 - 5';

console.log('='.repeat(50));
console.log('ES6 Lexer Module Example - Node.js');
console.log('='.repeat(50));
console.log(`\nInput: "${input}"\n`);

// Method 1: Using lexer.setInput() and lexer.lex()
console.log('Method 1: Using lexer.lex() bound function');
console.log('-'.repeat(50));

lexer.setInput(input);
let token;
let tokens = [];

while ((token = lex()) !== 'EOF') {
    tokens.push({
        token,
        value: lexer.yytext,
        line: lexer.yylineno + 1
    });
}

tokens.forEach((t, index) => {
    console.log(`  Token ${index + 1}: ${t.token.padEnd(10)} | Value: "${t.value}"`);
});

// Method 2: Using lexer directly with next()
console.log('\nMethod 2: Using lexer.next()');
console.log('-'.repeat(50));

lexer.setInput(input);
let count = 0;

while (!lexer.done) {
    const result = lexer.next();
    if (result !== 'EOF' && result) {
        count++;
        console.log(`  Token ${count}: ${String(result).padEnd(10)} | Text: "${lexer.yytext}"`);
    }
}

console.log('\n' + '='.repeat(50));
console.log(`Total tokens recognized: ${tokens.length}`);
console.log('='.repeat(50));