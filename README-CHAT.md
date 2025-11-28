# Sistema de Chat con IA y RAG

Este sistema permite a los usuarios realizar consultas sobre el temario de oposiciones y recibir respuestas generadas por IA (Gemini) basadas en documentos específicos (RAG con Qdrant).

## Características

- **RAG (Retrieval-Augmented Generation):** Respuestas basadas únicamente en documentos oficiales.
- **Base de Datos Vectorial:** Qdrant para búsqueda semántica.
- **Límites de Uso:**
  - Plan Gratis: 8 consultas/mes
  - Plan Premium: 80 consultas/mes
- **Interfaz Moderna:** Integrada en el Dashboard con Shadcn/ui.

## Configuración

### 1. Requisitos Previos

- Node.js & npm
- Cuenta en Railway (para Qdrant)
- API Key de Google Gemini

### 2. Instalación de Dependencias

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd frontend
# Instalar dependencias base
npm install
# Instalar componentes Shadcn/ui
npx shadcn-ui@latest init
npx shadcn-ui@latest add button dialog progress badge scroll-area card
```

### 3. Configuración de Variables de Entorno

Copiar `.env.example` a `.env` en `backend/` y configurar:

```env
GEMINI_API_KEY=tu_api_key
QDRANT_HOST=localhost # o url de railway
QDRANT_PORT=6333
```

### 4. Base de Datos

Ejecutar las migraciones SQL en tu base de datos MySQL:
1. `backend/src/db/migrations/000_add_plan_type_to_users.sql`
2. `backend/src/db/migrations/001_create_chat_usage_table.sql`

### 5. Carga de Documentos

Para procesar los documentos .txt y cargarlos en Qdrant:

```bash
cd backend
# Windows PowerShell
$env:QDRANT_HOST='qdrant-production-693e.up.railway.app'; $env:QDRANT_PORT='443'; $env:GEMINI_API_KEY='tu_api_key'; npm run load-docs
```
*Asegúrate de que los documentos estén en `backend/Doc/TEMARIO TXT/`*

## Uso de la API

### POST /api/chat
Realizar una consulta.

**Body:**
```json
{
  "message": "¿Cuáles son los deberes del militar?"
}
```

**Respuesta:**
```json
{
  "response": "Según la Ley Orgánica 9/2011...",
  "sources": [
    { "documento": "Ley Orgánica 9/2011", "texto": "..." }
  ],
  "usage": {
    "queries_used": 5,
    "queries_limit": 8
  }
}
```

### GET /api/chat/usage
Obtener estado del consumo actual.

## Solución de Problemas

**Error: Qdrant connection refused**
- Verifica que el contenedor de Qdrant esté corriendo (`docker ps` o en Railway).
- Verifica host y puerto en `.env`.

**Error: Limit reached**
- El usuario ha superado su cuota. Debe esperar al mes siguiente o actualizar a Premium.
