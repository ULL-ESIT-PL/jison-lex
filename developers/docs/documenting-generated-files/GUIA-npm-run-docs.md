# 📚 Guía: Cómo usar `npm run docs` para agregar JSDoc automáticamente

## 🎯 ¿Qué hace ahora?

Cuando ejecutas `npm run docs`, el sistema **automáticamente**:

1. **Analiza** `examples/more/lexer.js`
2. **Agrega JSDoc** a todas las funciones internas del lexer
3. **Genera** la documentación HTML en `./docs/`

## 🚀 Uso

### Comando principal (recomendado)
```bash
npm run docs
```

Esto ejecuta:
- `developers/scripts/generate-docs-with-jsdoc.js`
  - Paso 1: `add-jsdoc-to-lexer.js` agrega JSDoc automáticamente
  - Paso 2: `jsdoc -c jsdoc.json` genera HTML

### Comando alternativo (sin agregar JSDoc)
```bash
npm run docs:quick
```

Genera documentación **solo** con JSDoc existente (sin agregar automáticamente)

### Ver documentación en navegador
```bash
npm run docs:serve
```

Abre la documentación en http://localhost:8080

---

## 📊 Comparación: Antes vs Después

### ANTES ❌
```
npm run docs
└─ jsdoc -c jsdoc.json
   └─ Procesa lexer.js SIN comentarios JSDoc
      └─ Documentación incompleta
```

### AHORA ✅
```
npm run docs
└─ node developers/scripts/generate-docs-with-jsdoc.js
   ├─ Paso 1: add-jsdoc-to-lexer.js examples/more/lexer.js
   │  └─ Agrega JSDoc automáticamente
   │
   └─ Paso 2: jsdoc -c jsdoc.json
      └─ Genera documentación COMPLETA
```

---

## 🔧 Componentes

### 1. `developers/docs/documenting-generated-files/add-jsdoc-to-lexer.js`
- **Qué hace**: Lee un archivo .js y agrega comentarios JSDoc
- **Entrada**: Ruta a archivo (ej: `examples/more/lexer.js`)
- **Salida**: Archivo modificado con JSDoc agregado
- **Uso manual**:
  ```bash
  node developers/docs/documenting-generated-files/add-jsdoc-to-lexer.js examples/more/lexer.js
  ```

### 2. `developers/scripts/generate-docs-with-jsdoc.js`
- **Qué hace**: Orquesta el flujo completo
- **Pasos**:
  1. Llama a `add-jsdoc-to-lexer.js` con `examples/more/lexer.js`
  2. Llama a `jsdoc -c jsdoc.json` para generar HTML
- **Salida**: Documentación en `./docs/`

### 3. `jsdoc.json` (actualizado)
Configuración para JSDoc:
```json
{
  "source": {
    "include": [
      "index.js",
      "cli.js",
      "examples/more/lexer.js"  ← Incluido para documentación
    ]
  },
  "opts": {
    "destination": "./docs"
  }
}
```

---

## 🎓 Funciones que se documentan automáticamente

El script `add-jsdoc-to-lexer.js` agrega JSDoc para:

**Funciones Críticas (Alto Prioridad)**
- ✅ `test_match()` - Verifica si el lexer puede procesar más caracteres
- ✅ `lex()` - Genera el siguiente token
- ✅ `setInput()` - Configura la entrada del lexer

**Funciones Importantes (Prioridad Media)**
- ✅ `begin()` - Cambiar condición léxica
- ✅ `popState()` - Restaurar estado anterior
- ✅ `pushState()` - Guardar estado actual
- ✅ `showPosition()` - Mostrar posición en la entrada

**Funciones Auxiliares (Prioridad Baja)**
- ✅ `less()` - Devolver caracteres al buffer
- ✅ `more()` - Pedir más entrada
- ✅ `pastInput()` - Obtener texto procesado
- ✅ `upcomingInput()` - Obtener texto no procesado
- ✅ `matched()` - Obtener texto coincidido

---

## 📋 Ejemplo de salida

Cuando ejecutas `npm run docs`, verás algo como:

```
📚 Generando documentación...

Paso 1️⃣: Agregando JSDoc a examples/more/lexer.js...
  ✓ test_match: agregado JSDoc
  ✓ lex: agregado JSDoc
  ✓ setInput: agregado JSDoc
  ⊘ begin: no encontrado o ya documentado
  ...

✅ Paso 1 completado

Paso 2️⃣: Generando documentación HTML...
  jsdoc -c jsdoc.json
  ...

✅ Paso 2 completado

📖 ¡Documentación generada exitosamente!
   Puedes verla en: ./docs/index.html
   O ejecutar: npm run docs:serve
```

---

## 🐛 Solución de problemas

### Problema: El script no ejecuta
**Solución**: Verifica que el archivo sea ejecutable:
```bash
chmod +x developers/scripts/generate-docs-with-jsdoc.js
```

### Problema: "file not found" para add-jsdoc-to-lexer.js
**Solución**: Verifica que el archivo existe:
```bash
ls developers/docs/documenting-generated-files/add-jsdoc-to-lexer.js
```

### Problema: JSDoc no está instalado
**Solución**: Instala las dependencias:
```bash
npm install
```

### Problema: Error "Unterminated group" en regexp
**Solución**: Ya fue solucionado. Verifica que tu archivo tiene:
```javascript
const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const escapedName = escapeRegex(functionName);
const pattern1 = new RegExp(
    `\\/\\/ [^\\n]+\\n(\\s*${escapedName}:\\s*function\\s*\\())`,
    'g'
);
```

---

## 📝 Notas importantes

1. **El script modifica el archivo** `examples/more/lexer.js` agregando comentarios JSDoc
2. **Los cambios se guardan permanentemente** en el archivo
3. **Si regeneras el lexer**, deberás ejecutar nuevamente `npm run docs` para re-agregar JSDoc
4. **Usa `npm run docs:quick`** si solo necesitas generar documentación sin agregar JSDoc

---

## 🔄 Flujo recomendado

1. **Después de generar lexer.js** (con `jison`):
   ```bash
   npm run docs
   ```
   Esto automáticamente agrega JSDoc y genera documentación

2. **Para ver la documentación**:
   ```bash
   npm run docs:serve
   # Abre http://localhost:8080
   ```

3. **Si necesitas regenerar el lexer**:
   ```bash
   npm run grammar
   npm run docs  # Re-agregar JSDoc
   ```

---

## ✅ Checklist de validación

- [x] Script `generate-docs-with-jsdoc.js` creado
- [x] `package.json` actualizado con `npm run docs`
- [x] `npm run docs:quick` disponible como alternativa
- [x] Función `escapeRegex()` agregada a `add-jsdoc-to-lexer.js`
- [x] Regexes correctamente cerradas
- [x] `examples/more/lexer.js` incluido en `jsdoc.json`

---

¡Listo para usar! 🚀
