// Define the application module that depends on the lexer module
define(['./example-amd'], function(lexer) {
    
    function tokenize() {
        const input = document.getElementById('input').value;
        const resultsDiv = document.getElementById('results');
        
        if (!input.trim()) {
            resultsDiv.innerHTML = '<p class="error">Please enter some input</p>';
            return;
        }

        try {
            // The lexer is passed as a parameter from RequireJS
            lexer.setInput(input);
            
            const results = [];
            let token;
            
            while ((token = lexer.lex()) !== 'EOF') {
                results.push({
                    type: token,
                    lexeme: lexer.yytext,
                    loc: lexer.yylloc
                });
            }
            // Add EOF token
            results.push({
                type: 'EOF',
                lexeme: lexer.yytext,
                loc: lexer.yylloc
            });
            
            // Display results
            let html = '<div class="results"><h3>Tokens:</h3>';
            results.forEach((result, idx) => {
                html += `
                    <div class="token">
                        <strong>#${idx}:</strong> ${result.type} 
                        <br/><small>Lexeme: "${result.lexeme}"</small>
                        <br/><small>Location: Line ${result.loc.first_line}, Column ${result.loc.first_column}</small>
                    </div>
                `;
            });
            html += '</div>';
            resultsDiv.innerHTML = html;
            
        } catch (e) {
            resultsDiv.innerHTML = `<p class="error">Error: ${e.message}</p>`;
        }
    }

    // Allow Enter key to trigger tokenization
    document.getElementById('input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            tokenize();
        }
    });

    // Expose tokenize function to global scope for button click
    window.tokenize = tokenize;
});
