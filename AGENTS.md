# AGENTS.md - Memoria del Proyecto

Este archivo sirve como base de conocimiento persistente para el agente de IA. Contiene la estructura del proyecto, la pila tecnológica y las convenciones de desarrollo.

## 1. Descripción del Proyecto
Sistema de gestión de planes de estudio (OpoMelilla). Aplicación web para gestionar usuarios, planes de estudio y generación de preguntas mediante IA.

## 2. Estructura del Proyecto
El proyecto sigue una estructura de monorepo con frontend y backend separados:

- `/backend`: API RESTful (Node.js/Express)
- `/frontend`: Aplicación SPA (React/Vite)
- `/`: Documentación y scripts de utilidad

## 3. Pila Tecnológica

### Frontend (`/frontend`)
- **Framework**: React 19
- **Build Tool**: Vite
- **Lenguaje**: TypeScript
- **Estilos**: TailwindCSS
- **Routing**: React Router Dom 7
- **HTTP Client**: Axios
- **UI Components**: Headless UI / Heroicons
- **Gestión de Estado**: React Hooks (Context API implícito)
- **Otras Libs**: `date-fns`, `jspdf`, `canvas-confetti`, `react-hot-toast`

### Backend (`/backend`)
- **Runtime**: Node.js
- **Framework**: Express
- **Lenguaje**: TypeScript
- **Base de Datos**: Sequelize ORM (Soporte para MySQL/SQLite)
- **Autenticación**: JWT (JSON Web Tokens)
- **Pagos**: Stripe
- **Testing**: Jest
- **Logging**: Winston

## 4. Comandos Principales

### Frontend
- `npm run dev`: Inicia el servidor de desarrollo (Vite).
- `npm run build`: Construye la aplicación para producción.
- `npm run lint`: Ejecuta el linter (ESLint).

### Backend
- `npm run dev`: Inicia el servidor de desarrollo con recarga en caliente (`ts-node`).
- `npm test`: Ejecuta las pruebas unitarias e integración (Jest).
- `npm run migrate`: Ejecuta migraciones de base de datos.
- `npm run seed`: Pobla la base de datos con datos iniciales.

## 5. Convenciones y Estándares

### Estructura de Archivos
- **Backend**: Arquitectura por capas (`controllers`, `services`, `models`, `routes`).
- **Frontend**: Organización por páginas (`pages`) y componentes reutilizables (`components`).

### Estilo de Código
- Uso estricto de **TypeScript** en ambos lados.
- **ESLint** configurado para asegurar calidad de código.
- Uso de `async/await` para operaciones asíncronas.

### Base de Datos
- Uso de migraciones para cambios en el esquema.
- Modelos definidos con Sequelize.

## 6. Notas Adicionales
- El proyecto utiliza variables de entorno (`.env`) para configuración sensible.
- La generación de preguntas utiliza servicios de IA externos.
- **IA Models**: 
    - `gemini-1.5-pro` ya no está disponible (Nov 2025).
    - Se utiliza `gemini-2.5-pro` según solicitud del usuario.
