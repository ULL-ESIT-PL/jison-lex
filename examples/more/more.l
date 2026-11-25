%%
x             { console.log(getInfo(this)); return 'X'; }
y             { console.log(getInfo(this)); return 'Y'; }
\"[^"]*       {  // When executed with node examples/more/main.cjs 'x"he\"l\"lo"x'
                 if(yytext.charAt(yyleng-1) == '\\') { // The first time the match will be '"he\\'
                   this.more(); 
                   console.log(getInfo(this));
                 } else {
                    yytext += this.input(); // swallow end quote
                    console.log(getInfo(this));
                    return "STRING";
                 }
               } 
.              return 'INVALID';
$              return 'EOF';

%%
function getInfo(lexer) {
    // this.matched contains the matched text so far, and 
    // this._input contains the rest of the input string. 
    const { yytext, matched, _input } = lexer;
    return JSON.stringify({ yytext, matched, _input }, null, 0);
}