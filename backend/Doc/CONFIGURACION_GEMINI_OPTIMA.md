# ⚙️ Configuración Óptima para Gemini (AI Studio)
## Objetivo: Generación de Preguntas de Examen Oficial (Alta Fidelidad)

Para obtener los mejores resultados utilizando el prompt `prompt examen oficial_Probar.txt` y tus archivos de temario en **Google AI Studio**, configura el modelo con los siguientes parámetros.

---

### 🎛️ Parámetros Principales (Run Settings)

| Parámetro | Valor Recomendado | Explicación |
| :--- | :--- | :--- |
| **Model** | **Gemini 1.5 Pro** (o Experimental) | El modelo "Pro" tiene mejor razonamiento lógico que "Flash" para entender las trampas y notas del tutor. |
| **Temperature** | **0.1 - 0.2** | **CRÍTICO.** Necesitamos precisión casi quirúrgica. Una temperatura baja evita que la IA "invente" leyes o cambie el formato estricto. |
| **Top P** | **0.8** | Mantiene un equilibrio saludable, pero priorizando las respuestas más probables y lógicas. |
| **Top K** | **40** | Valor estándar, funciona bien para este propósito. |
| **Output Length** | **8192** (Máximo posible) | Necesario para generar lotes grandes de preguntas (ej. 20 preguntas) con sus retroalimentaciones detalladas sin que se corte a la mitad. |

---

### 🧠 Capacidades y Herramientas

| Configuración | Estado | Razón |
| :--- | :--- | :--- |
| **Safety Settings** | **Block Few / Off** | **IMPORTANTE.** Al tratar temas militares (armas, defensa, conflictos), los filtros de seguridad estándar pueden bloquear preguntas legítimas. Configúralo al mínimo. |
| **Grounding (Google Search)** | **OFF (Desactivado)** | **CRÍTICO.** Queremos que la IA use **SOLO tu temario** (con tus notas de tutor). Si activas Google Search, podría buscar leyes actualizadas en internet e ignorar tus notas específicas o versiones del temario. |
| **Code Execution** | **OFF** | No es necesario para generar texto y podría confundir al modelo intentando programar la respuesta en Python. |
| **Function Calling** | **None** | No aplica. |
| **Structured Outputs** | **OFF (Texto libre)** | Nuestro prompt ya incluye un formato de salida muy específico (con llaves `{}`). Si fuerzas el modo JSON nativo de Gemini, romperás el formato que tu importador espera. |

---

### 📝 Instrucciones de Uso en el Prompt

1.  **System Instructions (Instrucciones del Sistema):**
    *   Copia y pega TODO el contenido de `prompt examen oficial_Probar.txt` en la caja de "System Instructions".
    *   Esto asegura que las reglas se apliquen permanentemente a toda la sesión.

2.  **User Prompt (Tu mensaje):**
    *   Sube el archivo del tema (ej. `TEMA-1-PARTE-1...txt`) como adjunto (+).
    *   Escribe: *"Genera 10 preguntas de NIVEL MEDIO y 5 de NIVEL DIFICIL basándote EXCLUSIVAMENTE en este documento adjunto, prestando atención prioritaria a las NOTAS DEL TUTOR."*

---

### 💡 Tips Adicionales

*   **Stop Sequence:** No es necesaria, pero si ves que el modelo empieza a alucinar después de terminar el bloque JSON, puedes añadir `}` como secuencia de parada (aunque no lo recomiendo si quieres generar múltiples preguntas seguidas).
*   **Thinking / Reasoning:** Si usas un modelo experimental con capacidades de "Thinking", actívalo. Ayudará a la IA a planificar los distractores antes de escribir la pregunta final.
