# Tutorial Paso a Paso: Documentar test_match() con JSDoc

Este tutorial te guiará a través del proceso exacto de documentar la función `test_match()` del lexer generado.

## Paso 1: Entender la Función

Primero, lee cuidadosamente el código de `test_match()` en [examples/more/lexer.js](../examples/more/lexer.js#L143):

```javascript
test_match:function(match, indexed_rule) {
    var token,
        lines,
        backup;

    if (this.options.backtrack_lexer) {
        // save context
        backup = {
            yylineno: this.yylineno,
            yylloc: {
                first_line: this.yylloc.first_line,
                last_line: this.last_line,
                first_column: this.yylloc.first_column,
                last_column: this.yylloc.last_column
            },
            // ... más propiedades
        };
    }

    // ... procesamiento ...
    
    token = this.performAction.call(this, this.yy, this, indexed_rule, ...);
    
    if (token) {
        return token;
    } else if (this._backtrack) {
        for (var k in backup) {
            this[k] = backup[k];
        }
        return false;
    }
    return false;
}
```

**Preguntas clave:**
- ¿Cuáles son los parámetros? (`match`, `indexed_rule`)
- ¿Qué es cada parámetro? (Array, number)
- ¿Qué retorna? (token o false)
- ¿Qué excepciones puede lanzar? (ninguna directa)
- ¿Cuáles son los efectos secundarios? (modifica estado)

## Paso 2: Escribir la Descripción Principal

Comienza con una frase clara que explique QUÉ hace:

```javascript
/**
 * Evalúa si un patrón coincide con la entrada y procesa el token generado.
```

Luego agrega contexto CUÁNDO y POR QUÉ:

```javascript
/**
 * Evalúa si un patrón coincide con la entrada y procesa el token generado.
 * 
 * Este es el método nuclear del análisis léxico. Cuando el lexer intenta hacer
 * coincidir un patrón regex con la entrada, este método:
 * 1. Guarda el estado actual (si backtracking está habilitado)
 * 2. Actualiza las posiciones de línea y columna
 * 3. Acumula el texto coincidente en las variables del lexer
 * 4. Llama a performAction() para ejecutar la acción de la regla
 * 5. Maneja backtracking si la acción rechaza el match
```

## Paso 3: Documentar Parámetros

Para cada parámetro, especifica el tipo y una descripción clara:

```javascript
 * @param {Array} match - Resultado del regex match
 *                       match[0] = texto completo coincidente
 *                       match[1...n] = grupos de captura opcionales
 * @param {number} indexed_rule - Índice de la regla de lexing en rules[]
```

**Notas:**
- Usa tipos entre `{llaves}`
- Si es complejo (Array, Object), explica su estructura
- Si tiene subtipo, úsalo: `{Object<string, number>}`

## Paso 4: Documentar el Retorno

Especifica todos los valores posibles:

```javascript
 * @returns {string|number|false} Retorna:
 *                                - Token válido (string o número)
 *                                - false si la regla rechazó el match
 *                                - undefined/null si consumió input sin token
```

**Notas:**
- Usa `|` para múltiples tipos posibles
- Explica QUÉ significa cada retorno
- El último elemento puede ser falsy: `false`, `undefined`, `null`

## Paso 5: Documentar Excepciones (si aplican)

```javascript
 * @throws {Error} Si se llama reject() fuera del modo backtrack_lexer
```

**Nota:** `test_match()` no lanza excepciones directamente, pero la acción podría.

## Paso 6: Adicionar Ejemplos

Incluye un ejemplo de uso interno:

```javascript
 * @example
 * // Uso interno en el método next()
 * const match = this._input.match(this.rules[0]);
 * if (match) {
 *     const token = this.test_match(match, 0);
 *     if (token !== false) {
 *         return token;  // Token válido
 *     }
 *     // Si es false, intenta con la siguiente regla
 * }
```

## Paso 7: Referenciar Métodos Relacionados

```javascript
 * @see next - Llama a test_match en un bucle para cada regla
 * @see performAction - Ejecutado por test_match para procesar el token
 * @see reject - Puede ser llamado por performAction para rechazar
```

## Paso 8: Marcar como Interno

```javascript
 * @internal
```

**Nota:** Esto indica que no es parte de la API pública.

## Resultado Final

El comentario completo quedaría así:

```javascript
/**
 * Evalúa si un patrón coincide con la entrada y procesa el token generado.
 * 
 * Este es el método nuclear del análisis léxico. Cuando el lexer intenta hacer
 * coincidir un patrón regex con la entrada, este método:
 * 1. Guarda el estado actual (si backtracking está habilitado)
 * 2. Actualiza las posiciones de línea y columna según saltos de línea
 * 3. Acumula el texto coincidente en yytext, match, matched
 * 4. Llama a performAction() para ejecutar la acción de la regla
 * 5. Maneja backtracking: si reject() fue llamado, restaura el estado
 * 6. Retorna el token generado o false si fue rechazado
 * 
 * El valor retornado determina:
 * - Token válido (string o número) → se retorna al parser
 * - false → la regla rechazó el match, se intenta la siguiente
 * - undefined/falsy → el token fue consumido sin valor (ej: espacios)
 * 
 * @internal
 * @param {Array} match - Resultado del regex match
 *                       match[0] = texto completo coincidente
 *                       match[1...n] = grupos de captura opcionales
 * @param {number} indexed_rule - Índice de la regla en el array rules[]
 * @returns {string|number|false} 
 *          - string o number: token a retornar al parser
 *          - false: coincidencia rechazada (backtrack), intenta siguiente regla
 *          - undefined/null/falsy: input consumido sin token
 * 
 * @throws {Error} Si performAction llama reject() sin backtrack habilitado
 * 
 * @example
 * // Uso interno en el método next()
 * const match = this._input.match(this.rules[0]);
 * if (match) {
 *     const token = this.test_match(match, 0);
 *     if (token !== false) {
 *         return token;  // Token válido
 *     }
 *     // Si es false, intenta con la siguiente regla
 * }
 * 
 * @see next - Llama a test_match en un bucle para cada regla
 * @see performAction - Ejecutado por test_match para procesar el token
 * @see reject - Puede ser llamado por performAction para rechazar
 */
test_match: function(match, indexed_rule) {
    // ... implementación sin cambios ...
}
```

## Paso 9: Verificar la Documentación

### Con JSDoc estándar

```bash
# Generar documentación HTML
jsdoc examples/more/lexer.js --destination ./docs --private

# Abrir en navegador
open docs/lexer.html
```

### Verificar sintaxis

```bash
# Buscar errores de JSDoc
jsdoc -c jsdoc.json --verbose
```

### Con un verificador

```bash
# Instalar verificador de JSDoc
npm install --save-dev jsdoc-to-markdown

# Generar documento Markdown
jsdoc2md examples/more/lexer.js > API.md
```

## Paso 10: Iterar y Mejorar

Después de generar la documentación, verifica:

1. **¿Aparece `test_match()` en la documentación?**
   - Si no, verifica la sintaxis de JSDoc
   - Asegúrate de que `@internal` esté bien formateado

2. **¿Se ven todos los parámetros?**
   - Verifica que `@param` tenga tipo entre `{}`

3. **¿Se entiende el retorno?**
   - ¿Es claro cuándo retorna qué valor?

4. **¿El ejemplo es útil?**
   - ¿Muestra claramente cómo se usa?

5. **¿Faltan referencias?**
   - ¿Faltan `@see` para métodos relacionados?

## Checklist de Finalización

- [ ] Descripción principal clara y concisa
- [ ] Todos los parámetros documentados con tipos
- [ ] Retorno documentado con todos los valores posibles
- [ ] Excepciones listadas (si aplican)
- [ ] Ejemplo incluido y correcto
- [ ] Referencias cruzadas con `@see`
- [ ] Etiqueta `@internal` presente
- [ ] Documentación HTML se genera sin errores
- [ ] Documentación es legible en HTML
- [ ] Alguien más podría entender el código con solo leer el JSDoc

## Automatización: Usar el Script

Si tienes múltiples funciones que documentar, usa el script automatizado:

```bash
# Descargar/usar el script
node add-jsdoc-to-lexer.js examples/more/lexer.js

# Generar tipos también
node add-jsdoc-to-lexer.js examples/more/lexer.js --generate-types

# Verá resumen de cambios
# 📄 Procesando: examples/more/lexer.js
#   ✓ test_match: agregado JSDoc
#   ✓ next: agregado JSDoc
#   ...
# ✅ Archivo actualizado: examples/more/lexer.js
#    12 función(es) documentada(s)
```

## Próximos Pasos

Después de documentar `test_match()`, documenta también:

1. `next()` - Obtiene el siguiente token
2. `setInput()` - Reinicia el lexer
3. `input()` - Consume 1 carácter
4. `performAction()` - Ejecuta la acción generada
5. Otras funciones internas (ver lista en la guía principal)

## Recursos Adicionales

- [JSDoc Manual Oficial](https://jsdoc.app/)
- [JSDoc @internal](https://jsdoc.app/tags-internal.html)
- [JSDoc @param](https://jsdoc.app/tags-param.html)
- [JSDoc @returns](https://jsdoc.app/tags-returns.html)
- [jison-lex README](../README.md)

## Troubleshooting

### Problema: JSDoc no reconoce las etiquetas

**Solución:** Verifica la sintaxis:
```javascript
// ❌ Incorrecto
/* @internal */

// ✅ Correcto
/**
 * @internal
 */
```

### Problema: Las funciones no aparecen en la documentación

**Solución:** Verifica que `jsdoc.json` incluya el archivo:
```json
{
  "source": {
    "include": ["examples/more/lexer.js"]  // ← Asegúrate de esto
  }
}
```

### Problema: JSDoc generado parece truncado

**Solución:** Aumenta el límite en el script o regenera:
```bash
jsdoc -c jsdoc.json --verbose
```

## Conclusión

¡Felicidades! Ahora sabes cómo documentar las funciones internas complejas de un lexer generado con JSDoc. El proceso es:

1. **Entender** la función leyendo el código
2. **Describir** qué hace en lenguaje natural
3. **Documentar** parámetros, retornos, excepciones
4. **Ejemplificar** con código real de uso
5. **Referenciar** métodos relacionados
6. **Marcar** como `@internal`
7. **Verificar** que la documentación HTML se genere correctamente

Ahora puedes repetir este proceso para las otras 10+ funciones internas del lexer.
