#!/usr/bin/env node

/**
 * Script para agregar automáticamente JSDoc a funciones internas de un lexer generado
 * 
 * Uso:
 *   node add-jsdoc-to-lexer.js <archivo-lexer.js>
 * 
 * Este script post-procesa un archivo de lexer generado y agrega comentarios JSDoc
 * a las funciones internas críticas sin modificar su lógica.
 */

const fs = require('fs');
const path = require('path');

// Definición de comentarios JSDoc para cada función
const jsdocComments = {
    'parseError': `/**
 * Maneja errores de análisis léxico.
 * @internal
 * @param {string} str - Mensaje de error
 * @param {Object} hash - Información adicional sobre el error
 * @throws {Error} Si no hay parser configurado
 */`,

    'setInput': `/**
 * Reinicia el lexer y configura una nueva entrada.
 * @internal
 * @param {string} input - Cadena de entrada a analizar
 * @param {Object} [yy] - Contexto compartido del parser
 * @returns {Object} Retorna this para encadenamiento de métodos
 */`,

    'input': `/**
 * Consume y retorna un carácter de la entrada.
 * @internal
 * @returns {string} El carácter consumido
 */`,

    'unput': `/**
 * Retrocede caracteres en la entrada.
 * @internal
 * @param {string} ch - Carácter(es) a retroceder
 * @returns {Object} Retorna this
 */`,

    'more': `/**
 * Señala al lexer que debe continuar acumulando texto en el token actual.
 * @internal
 * @returns {Object} Retorna this
 */`,

    'reject': `/**
 * Rechaza el token actual e intenta la siguiente regla de lexing.
 * Solo funciona si options.backtrack_lexer está habilitado.
 * @internal
 * @returns {false|Error} Retorna false o lanza Error
 * @throws {Error} Si se llama sin backtrack_lexer habilitado
 */`,

    'less': `/**
 * Retiene solo los primeros n caracteres de la coincidencia actual.
 * @internal
 * @param {number} n - Número de caracteres a retener
 */`,

    'pastInput': `/**
 * Retorna el texto ya procesado y consumido.
 * @internal
 * @returns {string} Texto consumido hasta ahora (máximo 20 caracteres)
 */`,

    'upcomingInput': `/**
 * Retorna el texto próximo a ser procesado.
 * @internal
 * @returns {string} Texto pendiente (máximo 20 caracteres)
 */`,

    'showPosition': `/**
 * Muestra la posición exacta del error de análisis léxico.
 * @internal
 * @returns {string} Representación visual del error
 */`,

    'test_match': `/**
 * Evalúa si un patrón coincide con la entrada y procesa el token.
 * Este es el método nuclear del análisis léxico.
 * @internal
 * @param {Array} match - Resultado del match del regex
 * @param {number} indexed_rule - Índice de la regla
 * @returns {string|number|false} Token o false si rechazado
 * @throws {Error} Si se llama reject() fuera de modo backtrack_lexer
 */`,

    'next': `/**
 * Retorna el siguiente token del flujo de entrada.
 * Este es el método principal del lexer.
 * @internal
 * @returns {string|number|boolean} Token coincidente o EOF (1)
 */`,

    '_currentRules': `/**
 * Obtiene las reglas de lexing para la condición de inicio actual.
 * @internal
 * @returns {Array<number>} Array de índices de reglas aplicables
 * @private
 */`,

    'lex': `/**
 * Alias para next(). Mantiene compatibilidad con interfaz estándar de lexer.
 * @internal
 * @returns {string|number|boolean} Token coincidente o EOF
 */`,

    'begin': `/**
 * Cambia a una nueva condición de inicio.
 * @internal
 * @param {string} condition - Nombre de la condición de inicio
 * @returns {Object} Retorna this
 * @throws {Error} Si la condición no existe
 */`,

    'popState': `/**
 * Restaura la condición de inicio anterior de la pila.
 * @internal
 * @returns {string} Nombre de la condición restaurada
 */`,

    'pushState': `/**
 * Guarda la condición de inicio actual y cambia a una nueva.
 * @internal
 * @param {string} condition - Nombre de la nueva condición
 * @returns {Object} Retorna this
 */`,
};

/**
 * Expresión regular para detectar funciones (método u objeto)
 * Captura: (comentario previo) (nombre función) : (palabra function o ()=>)
 */
const functionPattern = /\/\/ ([^\n]+)\n(\w+):\s*function\s*\(/g;

/**
 * Expresión alternativa para métodos sin comentarios previos
 */
const methodPattern = /(\w+):\s*function\s*\(/g;

function addJSDocToLexer(filePath) {
    console.log(`📄 Procesando: ${filePath}`);
    
    if (!fs.existsSync(filePath)) {
        console.error(`❌ Archivo no encontrado: ${filePath}`);
        process.exit(1);
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let modified = false;
    let replacements = 0;

    // Procesar cada función conocida
    for (const [functionName, jsdoc] of Object.entries(jsdocComments)) {
        // Patrón 1: Función con comentario de línea previo
        const pattern1 = new RegExp(
            `\\/\\/ [^\\n]+\\n(\\s*${functionName}:\\s*function\\s*\\(`,
            'g'
        );
        
        if (pattern1.test(content)) {
            content = content.replace(
                pattern1,
                `${jsdoc}\n$1`
            );
            replacements++;
            modified = true;
            console.log(`  ✓ ${functionName}: agregado JSDoc`);
        } else {
            // Patrón 2: Función sin comentario previo
            const pattern2 = new RegExp(
                `(\\n\\s*)${functionName}:\\s*function\\s*\\(`,
                'g'
            );
            
            if (pattern2.test(content)) {
                content = content.replace(
                    pattern2,
                    `\n${jsdoc}\n$1${functionName}: function(`
                );
                replacements++;
                modified = true;
                console.log(`  ✓ ${functionName}: agregado JSDoc`);
            } else {
                console.log(`  ⊘ ${functionName}: no encontrado o ya documentado`);
            }
        }
    }

    if (modified) {
        // Crear archivo de respaldo
        const backupPath = `${filePath}.backup`;
        fs.writeFileSync(backupPath, fs.readFileSync(filePath, 'utf8'));
        console.log(`\n📦 Respaldo creado: ${backupPath}`);

        // Escribir archivo modificado
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`\n✅ Archivo actualizado: ${filePath}`);
        console.log(`   ${replacements} función(es) documentada(s)`);

        // Verificación básica
        const lines = content.split('\n');
        const jsdocLines = lines.filter(l => l.includes('@internal')).length;
        console.log(`   ${jsdocLines} etiquetas @internal encontradas`);
    } else {
        console.log('\n⚠️  No se realizaron cambios');
    }
}

function generateTypeDefinitions() {
    const typeDefs = `/**
 * @typedef {Object} LexerLocation
 * @property {number} first_line - Primera línea (1-indexed)
 * @property {number} last_line - Última línea
 * @property {number} first_column - Primera columna (0-indexed)
 * @property {number} last_column - Última columna
 * @property {number[]} [range] - Rango de bytes si está habilitado
 */

/**
 * @typedef {Object} LexerBackupState
 * @property {number} yylineno - Número de línea actual
 * @property {LexerLocation} yylloc - Ubicación actual del token
 * @property {string} yytext - Texto del token acumulado
 * @property {string} match - Coincidencia actual
 * @property {Array} matches - Grupos de captura del regex
 * @property {string} matched - Todo el texto coincidido
 * @property {number} yyleng - Longitud del token
 * @property {number} offset - Desplazamiento en bytes
 * @property {boolean} _more - Flag de acumulación
 * @property {string} _input - Entrada pendiente
 * @property {Object} yy - Contexto compartido (parser)
 * @property {string[]} conditionStack - Pila de condiciones de inicio
 * @property {boolean} done - Flag de fin de input
 */

/**
 * @typedef {Object} LexerOptions
 * @property {boolean} [backtrack_lexer] - Habilita backtracking
 * @property {boolean} [flex] - Usa modo FLEX (longest match)
 * @property {boolean} [ranges] - Habilita información de rango de bytes
 * @property {boolean} [case-insensitive] - Ignora mayúsculas/minúsculas
 */
`;

    return typeDefs;
}

// Punto de entrada del script
if (require.main === module) {
    const args = process.argv.slice(2);
    
    if (args.length === 0 || args.includes('--help')) {
        console.log(`
Uso: node add-jsdoc-to-lexer.js [archivo-lexer.js] [--generate-types] [--help]

Opciones:
  --generate-types    Genera un archivo con definiciones de tipos
  --help              Muestra esta ayuda

Ejemplos:
  node add-jsdoc-to-lexer.js examples/more/lexer.js
  node add-jsdoc-to-lexer.js lexer.js --generate-types

1. El archivo archivo-lexer.js debe ser un archivo JavaScript generado por @ull-esit-pl/jison-lex. 
2. El fichero es sobreescrito con los comentarios JSDoc agregados a funciones internas críticas sin modificar su lógica.  
        `);
        process.exit(0);
    }

    const filePath = args[0];

    if (args.includes('--help')) {
        console.log('Ver arriba para ayuda');
        process.exit(0);
    }

    if (args.includes('--generate-types')) {
        const typeDefs = generateTypeDefinitions();
        const typesFile = `${path.dirname(filePath)}/lexer-types.jsdoc.js`;
        fs.writeFileSync(typesFile, typeDefs);
        console.log(`📝 Definiciones de tipos generadas: ${typesFile}`);
    }

    addJSDocToLexer(filePath);
}

module.exports = { addJSDocToLexer, generateTypeDefinitions };
