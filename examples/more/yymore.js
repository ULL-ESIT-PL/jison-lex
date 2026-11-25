// Example of use of this.more() in a lexer rule action to continue 
// matching input until a certain condition is met.
var RegExpLexer = require("../../index");
var assert = require("assert");

function testMore() {
    var dict = {
        rules: [
           ["x", "return 'X';" ],
           ['"[^"]*', function(){
               if(yytext.charAt(yyleng-1) == '\\') {
                   this.more();
               } else {
                   yytext += this.input(); // swallow end quote
                   return "STRING";
               }
            } ],
           ["$", "return 'EOF';" ]
       ]
    };

    var input = 'x"fgjdrtj\\"sdfsdf"x';

    var lexer_ = new RegExpLexer(dict);
    var lexerSource = lexer_.generateModule();
    eval(lexerSource);
    lexer.setInput(input);

    console.log(lexer.lex());
    console.log(lexer.lex());
    console.log(lexer.lex());
    console.log(lexer.lex());
};

testMore();