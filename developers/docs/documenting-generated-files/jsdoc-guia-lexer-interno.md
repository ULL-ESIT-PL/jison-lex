# Guía: Documentar Funciones Internas del Lexer con JSDoc

## Resumen

Las funciones internas del lexer generado por jison-lex son métodos críticos del objeto lexer que manejan el análisis léxico. Aunque son generadas automáticamente, es importante documentarlas con JSDoc para mejorar la inteligibilidad del código y el soporte de IDEs.

## Contexto

El archivo `lexer.js` generado contiene funciones internas como:
- `test_match()` - Evalúa si un patrón coincide y ejecuta la acción correspondiente
- `next()` - Retorna el siguiente token del flujo de entrada
- `input()` - Consume y retorna un carácter de la entrada
- `unput()` - Retrocede caracteres en la entrada
- `more()` - Señala que se debe continuar acumulando tokens
- `reject()` - Rechaza el token actual e intenta la siguiente regla

## Estándares JSDoc para Funciones Internas

### 1. **Usar `@internal` o `@private`**

Para funciones que no forman parte de la API pública:

```javascript
/**
 * Evalúa si un patrón coincide con la entrada y ejecuta la acción correspondiente.
 * Esta es una función interna usada por el motor de lexing.
 * 
 * @internal
 * @param {Array} match - Resultado del match regex (Array con [0] = texto completo, [1...] = grupos)
 * @param {number} indexed_rule - Índice de la regla de lexing a ejecutar
 * @returns {string|false} Token si coincide, false si no coincide o el lexer está en modo backtrack
 * @private
 */
test_match: function(match, indexed_rule) {
    // implementación
}
```

### 2. **Parámetros con Tipos Complejos**

Cuando los parámetros son objetos complejos, documenta sus propiedades:

```javascript
/**
 * Reinicia el lexer y configura una nueva entrada.
 * 
 * @internal
 * @param {string} input - Cadena de entrada a analizar
 * @param {Object} [yy] - Contexto compartido del parser
 * @param {Object} [yy.parser] - Referencia al parser para manejar errores
 * @returns {Object} Retorna this para encadenamiento de métodos
 */
setInput: function (input, yy) {
    // implementación
}
```

### 3. **Objetos de Estado Complejos**

Para funciones que manejan estado interno complejo:

```javascript
/**
 * Almacena el estado actual del lexer para recuperación en modo backtrack.
 * 
 * @internal
 * @param {Object} backup - Objeto con el estado a restaurar
 * @param {number} backup.yylineno - Número de línea actual
 * @param {Object} backup.yylloc - Ubicación del token (línea, columna)
 * @param {number} backup.yylloc.first_line - Primera línea del token
 * @param {number} backup.yylloc.last_line - Última línea del token
 * @param {number} backup.yylloc.first_column - Primera columna del token
 * @param {number} backup.yylloc.last_column - Última columna del token
 * @param {string} backup.yytext - Texto del token acumulado
 * @param {number} backup.offset - Desplazamiento en bytes
 * @param {boolean} backup._backtrack - Flag de backtracking
 * @param {number[]} [backup.yylloc.range] - Rango de bytes si está habilitado
 */
function restoreState(backup) {
    // implementación
}
```

### 4. **Funciones Generadas vs Originales**

Distingue entre funciones generadas y métodos del prototipo:

```javascript
/**
 * Realiza el acción correspondiente al token coincidente.
 * 
 * NOTA: Este método es generado dinámicamente por jison-lex en tiempo de compilación
 * basándose en las acciones definidas en el archivo .l
 * 
 * @internal
 * @param {Object} yy - Contexto compartido (parser)
 * @param {Object} yy_ - Referencia al lexer actual
 * @param {number} $avoiding_name_collisions - Índice de la regla
 * @param {string} YY_START - Nombre de la condición de inicio actual
 * @returns {*} Lo que retorne la acción de la regla
 */
performAction: function(yy, yy_, $avoiding_name_collisions, YY_START) {
    // switch generado dinámicamente
}
```

## Ubicación de Comentarios en el Código Generado

### Opción 1: Post-procesamiento (Recomendado)

Después de generar el lexer, post-procesa el archivo:

```javascript
// script para agregar JSDoc a un lexer generado
const fs = require('fs');

function addJSDocToLexer(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Agregar JSDoc antes de test_match
    content = content.replace(
        /\/\/ test the lexed token.*?\ntest_match:function\(match, indexed_rule\)/,
        `/**
 * Evalúa si un patrón coincide con la entrada y ejecuta la acción.
 * @internal
 * @param {Array} match - Resultado del regex match
 * @param {number} indexed_rule - Índice de la regla
 * @returns {string|false} Token si coincide, false en caso contrario
 */
test_match:function(match, indexed_rule)`
    );
    
    fs.writeFileSync(filePath, content);
}
```

### Opción 2: Wrapper Documentation

Crea un archivo de tipos TypeScript o JSDoc de definición:

```javascript
// lexer-internal.jsdoc.js

/**
 * @typedef {Object} LexerBackupState
 * @property {number} yylineno - Número de línea
 * @property {Object} yylloc - Ubicación actual
 * @property {string} yytext - Texto del token
 * @property {string} match - Coincidencia actual
 * @property {Array} matches - Grupos de captura
 * @property {string} matched - Todo lo coincidido
 * @property {number} yyleng - Longitud del token
 * @property {number} offset - Desplazamiento de bytes
 */

/**
 * @callback TestMatchFunction
 * @param {Array} match - Resultado del match
 * @param {number} indexed_rule - Índice de la regla
 * @returns {string|false} Token o false
 */

/**
 * @callback PerformActionFunction
 * @param {Object} yy - Contexto del parser
 * @param {Object} yy_ - Referencia al lexer
 * @param {number} $avoiding_name_collisions - Índice de regla
 * @param {string} YY_START - Condición de inicio
 * @returns {*} Resultado de la acción
 */
```

## Tipos Comunes en Funciones Internas

```javascript
/**
 * @typedef {Object} LexerOptions
 * @property {boolean} [backtrack_lexer] - Habilita backtracking
 * @property {boolean} [flex] - Modo FLEX (longest match)
 * @property {boolean} [ranges] - Habilita información de rango de bytes
 * @property {boolean} [case-insensitive] - Ignora mayúsculas/minúsculas
 */

/**
 * @typedef {Object} LexerLocation
 * @property {number} first_line - Primera línea (1-indexed)
 * @property {number} last_line - Última línea
 * @property {number} first_column - Primera columna (0-indexed)
 * @property {number} last_column - Última columna
 * @property {number[]} [range] - Rango de bytes [inicio, fin] si está habilitado
 */
```

## Ejemplo Completo: Documentar `test_match`

```javascript
/**
 * Evalúa si un patrón coincide con la entrada actual y procesa el token.
 * 
 * Este método es parte del flujo de análisis léxico interno. Cuando el lexer
 * intenta hacer coincidir un patrón regex con la entrada, este método:
 * 1. Actualiza las posiciones de línea y columna
 * 2. Acumula el texto coincidente
 * 3. Llama a performAction para ejecutar la acción de la regla
 * 4. En modo backtrack, restaura el estado si la acción rechaza el match
 * 
 * @internal
 * @param {Array} match - Resultado del match del regex
 *                       match[0] = texto completo coincidente
 *                       match[1...n] = grupos de captura opcionales
 * @param {number} indexed_rule - Índice de la regla de lexing en rules[]
 * @returns {string|boolean} Retorna el token si es válido, false si:
 *                           - La acción llamó reject() (modo backtrack)
 *                           - La acción no retorna un token
 * 
 * @throws {Error} Si se llama reject() fuera de modo backtrack_lexer
 * 
 * @example
 * // Uso interno (no debería llamarse directamente)
 * const match = this._input.match(this.rules[0]);
 * if (match) {
 *     const token = this.test_match(match, 0);
 *     if (token) {
 *         return token;
 *     }
 * }
 */
test_match: function(match, indexed_rule) {
    // ... implementación
}
```

## Mejores Prácticas

### ✅ **SÍ HACER:**

1. **Usar `@internal` para funciones no públicas**
   - Indica a herramientas que no debería usarse externamente
   - JSDoc excluye estos métodos de la documentación pública por defecto

2. **Documentar estructuras de datos complejas**
   - Define qué propiedades usa cada función
   - Incluso si están en objetos internos

3. **Notar diferencias de comportamiento**
   - Comportamiento en modo backtrack vs normal
   - Efectos secundarios sobre el estado del lexer

4. **Incluir ejemplos de uso interno**
   - Cómo se llama desde otros métodos
   - Precondiciones y postcondiciones

5. **Crear tipos compartidos con `@typedef`**
   - Evita repetir definiciones complejas
   - Mejora consistencia

### ❌ **NO HACER:**

1. **Documentar exhaustivamente** - Solo lo necesario
   - Mantén comentarios enfocados
   - No repitas lo obvio del código

2. **Cambiar el nombre de las funciones** - Usa los nombres generados
   - Preserva la compatibilidad con jison-lex
   - Solo documenta, no refactoriza

3. **Documentar como público** - Usa `@private` o `@internal`
   - Advierte a otros desarrolladores
   - Protege contra cambios accidentales

## Configuración de jsdoc.json

```json
{
  "source": {
    "include": ["index.js", "examples/more/lexer.js"],
    "includePattern": ".+\\.js(doc|on)?$"
  },
  "opts": {
    "destination": "./docs",
    "private": false,
    "access": "all"
  },
  "templates": {
    "default": {
      "staticFiles": {
        "include": ["./static"]
      }
    }
  }
}
```

**Notas de configuración:**
- `"private": false` - Incluye miembros `@private`
- `"access": "all"` - Muestra públicos, privados e internos
- Ajusta según si quieres que `@internal` aparezca en docs

## Resumen de Etiquetas Útiles

| Etiqueta | Uso | Ejemplo |
|----------|-----|---------|
| `@internal` | Función interna, no para uso público | `@internal` |
| `@private` | Miembro privado (similar a `@internal`) | `@private` |
| `@param {type} name` | Documenta parámetros | `@param {string} input` |
| `@returns {type}` | Tipo de retorno | `@returns {boolean}` |
| `@throws {type}` | Excepciones que puede lanzar | `@throws {Error}` |
| `@example` | Ejemplos de uso | `@example const x = fn();` |
| `@typedef` | Define tipos personalizados | `@typedef {Object} MyType` |
| `@callback` | Define tipos de funciones | `@callback MyCallback` |
| `@deprecated` | Marca como obsoleto | `@deprecated Use newFunc instead` |

## Referencias

- [JSDoc Manual](https://jsdoc.app/)
- [JSDoc @internal](https://jsdoc.app/tags-internal.html)
- [JSDoc @typedef](https://jsdoc.app/tags-typedef.html)
- [jison-lex Documentation](https://github.com/ULL-ESIT-PL/jison-lex)
