# Quick Reference: Documentar Lexer con JSDoc

## Tarjeta de Referencia Rápida

### Template Básico
```javascript
/**
 * Breve descripción de qué hace.
 * 
 * @internal
 * @param {type} paramName - descripción
 * @returns {type} descripción del retorno
 * @throws {Error} cuando ocurre error
 * @example
 * // Cómo se usa
 * lexer.metodo();
 * 
 * @see metodoRelacionado
 */
metodo: function(paramName) { }
```

## Funciones del Lexer

### test_match(match, indexed_rule) - 🔴 PRIORITARIA
```javascript
/**
 * Evalúa si un patrón coincide y procesa el token.
 * @internal
 * @param {Array} match - [fullMatch, group1, group2...]
 * @param {number} indexed_rule - Índice de la regla
 * @returns {string|number|false} Token o false si rechazado
 * @see next, performAction, reject
 */
```

### next() - 🔴 PRIORITARIA
```javascript
/**
 * Obtiene el siguiente token del flujo de entrada.
 * @internal
 * @returns {string|number|boolean} Token o EOF (1)
 * @see test_match
 */
```

### performAction(yy, yy_, $avoiding_name_collisions, YY_START) - 🔴 PRIORITARIA
```javascript
/**
 * Ejecuta la acción generada para el token coincidente.
 * @internal
 * @generated Generado dinámicamente por jison-lex
 * @param {Object} yy - Contexto del parser
 * @param {Object} yy_ - Referencia al lexer
 * @param {number} $avoiding_name_collisions - Índice de regla
 * @param {string} YY_START - Condición de inicio
 * @returns {*} Lo que retorne la acción
 */
```

### setInput(input, yy) - 🟡 IMPORTANTE
```javascript
/**
 * Reinicia el lexer y configura entrada.
 * @internal
 * @param {string} input - Entrada a analizar
 * @param {Object} [yy] - Contexto del parser
 * @returns {Object} this
 */
```

### input() - 🟡 IMPORTANTE
```javascript
/**
 * Consume y retorna un carácter de la entrada.
 * @internal
 * @returns {string} Carácter consumido
 */
```

### reject() - 🟡 IMPORTANTE
```javascript
/**
 * Rechaza el token actual e intenta siguiente regla.
 * Solo en modo backtrack_lexer.
 * @internal
 * @returns {false}
 * @throws {Error} Sin backtrack habilitado
 */
```

### more() - 🟡 IMPORTANTE
```javascript
/**
 * Señala que se debe continuar acumulando.
 * @internal
 * @returns {Object} this
 */
```

### unput(ch) - 🟢 UTILIDAD
```javascript
/**
 * Retrocede caracteres en la entrada.
 * @internal
 * @param {string} ch - Carácter(es) a retroceder
 * @returns {Object} this
 */
```

### less(n) - 🟢 UTILIDAD
```javascript
/**
 * Retiene solo los primeros n caracteres.
 * @internal
 * @param {number} n - Número de caracteres a retener
 */
```

### showPosition() - 🟢 UTILIDAD
```javascript
/**
 * Muestra posición del error en formato visual.
 * @internal
 * @returns {string} Representación del error
 */
```

### pastInput() - 🟢 UTILIDAD
```javascript
/**
 * Retorna texto ya procesado (últimos 20 chars).
 * @internal
 * @returns {string} Texto consumido
 */
```

### upcomingInput() - 🟢 UTILIDAD
```javascript
/**
 * Retorna texto próximo a procesar.
 * @internal
 * @returns {string} Próximos caracteres
 */
```

## Tipos Personalizados (@typedef)

```javascript
/**
 * @typedef {Object} LexerLocation
 * @property {number} first_line
 * @property {number} last_line
 * @property {number} first_column
 * @property {number} last_column
 * @property {number[]} [range] - Opcional
 */

/**
 * @typedef {Object} LexerOptions
 * @property {boolean} [backtrack_lexer]
 * @property {boolean} [flex]
 * @property {boolean} [ranges]
 * @property {boolean} [case-insensitive]
 */
```

## Etiquetas Clave

| Etiqueta | Uso |
|----------|-----|
| `@internal` | Función no-pública |
| `@param {type}` | Parámetro |
| `@returns {type}` | Retorno |
| `@throws {Error}` | Excepciones |
| `@example` | Código ejemplo |
| `@see reference` | Referencias cruzadas |
| `@typedef` | Tipo personalizado |
| `@generated` | Código auto-generado |

## Validación

```bash
# Generar docs
jsdoc -c jsdoc.json

# Verificar sintaxis
jsdoc -c jsdoc.json --verbose

# Contar @internal
grep -c "@internal" lexer.js

# Buscar sin documentar
grep "^[[:space:]]*\w\+:[[:space:]]*function" lexer.js | \
  grep -v -B1 "^\s*/\*"
```

## Checklist Mínimo por Función

- [ ] Descripción breve
- [ ] `@internal`
- [ ] Todos los `@param` con tipos
- [ ] `@returns` con tipo
- [ ] Excepciones (`@throws`) si aplica
- [ ] Ejemplo si no es obvio
- [ ] Referencias con `@see`

## Automatización

```bash
# Script automatizado
node add-jsdoc-to-lexer.js lexer.js

# Con generación de tipos
node add-jsdoc-to-lexer.js lexer.js --generate-types
```

## Generación de Documentación

```bash
# Configurar jsdoc.json
{
  "source": { "include": ["lexer.js"], "excludePattern": "node_modules" },
  "opts": { "destination": "./docs", "private": true }
}

# Generar
jsdoc -c jsdoc.json

# Ver en navegador
open docs/index.html
```

## Patrón Completo: test_match()

```javascript
/**
 * Evalúa si un patrón coincide con la entrada y procesa el token.
 * 
 * Este es el método nuclear del análisis léxico:
 * 1. Guarda estado si backtracking está habilitado
 * 2. Actualiza posiciones de línea/columna
 * 3. Acumula el texto en yytext, match, matched
 * 4. Llama performAction() para ejecutar la acción
 * 5. Maneja backtracking si reject() fue llamado
 * 
 * @internal
 * @param {Array} match - Resultado regex: [fullMatch, group1, ...]
 * @param {number} indexed_rule - Índice de la regla
 * @returns {string|number|false} Token o false si rechazado
 * @throws {Error} Si reject() se llama sin backtrack_lexer
 * 
 * @example
 * const match = this._input.match(this.rules[0]);
 * if (match) {
 *     const token = this.test_match(match, 0);
 *     if (token !== false) return token;
 * }
 * 
 * @see next - Llama a test_match en un bucle
 * @see performAction - Ejecutado por test_match
 * @see reject - Puede ser llamado por performAction
 */
test_match: function(match, indexed_rule) {
    // ... implementación sin cambios ...
}
```

## Troubleshooting

| Problema | Solución |
|----------|----------|
| JSDoc no reconoce funciones | Verifica sintaxis: `/** ... **/` exacta |
| Funciones no aparecen en docs | Verifica `jsdoc.json` incluye el archivo |
| Tipos no se entienden | Usa `{tipo}` entre llaves, no sin ellas |
| @internal no oculta función | Usa `"private": true` en `jsdoc.json` |

## Enlaces Rápidos

- [JSDoc Oficial](https://jsdoc.app/)
- [Guía completa local](jsdoc-guia-lexer-interno.md)
- [Ejemplo funcional local](lexer-documented-example.js)
- [Tutorial paso a paso](tutorial-paso-a-paso.md)
- [Patrones comunes](jsdoc-patrones-comunes.md)
