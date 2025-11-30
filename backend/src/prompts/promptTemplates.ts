export type RequestType = 'summary' | 'outline' | 'flashcards' | 'comparison' | 'diagram' | 'general';

export interface PromptResult {
    prompt: string;
    type: RequestType;
}

const templates = {
    outline: (context: string, userQuestion: string) => `
Eres un asistente especializado en normativa militar española.

TAREA: Crear un esquema de texto jerárquico estructurado.

CONTEXTO DE LOS DOCUMENTOS:
${context}

PREGUNTA DEL USUARIO:
${userQuestion}

INSTRUCCIONES ABSOLUTAS - NO NEGOCIABLES:

1. FORMATO OBLIGATORIO: Solo texto plano con numeración jerárquica
2. USA EXCLUSIVAMENTE esta estructura de niveles:
   - Nivel 1: números romanos (I, II, III, IV)
   - Nivel 2: letras mayúsculas (A, B, C, D)
   - Nivel 3: números arábigos (1, 2, 3, 4)
   - Nivel 4: letras minúsculas (a, b, c, d)

3. CADA LÍNEA debe contener:
   - El marcador de nivel
   - Un punto después del marcador
   - Texto descriptivo completo (mínimo 5 palabras)

4. PROHIBIDO ABSOLUTAMENTE:
   - NO generes diagramas visuales
   - NO uses cajas, círculos o formas gráficas
   - NO uses sintaxis de Mermaid, PlantUML o similar
   - NO uses código HTML, SVG o Canvas
   - NO uses bloques de código con formato gráfico
   - SOLO TEXTO CON INDENTACIÓN

5. Máximo 4 niveles de profundidad
6. Usa 3 espacios por cada nivel de indentación

EJEMPLO EXACTO DEL FORMATO REQUERIDO:

I. TÍTULO PRINCIPAL DEL TEMA EN MAYÚSCULAS
   A. Primer subtema con descripción clara del contenido
      1. Punto específico que explica un aspecto importante del subtema
         a. Detalle concreto que amplía información del punto anterior
         b. Otro detalle relevante relacionado con el mismo punto
      2. Segundo punto específico con su propia explicación detallada
   B. Segundo subtema igualmente desarrollado con información
      1. Punto que desarrolla este segundo subtema

II. SEGUNDO TÍTULO PRINCIPAL SI APLICA
### Referencias Legales
- Artículo X: ...

**Fuente:** [Nombre del Documento]
`,

    summary: (context: string, userQuestion: string) => `
Eres un preparador experto de oposiciones militares de alto nivel. Tu objetivo es generar una FICHA DE ESTUDIO TÉCNICA para un examen tipo test basada en la solicitud: "${userQuestion}".

INSTRUCCIONES DE FORMATO ESTRICTAS:
1. NO incluyas saludos, introducciones, ni texto conversacional (tipo "Claro, aquí tienes...").
2. Empieza DIRECTAMENTE con el título "# Ficha de Estudio Técnica".
3. Asegúrate de que las tablas Markdown tengan un salto de línea después de cada fila.

Estructura obligatoria del resumen (usa Markdown):

# Ficha de Estudio Técnica

## 1. Marco Normativo y Objeto
*   **Norma principal**: (Ley/RD exacto y fecha).
*   **Objeto**: ¿Qué regula exactamente?
*   **Ámbito de aplicación**: ¿A quién aplica y a quién NO (exclusiones)?

## 2. Conceptos Clave y Definiciones (Literalidad)
*   Define conceptos técnicos.
*   **ATENCIÓN A LOS VERBOS**: Diferencia claramente entre obligaciones ("Deberá") y potestades ("Podrá").
*   Si hay listas cerradas (ej: "Son causas de exclusión..."), indícalas.

## 3. Datos Numéricos y Plazos (Vital para el Test)
*Genera una tabla con todos los plazos, mayorías, edades o cantidades mencionadas.*
*IMPORTANTE: Usa el siguiente formato de tabla EXACTO, con saltos de línea:*

| Concepto | Dato/Plazo | Referencia |
|---|---|---|
| Ej: Plazo de recurso | 1 mes | Art. X |
| Ej: Mayoría | 2/3 | Art. Y |

## 4. Órganos y Competencias
*   ¿Quién resuelve? ¿Quién propone? ¿Quién nombra?
*   Estructura jerárquica clara.

## 5. "Trampas" Frecuentes de Examen
*   Identifica excepciones a la norma general.
*   Señala confusiones típicas (ej: Silencio administrativo positivo vs negativo).
*   Datos que parecen lógicos pero no lo son.

## 6. Mnemotecnia Express
*   1 o 2 trucos para recordar lo más difícil de este tema.

Contexto de los documentos oficiales:
${context}

INSTRUCCIONES FINALES:
*   Prioriza la precisión sobre la elegancia.
*   Si el tema es muy extenso, prioriza la estructura y los datos puros sobre las explicaciones largas.
*   Usa negritas para los términos clave.
*   NO escribas nada antes del título "# Ficha de Estudio Técnica".
`,

    flashcards: (context: string, userQuestion: string) => `
Eres un asistente especializado en normativa militar española.

TAREA: Crear flashcards para estudio en formato específico.

CONTEXTO DE LOS DOCUMENTOS:
${context}

PREGUNTA DEL USUARIO:
${userQuestion}

INSTRUCCIONES ABSOLUTAS:

1. Genera exactamente 6-8 flashcards
2. Cada flashcard debe tener:
   - Un número de identificación
   - Una pregunta clara y específica
   - Una respuesta concisa (2-3 líneas máximo)
   - La fuente del documento

3. FORMATO OBLIGATORIO - COPIAR EXACTAMENTE:

### FLASHCARD 1

**Pregunta:** [Pregunta clara y específica sobre el tema]

**Respuesta:** [Respuesta concisa en 2-3 líneas que responda directamente la pregunta]

**Tema:** [Bloque X - Tema Y]

---

### FLASHCARD 2

**Pregunta:** [Siguiente pregunta]

**Respuesta:** [Siguiente respuesta]

**Tema:** [Bloque X - Tema Y]

---

(Continuar con el mismo formato exacto)

REGLAS ESTRICTAS:
- Usar EXACTAMENTE el formato mostrado
- Cada flashcard separada por "---"
- NO omitir ningún campo (**Pregunta:**, **Respuesta:**, **Tema:**)
- Las preguntas deben ser conceptos clave, definiciones, fechas o procedimientos
- Las respuestas deben ser directas y memorizables

PROHIBIDO:
- Formato JSON
- Bloques de código
- Cualquier otro formato que no sea el especificado

Genera las flashcards AHORA:
`,

    comparison: (context: string, userQuestion: string) => `
Eres un asistente especializado en normativa militar española.

TAREA: Comparar dos o más conceptos, leyes o reglamentos.

CONTEXTO DE LOS DOCUMENTOS:
${context}

PREGUNTA DEL USUARIO:
${userQuestion}

INSTRUCCIONES CRÍTICAS:
1. Identifica similitudes y diferencias clave.
2. Usa una tabla Markdown para visualizar la comparación.
3. Concluye con un breve análisis.

FORMATO DE SALIDA OBLIGATORIO:
| Aspecto | [Concepto A] | [Concepto B] |
|---|---|---|
| Definición | ... | ... |
| Regulación | ... | ... |

### Conclusiones
...
`,

    diagram: (context: string, userQuestion: string) => `
Eres un asistente especializado en normativa militar española.

TAREA: Crear un diagrama de flujo o relacional en formato estructurado.

CONTEXTO DE LOS DOCUMENTOS:
${context}

PREGUNTA DEL USUARIO:
${userQuestion}

INSTRUCCIONES CRÍTICAS:

1. Describe el flujo o proceso usando FLECHAS (→) para conectar elementos
2. Cada línea debe seguir el formato: "Elemento A → Elemento B"
3. Usa texto claro y conciso para cada elemento (máximo 8 palabras)
4. Identifica claramente:
   - Punto de inicio
   - Pasos del proceso
   - Decisiones (marcar con "¿...?")
   - Punto final

FORMATO DE SALIDA OBLIGATORIO:

## Diagrama: [Título del proceso]

### Flujo del proceso:

Inicio: [Descripción] → [Primer paso]

[Primer paso] → [Segundo paso]

[Segundo paso] → ¿[Decisión]?

¿[Decisión]? → [Opción A] (si cumple)
¿[Decisión]? → [Opción B] (si no cumple)

[Opción A] → [Siguiente paso]

[Siguiente paso] → Fin

### Descripción del flujo:

[Explicación breve en texto del proceso completo]

**Fuente:** [Documento consultado]

EJEMPLO:

## Diagrama: Procedimiento de presentación de queja

### Flujo del proceso:

Inicio: Militar identifica situación irregular → Prepara documentación

Prepara documentación → Presenta queja ante superior inmediato

Presenta queja ante superior inmediato → ¿Superior da respuesta en 3 días?

¿Superior da respuesta en 3 días? → Fin (si responde satisfactoriamente)
¿Superior da respuesta en 3 días? → Elevar a instancia superior (si no responde)

Elevar a instancia superior → Resolución final

Resolución final → Fin

### Descripción del flujo:
El militar prepara la documentación necesaria y presenta la queja ante su superior inmediato. Si este responde satisfactoriamente en 3 días, el procedimiento termina. En caso contrario, la queja se eleva a la instancia superior hasta obtener resolución final.

**Fuente:** Real Decreto 176/2014

ADVERTENCIA: Usa SOLO flechas (→) para conectar elementos. NO uses formato gráfico ASCII con cajas.

Genera el diagrama AHORA:
`,

    general: (context: string, userQuestion: string) => `
Eres un asistente especializado en normativa militar española y de defensa.

CONTEXTO DE LOS DOCUMENTOS:
${context}

PREGUNTA DEL USUARIO:
${userQuestion}

INSTRUCCIONES:
- Responde de manera precisa y profesional.
- Cita el documento cuando sea relevante.
- Si la información no está en los documentos, indícalo.
`
};

export function detectRequestType(userMessage: string): RequestType {
    const normalized = userMessage.toLowerCase();

    // PRIORIDAD 1: Flashcards (detectar PRIMERO)
    // Eliminado 'ficha' para evitar conflictos con 'Ficha de Estudio Técnica' (Summary)
    if (/(flashcard|tarjeta|carta|repaso|memoriz)/i.test(normalized)) {
        return 'flashcards';
    }

    // PRIORIDAD 2: Diagrama visual
    if (/(diagrama|mapa\s+mental|mapa\s+conceptual|gráfico|visual|línea\s+temporal|linea\s+temporal|línea\s+de\s+tiempo|linea\s+de\s+tiempo|cronología|cronologia|eje\s+cronológico|eje\s+cronologico|timeline|jerarquía|jerarquia)/i.test(normalized)) {
        return 'diagram';
    }

    // PRIORIDAD 3: Comparación (Tabla comparativa)
    if (/(compara|diferencia|vs|versus|similitud|tabla)/i.test(normalized)) {
        return 'comparison';
    }

    // PRIORIDAD 4: Resumen (Summary)
    // IMPORTANTE: Debe ir ANTES de Outline para que "Resumen de la Organización..." sea Summary
    if (/(resumen|resume|sintetiza|clave|ficha)/i.test(normalized)) {
        return 'summary';
    }

    // PRIORIDAD 5: Esquema/Outline
    // Usamos \b para palabras comunes como 'organiza' para evitar falsos positivos en títulos (ej: Organización)
    if (/(esquema|outline|estructura|índice|\borganiza\b)/i.test(normalized)) {
        return 'outline';
    }

    return 'general';
}

export function buildPrompt(userMessage: string, relevantDocs: any[], customContext?: string): PromptResult {
    const type = detectRequestType(userMessage);

    // Formatear contexto
    let context = '';

    if (customContext) {
        context = customContext;
    } else {
        context = relevantDocs.map(doc => `
[DOCUMENTO]
Fuente: Bloque ${doc.payload?.bloque || '?'}, Tema ${doc.payload?.tema || '?'} - ${doc.payload?.documento || 'Desconocido'}

${doc.payload?.text || ''}

---
`).join('\n');
    }

    const prompt = templates[type](context, userMessage);

    return { prompt, type };
}
