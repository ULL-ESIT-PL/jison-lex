// Example of use of this.more() in a lexer rule action to continue 
// matching input until a certain condition is met.
var RegExpLexer = require("../index");

var test_more = function() {
    var dict = {
        rules: [
           ["x", "return 'X';" ],
           ['"[^"]*', function(){ // match a " followed by any number ofno double quotes"
               if(yytext.charAt(yyleng-1) == '\\') { // if the last character is a backslash, we want to continue matching
                   yytext += this.input(); // swallow the backslash and the next character
                   this.more(); // continue matching the input with the same rule
               } else {
                   yytext += this.input(); // swallow end quote
                   return "STRING";
               }
            } ],
           ["$", "return 'EOF';" ]
       ]
    };

    var input = 'x"fgjdrtj\\"sdfsdf"x';

    var lexer = new RegExpLexer(dict, input);
    console.log(lexer.lex());
    console.log(lexer.lex());
    console.log(lexer.lex());
    console.log(lexer.lex());
};

test_more();