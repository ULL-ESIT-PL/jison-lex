%%
x             { return 'X'; }
y             { return 'Y'; }
\"[^"]*       {  // When executed with node examples/more/main.cjs 'x"he\"l\"lo"x'
                 if(yytext.charAt(yyleng-1) == '\\') { // The first time the match will be '"he\\'
                   this.more(); 
                 } else {
                    yytext += this.input(); // swallow end quote
                    return "STRING";
                 }
               } 
.              return 'INVALID';
$              return 'EOF';

%%
