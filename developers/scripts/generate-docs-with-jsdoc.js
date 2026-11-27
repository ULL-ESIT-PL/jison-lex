#!/usr/bin/env node

/**
 * Script para generar documentación automáticamente.
 * 
 * Este script ejecuta dos pasos:
 * 1. Agrega JSDoc a los archivos generados (lexer.js)
 * 2. Genera la documentación HTML con JSDoc
 * 
 * Uso: node developers/scripts/generate-docs-with-jsdoc.js
 * O desde npm: npm run docs
 */

const { spawn } = require('child_process');
const path = require('path');

const DOCS_SCRIPT = path.join(__dirname, '../docs/documenting-generated-files/add-jsdoc-to-lexer.js');
const LEXER_FILE = path.join(__dirname, '../../examples/more/lexer.js');
const PROJECT_ROOT = path.join(__dirname, '../../');

console.log('📚 Generando documentación...\n');

// Paso 1: Agregar JSDoc a lexer.js
console.log('Paso 1️⃣: Agregando JSDoc a examples/more/lexer.js...');
const addJsDoc = spawn('node', [DOCS_SCRIPT, LEXER_FILE], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit'
});

addJsDoc.on('close', (code) => {
    if (code !== 0) {
        console.error(`\n❌ Error en paso 1: add-jsdoc-to-lexer.js terminó con código ${code}`);
        process.exit(1);
    }
    
    console.log('\n✅ Paso 1 completado\n');
    
    // Paso 2: Generar documentación con JSDoc
    console.log('Paso 2️⃣: Generando documentación HTML...');
    const jsdoc = spawn('npx', ['jsdoc', '-c', 'jsdoc.json'], {
        cwd: PROJECT_ROOT,
        stdio: 'inherit'
    });
    
    jsdoc.on('close', (code) => {
        if (code !== 0) {
            console.error(`\n❌ Error en paso 2: jsdoc terminó con código ${code}`);
            process.exit(1);
        }
        
        console.log('\n✅ Paso 2 completado');
        console.log('\n📖 ¡Documentación generada exitosamente!');
        console.log('   Puedes verla en: ./docs/index.html');
        console.log('   O ejecutar: npm run docs:serve');
    });
});
