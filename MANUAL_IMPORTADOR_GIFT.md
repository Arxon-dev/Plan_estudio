# 📚 Manual del Importador de Preguntas GIFT

## 🔐 Datos de Acceso Administrador

- **Email**: carlos.opomelilla@gmail.com
- **Contraseña**: Tu contraseña personal
- **Nombre**: Carlos OpoMelilla
- **ID**: 35

---

## 🎯 Acceso al Importador

1. Inicia sesión con tu cuenta de administrador en: http://localhost:5174/login
2. Navega al panel de administración: http://localhost:5174/admin
3. Haz clic en el botón **"📚 Importar Preguntas GIFT"**
4. Serás redirigido a: http://localhost:5174/admin/import-questions

---

## 📋 Modos de Importación

### **Opción 1: Un Solo Tema**
Usa este modo cuando todas las preguntas del archivo pertenecen al mismo tema.

**Ejemplo**: Archivo `Constitucion.gift` con 8 preguntas del Tema 1.

**Pasos**:
1. Selecciona "Un solo tema"
2. Ingresa el **ID del tema** (ver tabla abajo)
3. Configura opciones:
   - ✅ **Saltar duplicados**: No importar preguntas que ya existen
   - ⚠️ **Sobrescribir existentes**: Reemplazar preguntas duplicadas (usar con precaución)
4. Sube el archivo `.gift`
5. Haz clic en **"👁️ Vista Previa"** (opcional) o **"💾 Importar Ahora"**

---

### **Opción 2: Preguntas Mixtas (Simulacros)**
Usa este modo cuando el archivo tiene preguntas de múltiples temas mezcladas.

**Ejemplo**: Archivo `Simulacro_General.gift` con preguntas de varios temas.

**Cómo funciona**:
- El sistema detecta automáticamente el tema de cada pregunta basándose en los **tags** (texto en negrita `<b>...</b>`)
- Busca coincidencias con los temas en la base de datos
- Asigna cada pregunta al tema correspondiente

**Pasos**:
1. Selecciona "Preguntas mixtas (simulacros)"
2. Sube el archivo `.gift`
3. Haz clic en **"👁️ Vista Previa"** o **"💾 Importar Ahora"**

**Requisito**: Las preguntas deben incluir tags que identifiquen el tema, por ejemplo:
```gift
<b>Tema 1. Constitución Española</b><br><br>
¿Pregunta aquí? { ... }
```

---

## 🆔 IDs de Temas Disponibles

### **BLOQUE: ORGANIZACIÓN**

| ID | Tema | Título |
|----|------|--------|
| 1 | Tema 1 | Constitución Española de 1978. Títulos III, IV, V, VI y VIII |
| 2 | Tema 2 | Ley Orgánica 5/2005, de la Defensa Nacional |
| 3 | Tema 3 | Ley 40/2015, de Régimen Jurídico del Sector Público |
| 4 | Tema 4 | Real Decreto 205/2024, Ministerio de Defensa |
| 5 | Tema 5 | Real Decreto 521/2020, Organización Básica de las Fuerzas Armadas |
| 6 | Tema 6 | Instrucciones EMAD, ET, ARMADA y EA |

### **BLOQUE: JURÍDICO SOCIAL**

| ID | Tema | Título |
|----|------|--------|
| 7 | Tema 1 | Ley 8/2006, Tropa y Marinería / Ley 39/2007 de la Carrera Militar |
| 8 | Tema 2 | Real Decreto 96/2009, Reales Ordenanzas para las Fuerzas Armadas |
| 9 | Tema 3 | Ley Orgánica 9/2011, Derechos y Deberes FAS |
| 10 | Tema 4 | Ley Orgánica 8/2014, Régimen Disciplinario de las Fuerzas Armadas |
| 11 | Tema 5 | Real Decreto 176/2014, Iniciativas y Quejas |
| 12 | Tema 6 | Ley Orgánica 3/2007, igualdad efectiva entre mujeres y hombres |
| 13 | Tema 7 | Observatorio militar para la igualdad entre mujeres y hombres en las Fuerzas Armadas |
| 14 | Tema 8 | Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas |

### **BLOQUE: SEGURIDAD NACIONAL**

| ID | Tema | Título |
|----|------|--------|
| 15 | Tema 1 | Ley 36/2015, Seguridad Nacional / RD 1150/2021, Estrategia de Seguridad Nacional 2021 |
| 16 | Tema 2 | PDC-01(B) Doctrina para el empleo de las FAS |
| 17 | Tema 3 | Organización de las Naciones Unidas (ONU) |
| 18 | Tema 4 | Organización del Tratado del Atlántico Norte (OTAN) |
| 19 | Tema 5 | Organización para la Seguridad y Cooperación en Europa (OSCE) |
| 20 | Tema 6 | Unión Europea (UE) |
| 21 | Tema 7 | España y su participación en Misiones Internacionales |

---

## 📝 Formato GIFT Soportado

### **Estructura Básica**
```gift
<b>Categoría o Tema</b><br><br>
¿Texto de la pregunta? {
=Respuesta correcta
~%-33.33333%Respuesta incorrecta 1
~%-33.33333%Respuesta incorrecta 2
~%-33.33333%Respuesta incorrecta 3
#### RETROALIMENTACIÓN:<br><br>
<b>Título de explicación</b><br>
Texto de la explicación detallada
}
```

### **Elementos del Formato**

- **`<b>...</b>`**: Texto en negrita (usado para tags y categorías)
- **`<br>`**: Salto de línea
- **`=`**: Marca la respuesta correcta
- **`~`**: Marca respuestas incorrectas
- **`~%-XX%`**: Ponderación negativa (se ignora, solo se usa para identificar incorrectas)
- **`####`**: Inicia la retroalimentación/explicación

### **Ejemplo Completo**
```gift
<b>Constitución Española</b><br><br>
Introducción. ¿En qué fecha fue ratificada la Constitución por el pueblo español en referéndum? {
=El 6 de diciembre de 1978.
~%-33.33333%El 31 de octubre de 1978.
~%-33.33333%El 27 de diciembre de 1978.
~%-33.33333%El 29 de diciembre de 1978.
#### RETROALIMENTACIÓN:<br><br>
<b>Introducción</b><br>
"Ratificada por el pueblo español en referéndum de <b>6 de Diciembre de 1978</b>"<br><br>
La fecha del referéndum es el 6 de diciembre. El 31 de octubre fue aprobada por las Cortes.
}
```

---

## ✅ Validaciones Automáticas

El sistema realiza las siguientes validaciones y correcciones:

1. **Opciones mínimas**: Si hay menos de 4 opciones, rellena automáticamente con "Opción X"
2. **Opciones máximas**: Si hay más de 4, toma solo las primeras 4
3. **Respuesta correcta**: Valida que el índice sea 0-3
4. **Duplicados**: Detecta preguntas idénticas (configurable)
5. **HTML**: Limpia excesos pero mantiene formato básico (`<b>`, `<br>`, etc.)
6. **Tags**: Extrae automáticamente de texto en negrita
7. **Dificultad**: Detecta automáticamente (EASY/MEDIUM/HARD)

---

## 🎯 Detección Automática de Dificultad

El parser analiza el texto de la pregunta para asignar dificultad:

- **EASY (Fácil)**: Preguntas con palabras clave como:
  - "¿Qué es...?"
  - "¿Cuál es...?"
  - "¿En qué año...?"
  - "¿Cuándo...?"
  - "Define..."

- **HARD (Difícil)**: Preguntas con palabras clave como:
  - "incorrecta"
  - "no es cierto"
  - "excepción"
  - "analiza"
  - "compara"

- **MEDIUM (Medio)**: Todo lo demás (por defecto)

---

## 🔄 Flujo de Importación

### **Paso 1: Vista Previa (Opcional)**
1. Sube el archivo `.gift`
2. Haz clic en **"👁️ Vista Previa"**
3. Revisa:
   - ✅ Número de preguntas detectadas
   - ✅ Formato válido
   - ✅ Preguntas parseadas correctamente
   - ✅ Dificultad asignada
   - ✅ Tags extraídos
4. Si todo está correcto, procede a importar

### **Paso 2: Importación**
1. Haz clic en **"💾 Importar Ahora"**
2. El sistema:
   - Valida el formato GIFT
   - Parsea las preguntas
   - Detecta duplicados (si está activado)
   - Guarda en la base de datos
3. Muestra resultado:
   - ✅ Preguntas importadas
   - ⏭️ Preguntas omitidas (duplicados)
   - ⚠️ Errores (si los hay)

### **Paso 3: Verificación**
1. Haz clic en **"📝 Ver Tests"** para ir a `/tests`
2. Busca el tema importado
3. Verifica que las preguntas aparezcan correctamente

---

## ⚠️ Errores Comunes

### **1. "No se encontraron preguntas válidas"**
- **Causa**: Formato GIFT incorrecto
- **Solución**: Verifica que las llaves `{}` estén balanceadas y el formato sea correcto

### **2. "Tema con ID X no encontrado"**
- **Causa**: ID de tema inválido
- **Solución**: Usa la tabla de IDs de arriba o selecciona modo "mixtas"

### **3. "Credenciales inválidas" al acceder**
- **Causa**: No tienes permisos de administrador
- **Solución**: Usa la cuenta admin especificada arriba

### **4. "No se pudo detectar tema para pregunta"**
- **Causa**: En modo mixtas, falta tag identificador
- **Solución**: Agrega tags en negrita con el nombre del tema, ej: `<b>Tema 1. Constitución</b>`

---

## 💡 Consejos de Uso

1. **Prueba con vista previa primero**: Siempre revisa antes de importar masivamente
2. **Activa "Saltar duplicados"**: Evita importar preguntas repetidas accidentalmente
3. **Usa nombres descriptivos**: En los tags, usa nombres completos del tema para mejor detección
4. **Organiza por archivos**: Un archivo `.gift` por tema facilita la gestión
5. **Verifica IDs**: Antes de importar, confirma el ID del tema en la tabla de arriba

---

## 🚀 Ejemplo de Uso Completo

### **Importar Preguntas de Constitución Española**

1. Tienes el archivo `Constitucion.gift` con 8 preguntas
2. Accedes a: http://localhost:5174/admin/import-questions
3. Seleccionas: **"Un solo tema"**
4. Ingresas ID: **1** (Constitución Española)
5. Activas: **"Saltar duplicados"** ✅
6. Subes el archivo `Constitucion.gift`
7. Haces clic en **"👁️ Vista Previa"**
8. Verificas que se detectaron 8 preguntas correctamente
9. Haces clic en **"💾 Importar Ahora"**
10. Resultado: **8 preguntas importadas, 0 omitidas** ✅
11. Haces clic en **"📝 Ver Tests"**
12. El Tema 1 ahora tiene 8 preguntas disponibles

---

## 📞 Soporte

Si encuentras algún problema:
1. Revisa los logs del servidor backend (terminal 5)
2. Verifica que el formato GIFT sea correcto
3. Consulta la tabla de IDs de temas
4. Prueba primero con vista previa

---

**Fecha de creación**: 19/11/2025  
**Versión**: 1.0
