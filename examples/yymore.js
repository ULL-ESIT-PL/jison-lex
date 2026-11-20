var RegExpLexer = require("../regexp-lexer");

var test_more = function() {
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

    var lexer = new RegExpLexer(dict, input);
    console.log(lexer.lex());
    console.log(lexer.lex());
    console.log(lexer.lex());
    console.log(lexer.lex());
};

test_more();