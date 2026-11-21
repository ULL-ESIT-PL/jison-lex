import { lexer } from './example-es6.mjs';

export function tokenize() {
    const input = document.getElementById('input').value;
    const resultsDiv = document.getElementById('results');
    
    if (!input.trim()) {
        resultsDiv.innerHTML = '<p class="error">Please enter some input</p>';
        return;
    }

    try {
        // The lexer is imported directly at the top
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

// Set up event listeners when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Allow Enter key to trigger tokenization
    document.getElementById('input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            tokenize();
        }
    });
});
