# 🎯 GUÍA RÁPIDA: Incluir ONU y OTAN en el Calendario

## ✅ PASOS PARA ASEGURAR QUE ONU Y OTAN APAREZCAN:

### 1. 📋 Verificar Selección en la Interfaz

En la página de generación de calendario (`SmartCalendar`):

1. **Desplázate hasta el Bloque 3 – Seguridad Nacional**
2. **Busca estos temas específicos:**
   - ✅ Tema 3. Organización de las Naciones Unidas (ONU) 
   - ✅ Tema 4. Organización del Tratado del Atlántico Norte (OTAN)

### 2. 🔍 Métodos de Selección

**Método A - Selección Individual:**
- Haz clic en las casillas de verificación junto a ONU y OTAN
- Asegúrate de que aparezcan marcadas con ✓

**Método B - Selección Masiva:**
- Haz clic en el botón "✓ Seleccionar todos" del Bloque 3
- Esto debería seleccionar automáticamente los 8 temas del bloque:
  - Tema 1 (Parte 1 y 2): Ley 36/2015 / RD 1150/2021
  - Tema 2: PDC-01(B) Doctrina
  - **Tema 3: ONU** ← ¡Asegúrate de que esté marcado!
  - **Tema 4: OTAN** ← ¡Asegúrate de que esté marcado!
  - Tema 5: OSCE
  - Tema 6: Unión Europea
  - Tema 7: Misiones Internacionales

### 3. 📊 Verificar Antes de Generar

**Contador de temas seleccionados:**
- Mira el resumen en la parte inferior
- Para el **Bloque 3**, deberías ver: **8 temas seleccionados**
- Si ves solo 5 temas, ¡faltan ONU y OTAN!

### 4. 🔄 Si Aún No Aparecen

**Verifica que estén en la lista:**
Los temas ONU y OTAN deberían aparecer así:
```
☐ Tema 3. Organización de las Naciones Unidas (ONU)
☐ Tema 4. Organización del Tratado del Atlántico Norte (OTAN)
```

**Si no los ves en la lista:**
1. Refresca la página (F5)
2. Limpia la selección y vuelve a seleccionar
3. Usa el botón "Seleccionar todos" del bloque 3

## 🎨 CÓMO SE VERÁN EN EL CALENDARIO

Una vez seleccionados correctamente, aparecerán en:

### 📊 Tabla de Distribución:
```
Bloque 3 – Seguridad Nacional
Organización de las Naciones Unidas (ONU)     📚 X 🔄 Y ⏱️ Z.h
Organización del Tratado del Atlántico Norte (OTAN) 📚 X 🔄 Y ⏱️ Z.h
```

### 📅 En las Sesiones del Calendario:
Las sesiones aparecerán con nombres como:
- "Organización de las Naciones Unidas (ONU) — STUDY"
- "Organización del Tratado del Atlántico Norte (OTAN) — REVIEW"

## ⚠️ PROBLEMA RESUELTO

Recuerda: **Los cambios que implementamos garantizan que ONU y OTAN APAREZCAN siempre que los selecciones**. El problema era que:

1. ✅ **Backend**: Ya resuelve temas por título cuando el ID no coincide
2. ✅ **Sistema de Partes**: Ya crea sesiones individuales para temas con partes  
3. ❌ **Frontend**: Tú debes seleccionarlos en la interfaz

## 🚀 PRÓXIMO PASO

1. Genera un nuevo calendario 
2. **Asegúrate de que ONU y OTAN estén seleccionados**
3. Verifica que aparezcan en la tabla de distribución
4. ¡Listo! Ahora deberían aparecer correctamente en tu calendario