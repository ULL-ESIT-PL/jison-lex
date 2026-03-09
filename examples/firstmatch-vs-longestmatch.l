// npx jison firstmatch-vs-longestmatch.jison -o minus.js
// ./use_minus.js 'abc'

// From the docs:
// The lexer will use the first rule that matches the input string unless you use %options flex, 
// in which case it will use the rule with the longest match.
// looks false to me
%options flex
%%
\s+                  /* skip whitespace */;
ab|abc|abcde|abcd|c|d|e|cd|de|cde  { console.log(yytext); }
