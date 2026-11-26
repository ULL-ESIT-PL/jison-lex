# Patrones Comunes de Documentación JSDoc para Lexers

## 1. Patrón: Funciones que Modifican Estado

Cuando una función modifica múltiples propiedades del estado del lexer:

```javascript
/**
 * Reinicia el lexer y configura una nueva entrada.
 * 
 * @internal
 * @param {string} input - Cadena a analizar
 * @param {Object} [yy] - Contexto del parser
 * @returns {Object} Retorna this (efecto secundario: reinicia estado)
 * 
 * @modifies {this.yy} 
 * @modifies {this._input}
 * @modifies {this.yylineno}
 * @modifies {this.yylloc}
 * @modifies {this.conditionStack}
 */
setInput: function(input, yy) { ... }
```

**Mejor alternativa sin @modifies:**

```javascript
/**
 * Reinicia el lexer y configura una nueva entrada.
 * 
 * Este método limpia todo el estado del lexer (yylineno, yylloc, conditionStack, etc.)
 * y lo prepara para procesar un nuevo flujo de entrada.
 * 
 * @internal
 * @param {string} input - Cadena a analizar
 * @param {Object} [yy] - Contexto del parser (opcional)
 * @returns {Object} this - permite encadenamiento de métodos
 */
```

## 2. Patrón: Funciones con Comportamiento Condicional

Cuando el comportamiento depende de opciones:

```javascript
/**
 * Rechaza el token actual e intenta la siguiente regla.
 * 
 * El comportamiento depende de la configuración del lexer:
 * - Si options.backtrack_lexer es true: restaura el estado anterior
 * - Si es false: lanza un Error
 * 
 * @internal
 * @returns {false} Si backtrack está habilitado
 * @throws {Error} Si se llama sin backtrack_lexer: "Lexical error on line..."
 * 
 * @see test_match - Llama a performAction que puede invocar reject()
 * @see more - Alternativa para continuar acumulando sin rechazar
 */
reject: function() { ... }
```

## 3. Patrón: Funciones que Procesan Tokens

```javascript
/**
 * Evalúa si un patrón coincide y procesa el token generado.
 * 
 * Flujo del método:
 * 1. Guarda estado si backtracking está habilitado
 * 2. Actualiza posiciones de línea/columna según saltos de línea
 * 3. Acumula el texto en yytext, match, matched
 * 4. Llama performAction() para ejecutar la acción de la regla
 * 5. Si performAction retorna false o reject() fue llamado:
 *    - Restaura el estado (en modo backtrack)
 *    - Retorna false para intentar la siguiente regla
 * 6. Si la acción retorna un token válido, lo retorna
 * 
 * @internal
 * @param {Array} match - Resultado regex: [fullMatch, group1, group2, ...]
 * @param {number} indexed_rule - Índice en this.rules[]
 * @returns {string|number|false} Token válido, false si rechazado, o falsy
 * 
 * @precondition this._input no está vacío
 * @postcondition this._input avanzó (slice de match[0])
 * @postcondition yytext, yyleng, yylloc actualizados
 * 
 * @see next - Llama a test_match en un bucle para cada regla
 * @see performAction - Ejecutado por test_match para procesar el token
 * @see reject - Puede ser llamado por performAction para rechazar
 */
test_match: function(match, indexed_rule) { ... }
```

## 4. Patrón: Funciones con Precondiciones y Postcondiciones

```javascript
/**
 * Consume y retorna un carácter de la entrada.
 * 
 * @internal
 * @param {void}
 * @returns {string} Un carácter (puede ser '\n', '\r\n', etc.)
 * 
 * @precondition  this._input.length > 0
 * @postcondition this._input.length disminuye en 1
 * @postcondition yylineno puede incrementar si ch es salto de línea
 * @postcondition yylloc.last_column aumenta (o last_line si es \n)
 * @postcondition yytext, yyleng, match, matched se actualizan
 * 
 * @throws {TypeError} Si this._input[0] es indefinido (input vacío)
 */
input: function() { ... }
```

## 5. Patrón: Funciones de Utilidad Pura

```javascript
/**
 * Muestra los últimos 20 caracteres procesados.
 * 
 * Útil para debugging y mensajes de error. Reemplaza saltos de línea
 * con espacios para una representación de una sola línea.
 * 
 * @internal
 * @returns {string} Máximo 20 caracteres del texto consumido
 * @returns {string} Prefijo "..." si había más de 20 caracteres antes
 * 
 * @example
 * // Si el lexer procesó "hello\nworld" y está en "test"
 * lexer.pastInput(); // Returns "hello world" (sin newline)
 * 
 * @pure Sin efectos secundarios sobre el estado del lexer
 * @see showPosition - Usa pastInput() para visualizar el error
 * @see upcomingInput - Complemento que muestra lo próximo
 */
pastInput: function() { ... }
```

## 6. Patrón: Miembros Privados vs Internos

```javascript
/**
 * Flag que indica si el lexer ha terminado (EOF alcanzado).
 * 
 * @internal
 * @private
 * @type {boolean}
 * @default false
 */
done: false,

/**
 * Buffer del flujo de entrada sin procesar.
 * 
 * Se actualiza continuamente por input() y unput() al procesar tokens.
 * 
 * @internal
 * @private
 * @type {string}
 * @default ""
 * 
 * @see input - Consume del _input
 * @see unput - Prepone al _input
 * @see test_match - Elimina match[0] del _input
 */
_input: "",

/**
 * Número de línea actual en la entrada (1-indexed).
 * 
 * Se actualiza automáticamente al detectar saltos de línea (\n, \r\n, \r).
 * 
 * @public
 * @type {number}
 * @default 0
 * 
 * @see yylloc.first_line - Ubicación completa del token actual
 */
yylineno: 0
```

## 7. Patrón: Métodos Que Retornan this

```javascript
/**
 * Señala al lexer que debe continuar acumulando.
 * 
 * @internal
 * @returns {Object} this - permite encadenamiento de métodos
 * 
 * @example
 * // En una acción de regla
 * { regex: /pattern/, action: function() { 
 *     this.more().yyleng++; // Encadenamiento
 *     return;
 * }}
 */
more: function() { ... }
```

## 8. Patrón: Miembros de Configuración

```javascript
/**
 * Opciones de comportamiento del lexer.
 * 
 * @internal
 * @type {LexerOptions}
 * @property {boolean} backtrack_lexer - Si true, habilita reject()
 * @property {boolean} flex - Si true, usa longest-match en lugar de first-match
 * @property {boolean} ranges - Si true, almacena range de bytes en yylloc
 * @property {boolean} case-insensitive - Si true, regexes serán case-insensitive
 * 
 * @example
 * lexer.options.backtrack_lexer = true;  // Habilitar backtracking
 * 
 * @default { backtrack_lexer: false, flex: false, ranges: false }
 */
options: { ... }
```

## 9. Patrón: Funciones de Configuración de Condiciones

```javascript
/**
 * Cambia a una nueva condición de inicio.
 * 
 * Las condiciones de inicio (start conditions) son como "modos" del lexer.
 * El lexer solo aplica reglas asociadas a la condición actual.
 * 
 * @internal
 * @param {string} condition - Nombre de la condición (ej: 'COMMENT', 'STRING')
 * @returns {Object} this
 * 
 * @throws {Error} Si la condición no está definida en startConditions
 * 
 * @example
 * // Regla que entra en modo STRING
 * { regex: /"/, action: function() {
 *     this.begin('STRING');
 *     return 'STRING_START';
 * }}
 * 
 * @see pushState - Alternativa que preserva el estado anterior
 * @see popState - Restaura a la condición anterior
 * @see _currentRules - Obtiene reglas para la condición actual
 */
begin: function(condition) { ... }
```

## 10. Patrón: Funciones Generadas Dinámicamente

```javascript
/**
 * Ejecuta la acción de la regla coincidente.
 * 
 * IMPORTANTE: Este método es generado dinámicamente por jison-lex.
 * El contenido es un switch statement generado a partir de las acciones
 * definidas en el archivo .l original.
 * 
 * @internal
 * @param {Object} yy - Contexto compartido (referencia al parser)
 * @param {Object} yy_ - Referencia al lexer actual (this)
 * @param {number} $avoiding_name_collisions - Índice de la regla
 * @param {string} YY_START - Condición de inicio actual
 * @returns {*} Lo que retorne la acción correspondiente
 * 
 * @generated Se genera en buildActions() en tiempo de compilación
 * @see prepareRules - Convierte las acciones originales en switch cases
 * 
 * @example
 * // Contenido generado (pseudo-código):
 * // switch($avoiding_name_collisions) {
 * //   case 0: return 'NUMBER';     // Primera regla
 * //   case 1: return 'PLUS';       // Segunda regla
 * //   case 2: return;              // Tercera regla (no retorna)
 * // }
 */
performAction: function(yy, yy_, $avoiding_name_collisions, YY_START) { ... }
```

## 11. Patrón: Parámetros Complejos

```javascript
/**
 * Restaura un estado previo del lexer (usado internamente por reject).
 * 
 * @internal
 * @param {LexerBackupState} backup - Objeto con todas las propiedades del estado
 * @param {number} backup.yylineno
 * @param {Object} backup.yylloc
 * @param {number} backup.yylloc.first_line
 * @param {number} backup.yylloc.last_line
 * @param {number} backup.yylloc.first_column
 * @param {number} backup.yylloc.last_column
 * @param {number[]} [backup.yylloc.range]
 * @param {string} backup.yytext
 * @param {string} backup.match
 * @param {Array} backup.matches
 * @param {string} backup.matched
 * @param {number} backup.yyleng
 * @param {number} backup.offset
 * @param {boolean} backup._more
 * @param {string} backup._input
 * @param {Object} backup.yy
 * @param {string[]} backup.conditionStack
 * @param {boolean} backup.done
 * 
 * @returns {void}
 * 
 * @private Uso interno, llamado solo desde test_match
 */
function restoreState(backup) { ... }
```

## Comparación: Antes vs Después

### ❌ ANTES (sin JSDoc)

```javascript
// test the lexed token: return FALSE when not a match, otherwise return token
test_match:function(match, indexed_rule) {
    var token, lines, backup;
    // ... 50 líneas de código ...
}
```

**Problemas:**
- IDE no ofrece autocomplete de parámetros
- No hay información de tipos
- El comentario de línea es muy vago
- Genera warnings en JSDoc tools
- Difícil entender qué retorna

### ✅ DESPUÉS (con JSDoc)

```javascript
/**
 * Evalúa si un patrón coincide con la entrada y procesa el token.
 * Este es el método nuclear del análisis léxico.
 * 
 * @internal
 * @param {Array} match - Resultado del regex match [fullMatch, group1, ...]
 * @param {number} indexed_rule - Índice de la regla
 * @returns {string|number|false} Token válido, false si rechazado
 * @throws {Error} Si se llama reject() sin backtrack habilitado
 * 
 * @see test_match - Documentación detallada con flujo paso a paso
 */
test_match:function(match, indexed_rule) {
    var token, lines, backup;
    // ... 50 líneas de código ...
}
```

**Mejoras:**
- IDE muestra tipos esperados
- Herramientas generan documentación automática
- Parámetros y retornos claros
- Developers entienden rápidamente qué hace

## Checklist para Documentar Funciones Internas

```markdown
- [ ] ¿Tiene etiqueta @internal o @private?
- [ ] ¿Están documentados todos los parámetros con tipos?
- [ ] ¿Está documentado el valor de retorno?
- [ ] ¿Se mencionan excepciones posibles (@throws)?
- [ ] ¿Se explica el propósito en la descripción principal?
- [ ] ¿Se incluye un @example si no es obvio el uso?
- [ ] ¿Se referencian métodos relacionados con @see?
- [ ] ¿Se documentan efectos secundarios importantes?
- [ ] ¿Se mencionan precondiciones/postcondiciones si aplican?
```

## Generación de Documentación

### Con JSDoc estándar

```bash
jsdoc index.js examples/more/lexer.js --destination ./docs --private
```

### Con configuración personalizada

```json
// jsdoc.json
{
  "source": {
    "include": ["index.js"],
    "includePattern": ".+\\.js(doc)?$"
  },
  "opts": {
    "destination": "./docs",
    "private": true,
    "access": "all"
  }
}
```

```bash
jsdoc -c jsdoc.json
```

## Verificación de Calidad

```bash
# Verificar que todos los @internal estén documentados
grep -n "@internal" lexer.js | wc -l

# Verificar que haya descripción después de /**
grep -A1 "^/\*\*$" lexer.js | grep -v "^--$" | grep -v "^/\*\*$"

# Buscar métodos sin JSDoc
grep -E "^\s+\w+:\s*function" lexer.js | \
  grep -v -B1 "^/\*\*" | grep "function"
```
