# 📚 Guía de Uso: Etiquetas de Dificultad en Preguntas GIFT

## 🎯 Descripción

El sistema ahora soporta **etiquetas manuales de dificultad** en archivos GIFT, permitiéndote especificar el nivel exacto de cada pregunta.

---

## ✅ Formatos Soportados

### Etiquetas en Español

```gift
# NIVEL FACIL
Pregunta aquí {...}

# NIVEL MEDIO
Pregunta aquí {...}

# NIVEL DIFICIL
Pregunta aquí {...}
```

### Etiquetas en Español con Tilde

```gift
# NIVEL FÁCIL
Pregunta aquí {...}

# NIVEL DIFÍCIL
Pregunta aquí {...}
```

### Etiquetas en Inglés

```gift
# EASY
Pregunta aquí {...}

# MEDIUM
Pregunta aquí {...}

# HARD
Pregunta aquí {...}
```

### Formato Compacto (sin "NIVEL")

```gift
# FACIL
Pregunta aquí {...}

# MEDIO
Pregunta aquí {...}

# DIFICIL
Pregunta aquí {...}
```

---

## 📝 Ejemplo Completo

```gift
# NIVEL FACIL
<b>Constitución Española</b><br><br>
Introducción. ¿Cuándo fue sancionada la Constitución por S.M. el Rey? {
=El 27 de diciembre de 1978.
~%-33.33333%El 29 de diciembre de 1978.
~%-33.33333%El 06 de diciembre de 1978.
~%-33.33333%El 31 de octubre de 1978.
#### RETROALIMENTACIÓN:<br><br>
<b>Introducción</b><br>
"Sancionada por S.M el Rey ante las Cortes el <b>27 de Diciembre de 1978</b>"<br><br>
La sanción real tuvo lugar el 27 de diciembre.
}

# NIVEL MEDIO
<b>Constitución Española</b><br><br>
Título Preliminar. Según el artículo 2 de la Constitución, ¿en qué se fundamenta la indisoluble unidad de la Nación española? {
=En la solidaridad entre todas sus nacionalidades y regiones.
~%-33.33333%En la soberanía popular.
~%-33.33333%En la monarquía parlamentaria.
~%-33.33333%En el Estado de Derecho.
#### RETROALIMENTACIÓN:<br><br>
<b>Artículo 2 CE</b><br>
"La Constitución se fundamenta en la indisoluble unidad de la Nación española..."
}

# NIVEL DIFICIL
<b>Constitución Española</b><br><br>
Título Preliminar. ¿Cuál de las siguientes afirmaciones sobre el artículo 9.3 de la Constitución NO es correcta? {
=La Constitución garantiza la irretroactividad de todas las disposiciones sancionadoras.
~%-33.33333%La Constitución garantiza la irretroactividad de las disposiciones sancionadoras no favorables.
~%-33.33333%La Constitución garantiza la irretroactividad de las disposiciones restrictivas de derechos individuales.
~%-33.33333%La Constitución garantiza la publicidad de las normas.
#### RETROALIMENTACIÓN:<br><br>
<b>Artículo 9.3 CE</b><br>
El artículo 9.3 garantiza la irretroactividad de las disposiciones sancionadoras <b>no favorables</b>...
}
```

---

## 🔄 Sistema de Fallback

### ¿Qué pasa si no pongo etiqueta?

Si una pregunta **no tiene etiqueta**, el sistema usará **detección automática mejorada** que considera:

1. **Tipo de pregunta**:
   - Memoria/datos → FÁCIL
   - Definiciones → FÁCIL
   - Aplicación → MEDIO
   - Análisis/síntesis → DIFÍCIL

2. **Negaciones**: "NO es", "incorrecta", "excepción" → +DIFÍCIL

3. **Longitud**:
   - Preguntas cortas (< 10 palabras) → -FÁCIL
   - Preguntas largas (> 30 palabras) → +DIFÍCIL

4. **Opciones**:
   - Muchas opciones (≥ 5) → +DIFÍCIL
   - Opciones largas → +DIFÍCIL

5. **Vocabulario técnico/legal** → +DIFÍCIL

6. **Referencias legales específicas** → +DIFÍCIL

### Ejemplo sin etiqueta:

```gift
<b>Constitución Española</b><br><br>
Título I. ¿Qué artículo de la Constitución reconoce el derecho a la educación? {
=Artículo 27.
~%-33.33333%Artículo 26.
~%-33.33333%Artículo 28.
~%-33.33333%Artículo 25.
#### RETROALIMENTACIÓN:<br><br>
El <b>artículo 27</b> de la Constitución reconoce el derecho a la educación.
}
```

**Resultado**: Se clasificará automáticamente (probablemente FÁCIL por ser pregunta de memoria).

---

## 📊 Ventajas del Sistema Manual

| Aspecto | Manual (con etiqueta) | Automático (sin etiqueta) |
|---------|----------------------|---------------------------|
| **Precisión** | 100% ✅ | 75-80% |
| **Control** | Total ✅ | Ninguno |
| **Esfuerzo** | Añadir etiqueta | Ninguno |
| **Flexibilidad** | Puedes ajustar | Fijo |

---

## 🎓 Criterios para Clasificar

### 🟢 NIVEL FÁCIL

Preguntas que requieren **memoria simple** o **datos básicos**:

- ✅ Fechas específicas ("¿En qué año...?")
- ✅ Nombres ("¿Quién fue...?")
- ✅ Definiciones directas ("¿Qué es...?")
- ✅ Datos concretos sin análisis

**Ejemplos**:
- "¿Cuándo fue aprobada la Constitución?"
- "¿Quién es el Jefe del Estado?"
- "¿Qué es la soberanía nacional?"

---

### 🟡 NIVEL MEDIO

Preguntas que requieren **comprensión** y **aplicación**:

- ✅ Interpretación de artículos
- ✅ Relaciones entre conceptos
- ✅ Aplicación de normas a casos
- ✅ Comparaciones simples

**Ejemplos**:
- "Según el artículo X, ¿qué derechos...?"
- "¿Cuál es la relación entre...?"
- "De acuerdo con la ley, ¿cómo se procede...?"

---

### 🔴 NIVEL DIFÍCIL

Preguntas que requieren **análisis**, **síntesis** o **evaluación**:

- ✅ Negaciones ("¿Cuál NO es...?")
- ✅ Excepciones ("Todas excepto...")
- ✅ Análisis de casos complejos
- ✅ Comparaciones múltiples
- ✅ Opciones muy similares
- ✅ Conocimiento técnico profundo

**Ejemplos**:
- "¿Cuál de las siguientes afirmaciones NO es correcta...?"
- "Todas las siguientes son correctas EXCEPTO..."
- "Analiza y determina cuál..."
- "¿Qué diferencia existe entre...?"

---

## 🔍 Verificación

### Ver qué nivel se asignó

Cuando importes preguntas, el sistema mostrará en los logs:

```
📌 Etiqueta de dificultad detectada: EASY
✅ Dificultad manual: EASY

📌 Etiqueta de dificultad detectada: MEDIUM
✅ Dificultad manual: MEDIUM

🤖 Dificultad automática: MEDIUM  ← Sin etiqueta
```

---

## ⚠️ Notas Importantes

1. **Case Insensitive**: Las etiquetas no distinguen mayúsculas/minúsculas
   - `# NIVEL FACIL` = `# nivel facil` = `# Nivel Facil`

2. **Espacios**: Se ignoran espacios extras
   - `#NIVEL FACIL` = `# NIVEL FACIL` = `#  NIVEL  FACIL`

3. **Una etiqueta por pregunta**: La etiqueta se aplica a la pregunta inmediatamente siguiente

4. **Etiqueta antes de la pregunta**: La etiqueta debe estar **antes** del texto de la pregunta

5. **Línea independiente**: La etiqueta debe estar en su propia línea

---

## 🚀 Mejores Prácticas

### ✅ Recomendado

```gift
# NIVEL FACIL
Pregunta fácil {...}

# NIVEL MEDIO
Pregunta media {...}
```

### ❌ No Recomendado

```gift
# NIVEL FACIL Pregunta fácil {...}  ← Etiqueta y pregunta en misma línea
```

```gift
Pregunta sin etiqueta {...}
# NIVEL FACIL  ← Etiqueta después de la pregunta (no funciona)
```

---

## 📈 Estadísticas de Importación

Después de importar, verás estadísticas como:

```
📊 Estadísticas:
   Total preguntas: 100
   Con etiqueta manual: 85 (85.0%)
   Detección automática: 15 (15.0%)

   Nivel FÁCIL: 30 (30.0%)
   Nivel MEDIO: 45 (45.0%)
   Nivel DIFÍCIL: 25 (25.0%)
```

---

## 🔧 Migración de Archivos Antiguos

Si tienes archivos GIFT antiguos sin etiquetas:

### Opción 1: Añadir etiquetas gradualmente
- Importa como está (usará detección automática)
- Revisa las preguntas en la aplicación
- Añade etiquetas a las que necesiten corrección
- Reimporta

### Opción 2: Añadir etiquetas masivamente
- Usa un editor de texto con búsqueda/reemplazo
- Busca patrones comunes
- Añade etiquetas en bloque

**Ejemplo de búsqueda/reemplazo**:
- Buscar: `¿En qué año`
- Reemplazar: `# NIVEL FACIL\n¿En qué año`

---

## 💡 Consejos

1. **Sé consistente**: Usa siempre el mismo formato de etiqueta
2. **Revisa estadísticas**: Asegúrate de tener distribución balanceada
3. **Feedback de usuarios**: Ajusta niveles según rendimiento real
4. **Documenta criterios**: Mantén una guía de qué hace cada nivel difícil

---

## 🆘 Solución de Problemas

### La etiqueta no se detecta

**Problema**: La pregunta se clasifica como automática aunque tiene etiqueta

**Soluciones**:
1. Verifica que la etiqueta esté en una línea separada
2. Revisa que no haya caracteres extra antes del `#`
3. Asegúrate de usar un formato válido (ver lista arriba)
4. Verifica que la etiqueta esté **antes** de la pregunta

### Todas las preguntas son MEDIUM

**Problema**: El sistema automático clasifica todo como MEDIUM

**Solución**: Añade etiquetas manuales a tus preguntas

---

## 📞 Soporte

Si tienes dudas o encuentras problemas:
1. Revisa esta guía
2. Verifica el archivo de ejemplo: `ejemplo_preguntas_con_niveles.gift`
3. Ejecuta el script de prueba: `npm run test-difficulty`

---

## 🎉 ¡Listo!

Ahora puedes clasificar tus preguntas con precisión total. El sistema es flexible:
- ✅ Usa etiquetas donde necesites control exacto
- ✅ Deja sin etiqueta donde la detección automática sea suficiente
- ✅ Combina ambos enfoques según tus necesidades

**¡Feliz importación de preguntas!** 🚀
