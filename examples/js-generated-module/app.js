function tokenize() {
    const input = document.getElementById('input').value;
    const resultsDiv = document.getElementById('results');
    
    if (!input.trim()) {
        resultsDiv.innerHTML = '<p class="error">Please enter some input</p>';
        return;
    }

    try {
        // The 'exampleBrowser' variable is created globally by the IIFE standalone module
        exampleBrowser.setInput(input);
        
        const results = [];
        let token;
        
        while ((token = exampleBrowser.lex()) !== 1) { // 1 is EOF
            results.push({
                type: token,
                lexeme: exampleBrowser.yytext,
                loc: exampleBrowser.yylloc
            });
        }
        // Add EOF token
        results.push({
            type: 'EOF',
            lexeme: exampleBrowser.yytext,
            loc: exampleBrowser.yylloc
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
