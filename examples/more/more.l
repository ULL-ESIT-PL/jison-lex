%%
x             return 'X';
y             return 'Y';
\"[^"]*       {
                 if(yytext.charAt(yyleng-1) == '\\') {
                   this.more();
                 } else {
                    yytext += this.input(); // swallow end quote
                    return "STRING";
                 }
               } 
.              return 'INVALID';
$              return       'EOF';