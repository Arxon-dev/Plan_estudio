# 📋 PLAN DE IMPLEMENTACIÓN - SISTEMA DE TESTS HÍBRIDO

> **Proyecto:** OpoMelilla - Sistema de Tests Educativos con IA  
> **Versión:** 2.0 (Opción 2 + 3 Combinadas)  
> **Fecha inicio:** 19/11/2025  
> **Estimación:** 4.5 semanas (1 desarrollador full-time)

---

## 📊 ESTADO GENERAL DEL PROYECTO

| Fase | Estado | Progreso | Tiempo Estimado | Tiempo Real |
|------|--------|----------|-----------------|-------------|
| **Fase 1: Base de Datos** | ✅ Completada | 100% | 3 días | 1 día |
| **Fase 2: Backend Core** | ✅ Completada | 100% | 4 días | 1 día |
| **Fase 3: Sistema de IA** | ✅ Completada | 100% | 3 días | 0.5 días |
| **Fase 4: Frontend** | ⏳ Pendiente | 0% | 7 días | - |
| **Fase 5: Integración** | ⏳ Pendiente | 0% | 3 días | - |
| **Fase 6: Testing & Deploy** | ⏳ Pendiente | 0% | 2 días | - |
| **TOTAL** | 🔄 En progreso | **45%** | **22 días** | **2.5 días** |

**Leyenda de estados:**
- ⏳ Pendiente
- 🔄 En progreso
- ✅ Completado
- ⚠️ Bloqueado
- ❌ Cancelado

---

## 🎯 ARQUITECTURA DEL SISTEMA

### **Componentes a Implementar**

```
SISTEMA DE TESTS
│
├── 📦 BACKEND
│   ├── Modelos (5 nuevos)
│   │   ├── TestQuestion
│   │   ├── TestAttempt
│   │   ├── ThemeProgress
│   │   ├── UserTestStats
│   │   └── AITestSession
│   │
│   ├── Controladores (2 nuevos)
│   │   ├── TestController
│   │   └── AITestController
│   │
│   ├── Servicios (4 nuevos)
│   │   ├── TestService
│   │   ├── AdaptiveTestEngine
│   │   ├── AIQuestionGenerator
│   │   └── AIAnalysisService
│   │
│   └── Rutas (2 nuevas)
│       ├── /api/tests
│       └── /api/admin/tests
│
├── 🎨 FRONTEND
│   ├── Páginas (4 nuevas)
│   │   ├── Tests.tsx (Dashboard)
│   │   ├── TestSession.tsx (Ejecución)
│   │   ├── TestResults.tsx (Resultados)
│   │   └── TestAnalytics.tsx (Estadísticas)
│   │
│   └── Componentes (8 nuevos)
│       ├── ThemeProgressCard
│       ├── QuestionDisplay
│       ├── OptionButton
│       ├── TestTimer
│       ├── FeedbackPanel
│       ├── AIInsights
│       ├── LevelBadge
│       └── PremiumTestCard
│
└── 🤖 INTEGRACIONES
    ├── OpenAI API
    ├── Sistema de Pagos (Stripe)
    └── WebSockets (tests adaptativos)
```

---

# 📅 FASE 1: BASE DE DATOS (3 días)

## **Objetivo:** Crear estructura de datos para tests

### ✅ **Tareas Completadas**
- [x] 1.1 Modelo TestQuestion (4 horas) - COMPLETADO
- [x] 1.2 Modelo TestAttempt (5 horas) - COMPLETADO
- [x] 1.3 Modelo ThemeProgress (4 horas) - COMPLETADO
- [x] 1.4 Modelo UserTestStats (3 horas) - COMPLETADO
- [x] 1.5 Modelo AITestSession (3 horas) - COMPLETADO
- [x] 1.6 Migración de Base de Datos (2 horas) - COMPLETADO
- [x] 1.7 Seeders de Prueba (2 horas) - COMPLETADO
- [x] Exportación en index.ts - COMPLETADO

### 🔄 **Tareas en Progreso**
- [ ] Ninguna aún

### ⏳ **Tareas Pendientes**

#### **1.1 Modelo TestQuestion** (4 horas)
**Archivo:** `backend/src/models/TestQuestion.ts`

**Descripción:** Modelo para almacenar preguntas de tests (manuales o generadas por IA)

**Campos a implementar:**
```typescript
- id: number (PK)
- themeId: number (FK → themes)
- question: string (500 chars)
- options: JSON (array de 4 strings)
- correctAnswer: number (0-3)
- explanation: TEXT
- difficulty: ENUM('EASY', 'MEDIUM', 'HARD')
- source: ENUM('MANUAL', 'AI_GENERATED')
- aiModel: string (nullable)
- usageCount: number (default 0)
- successRate: number (0-100, default 0)
- tags: JSON (array de strings)
- createdAt, updatedAt
```

**Relaciones:**
- `belongsTo(Theme, { foreignKey: 'themeId' })`

**Índices:**
- `(themeId, difficulty)`
- `(source)`
- `(successRate)`

**Validaciones:**
- `question.length >= 20`
- `options.length === 4`
- `correctAnswer in [0, 1, 2, 3]`
- `explanation.length >= 50`

---

#### **1.2 Modelo TestAttempt** (5 horas)
**Archivo:** `backend/src/models/TestAttempt.ts`

**Descripción:** Historial de intentos de tests de usuarios

**Campos a implementar:**
```typescript
- id: number (PK)
- userId: number (FK → users)
- themeId: number (FK → themes, nullable para simulacros)
- sessionId: number (FK → study_sessions, nullable)
- testType: ENUM('INITIAL', 'SCHEDULED', 'PRACTICE', 'SIMULATION', 'ADAPTIVE')
- totalQuestions: number
- correctAnswers: number
- score: number (0-100)
- timeSpent: number (segundos)
- answers: JSON (array de objetos con respuestas)
- passThreshold: number (default 70)
- passed: boolean
- adaptiveDifficulty: number (nullable)
- weakAreas: JSON (array, nullable)
- strongAreas: JSON (array, nullable)
- aiRecommendations: JSON (nullable)
- predictedExamScore: number (nullable)
- createdAt
```

**Relaciones:**
- `belongsTo(User, { foreignKey: 'userId' })`
- `belongsTo(Theme, { foreignKey: 'themeId' })`
- `belongsTo(StudySession, { foreignKey: 'sessionId' })`

**Índices:**
- `(userId, createdAt)`
- `(themeId, testType)`
- `(passed, score)`

---

#### **1.3 Modelo ThemeProgress** (4 horas)
**Archivo:** `backend/src/models/ThemeProgress.ts`

**Descripción:** Progreso y niveles del usuario por tema

**Campos a implementar:**
```typescript
- id: number (PK)
- userId: number (FK → users)
- themeId: number (FK → themes)
- level: ENUM('LOCKED', 'BRONZE', 'SILVER', 'GOLD', 'DIAMOND')
- totalTests: number (default 0)
- averageScore: number (0-100, default 0)
- bestScore: number (0-100, default 0)
- worstScore: number (0-100, nullable)
- studySessionsCompleted: number (default 0)
- reviewSessionsCompleted: number (default 0)
- testSessionsCompleted: number (default 0)
- masteryLevel: number (0-100, default 0)
- weakTopics: JSON (nullable)
- strongTopics: JSON (nullable)
- learningCurve: JSON (nullable)
- estimatedTimeToMastery: number (nullable)
- lastTestDate: DATE (nullable)
- lastStudyDate: DATE (nullable)
- nextReviewDate: DATE (nullable)
- updatedAt
```

**Relaciones:**
- `belongsTo(User, { foreignKey: 'userId' })`
- `belongsTo(Theme, { foreignKey: 'themeId' })`

**Índices:**
- `UNIQUE(userId, themeId)`
- `(level, averageScore)`

---

#### **1.4 Modelo UserTestStats** (3 horas)
**Archivo:** `backend/src/models/UserTestStats.ts`

**Descripción:** Estadísticas globales del usuario

**Campos a implementar:**
```typescript
- id: number (PK)
- userId: number (FK → users, UNIQUE)
- totalTests: number (default 0)
- totalQuestionsAnswered: number (default 0)
- globalSuccessRate: number (0-100, default 0)
- totalTimeSpent: number (minutos, default 0)
- monthlyPracticeTests: number (default 0)
- overallMasteryLevel: number (0-100, default 0)
- examReadinessScore: number (0-100, default 0)
- strongestBlock: string (nullable)
- weakestBlock: string (nullable)
- averageTestSpeed: number (seg/pregunta, default 0)
- consistencyScore: number (0-100, default 0)
- userRank: number (nullable)
- topPercentile: number (nullable)
- lastMonthlyReset: DATE
- updatedAt
```

**Relaciones:**
- `belongsTo(User, { foreignKey: 'userId' })`

**Índices:**
- `UNIQUE(userId)`
- `(userRank)`
- `(examReadinessScore DESC)`

---

#### **1.5 Modelo AITestSession** (3 horas)
**Archivo:** `backend/src/models/AITestSession.ts`

**Descripción:** Sesiones de tests adaptativos con IA

**Campos a implementar:**
```typescript
- id: number (PK)
- userId: number (FK → users)
- themeId: number (FK → themes, nullable)
- testAttemptId: number (FK → test_attempts)
- initialDifficulty: number (1-10)
- finalDifficulty: number (1-10)
- adaptiveAlgorithm: ENUM('IRT', 'BAYESIAN', 'SIMPLE')
- aiAnalysis: JSON
- generatedQuestions: number (default 0)
- personalizedFeedback: TEXT
- createdAt
```

**Relaciones:**
- `belongsTo(User, { foreignKey: 'userId' })`
- `belongsTo(Theme, { foreignKey: 'themeId' })`
- `belongsTo(TestAttempt, { foreignKey: 'testAttemptId' })`

---

#### **1.6 Migración de Base de Datos** (2 horas)
**Archivo:** `backend/src/migrations/YYYYMMDD-create-test-system.ts`

**Tareas:**
- [ ] Crear migración con todas las tablas
- [ ] Definir foreign keys y cascadas
- [ ] Crear índices para optimización
- [ ] Probar migración en desarrollo
- [ ] Crear migración de rollback

**Comando:**
```bash
npm run migrate
```

---

#### **1.7 Seeders de Prueba** (2 horas)
**Archivo:** `backend/src/seeders/test-questions-seed.ts`

**Tareas:**
- [ ] Crear 50 preguntas de ejemplo (10 por bloque)
- [ ] Distribuir dificultades: 20 EASY, 20 MEDIUM, 10 HARD
- [ ] Incluir explicaciones completas
- [ ] Ejecutar seeder en desarrollo

**Comando:**
```bash
npm run seed:test-questions
```

---

### **Criterios de Aceptación Fase 1**
- [x] Todas las tablas creadas sin errores
- [x] Migraciones ejecutadas correctamente
- [x] Relaciones funcionando (foreign keys)
- [x] Seeders generan datos de prueba
- [x] Índices creados y optimizados

---

# 📅 FASE 2: BACKEND CORE (4 días)

## **Objetivo:** Implementar lógica de negocio y endpoints

### ⏳ **Tareas Pendientes**

#### **2.1 Servicio TestService** (6 horas)
**Archivo:** `backend/src/services/TestService.ts`

**Métodos a implementar:**

**✅ Gestión de Tests**
- [ ] `startTest(userId, themeId, type, options)` - Iniciar test
- [ ] `submitAnswer(sessionId, questionId, answer)` - Enviar respuesta
- [ ] `completeTest(sessionId, answers)` - Finalizar test
- [ ] `getTestResults(attemptId)` - Obtener resultados

**✅ Selección de Preguntas**
- [ ] `selectQuestionsByDifficulty(themeId, difficulty, count)` - Seleccionar preguntas
- [ ] `generateRandomTest(themeId, count)` - Test aleatorio
- [ ] `avoidRecentQuestions(userId, themeId, count)` - Evitar repeticiones

**✅ Cálculo de Resultados**
- [ ] `calculateScore(answers)` - Calcular puntuación
- [ ] `determinePassFail(score, threshold)` - Determinar aprobado/suspendido
- [ ] `updateStatistics(userId, attempt)` - Actualizar estadísticas

**✅ Sistema de Niveles**
- [ ] `updateThemeLevel(userId, themeId, score)` - Actualizar nivel
- [ ] `checkLevelRequirements(userId, themeId)` - Verificar requisitos de nivel
- [ ] `unlockTheme(userId, themeId)` - Desbloquear tema

---

#### **2.2 Controlador TestController** (5 horas)
**Archivo:** `backend/src/controllers/TestController.ts`

**Endpoints a implementar:**

**✅ Dashboard y Listado**
- [ ] `GET /api/tests/dashboard` - Dashboard completo
- [ ] `GET /api/tests/themes` - Temas con progreso
- [ ] `GET /api/tests/upcoming` - Tests obligatorios pendientes

**✅ Ejecución de Tests**
- [ ] `POST /api/tests/start` - Iniciar test
- [ ] `POST /api/tests/:sessionId/answer` - Enviar respuesta
- [ ] `POST /api/tests/:sessionId/complete` - Finalizar test
- [ ] `GET /api/tests/session/:sessionId` - Estado de sesión

**✅ Resultados y Estadísticas**
- [ ] `GET /api/tests/results/:attemptId` - Resultados detallados
- [ ] `GET /api/tests/history` - Historial de tests
- [ ] `GET /api/tests/stats` - Estadísticas globales

**✅ Control de Límites**
- [ ] Middleware `checkMonthlyLimit` - Verificar límite mensual (FREE)
- [ ] Middleware `checkPremiumAccess` - Verificar acceso premium
- [ ] Cron job para resetear contador mensual

---

#### **2.3 Rutas de Tests** (2 horas)
**Archivo:** `backend/src/routes/tests.ts`

**Tareas:**
- [ ] Configurar rutas con autenticación
- [ ] Aplicar middlewares de validación
- [ ] Configurar rate limiting (10 req/min)
- [ ] Documentar endpoints con comentarios

---

#### **2.4 Sistema de Desbloqueo** (4 horas)
**Archivo:** `backend/src/services/UnlockService.ts`

**Lógica a implementar:**
- [ ] `checkTestAccess(userId, themeId, testType)` - Verificar acceso
- [ ] `unlockByStudySession(userId, sessionId)` - Desbloquear por estudio
- [ ] `unlockByTestCompletion(userId, attemptId)` - Desbloquear por test
- [ ] `getUnlockRequirements(userId, themeId)` - Obtener requisitos

**Reglas de desbloqueo:**
```typescript
LOCKED → BRONZE: Completar 1 sesión STUDY
BRONZE → SILVER: Aprobar primer test obligatorio (≥70%)
SILVER → GOLD: Promedio ≥85% en últimos 3 tests
GOLD → DIAMOND: Promedio ≥95% en últimos 5 tests
```

---

#### **2.5 Integración con StudySession** (3 horas)
**Archivo:** `backend/src/models/StudySession.ts` (modificar)

**Cambios a realizar:**
- [ ] Añadir campo `testAttemptId` (FK opcional)
- [ ] Añadir campo `testRequired` (boolean)
- [ ] Añadir campo `testMinScore` (number, default 70)
- [ ] Modificar método `completeSession` para verificar test obligatorio

**Lógica:**
```typescript
// Si es sesión tipo TEST y no tiene testAttemptId
if (session.sessionType === 'TEST' && !session.testAttemptId) {
  throw new Error('Debes completar el test antes de marcar sesión completada');
}

// Si tiene test, verificar puntuación mínima
if (session.testAttemptId) {
  const attempt = await TestAttempt.findByPk(session.testAttemptId);
  if (attempt.score < session.testMinScore) {
    throw new Error(`Puntuación insuficiente: ${attempt.score}% (mínimo ${session.testMinScore}%)`);
  }
}
```

---

### **Criterios de Aceptación Fase 2**
- [ ] Todos los endpoints funcionando
- [ ] Tests unitarios para servicios críticos
- [ ] Validación de datos en todos los endpoints
- [ ] Sistema de niveles funcionando correctamente
- [ ] Integración con StudySession operativa

---

# 📅 FASE 3: SISTEMA DE IA (3 días)

## **Objetivo:** Implementar funcionalidades con OpenAI

### ⏳ **Tareas Pendientes**

#### **3.1 Configuración de OpenAI** (2 horas)
**Archivo:** `backend/.env`

**Variables de entorno:**
```env
# IA Configuration (GLM-4.6 - Z.AI)
Z_AI_API_KEY=225c3091ddea4ca3ac5f27b24f08f70b.PI51LZq9mPMdRodr
Z_AI_MODEL=glm-4-flash
AI_ENABLED=true
AI_QUESTION_GENERATION=false
AI_ANALYSIS_ENABLED=true
AI_MONTHLY_BUDGET=50
AI_MAX_REQUESTS_PER_USER_DAY=5

# Documentación: https://docs.z.ai/devpack/overview
# Quick Start: https://docs.z.ai/devpack/quick-start
```

**Tareas:**
- [ ] Crear cuenta OpenAI
- [ ] Generar API key
- [ ] Configurar límites de uso
- [ ] Configurar alertas de presupuesto

---

#### **3.2 Servicio AIQuestionGenerator** (8 horas)
**Archivo:** `backend/src/services/AIQuestionGenerator.ts`

**Métodos a implementar:**
- [ ] `generateQuestion(themeId, difficulty)` - Generar 1 pregunta
- [ ] `generateBulkQuestions(themeId, count, config)` - Generar múltiples
- [ ] `buildSystemPrompt()` - Instrucciones generales de calidad
- [ ] `buildUserPrompt(theme, difficulty, existing)` - Instrucciones específicas
- [ ] `validateQuestion(generated)` - Validar pregunta generada
- [ ] `findSimilarQuestions(question)` - Detectar duplicados
- [ ] `saveGeneratedQuestion(question)` - Guardar en BD

**Prompts a crear:**
- [ ] System prompt con reglas de calidad
- [ ] Instrucciones por nivel de dificultad (EASY, MEDIUM, HARD)
- [ ] Instrucciones por tipo (fechas, conceptos, procedimientos)
- [ ] Formato de respuesta JSON

---

#### **3.3 Servicio AdaptiveTestEngine** (6 horas)
**Archivo:** `backend/src/services/AdaptiveTestEngine.ts`

**Métodos a implementar:**
- [ ] `runAdaptiveTest(userId, themeId)` - Ejecutar test adaptativo
- [ ] `selectQuestionByDifficulty(themeId, difficulty)` - Seleccionar pregunta
- [ ] `adjustDifficulty(currentDiff, isCorrect)` - Ajustar dificultad
- [ ] `calculateMastery(answers)` - Calcular maestría
- [ ] `generateRecommendation(mastery)` - Generar recomendación

**Algoritmo adaptativo:**
```typescript
// IRT (Item Response Theory) simplificado
if (answer.correct) {
  difficulty = Math.min(10, difficulty + 0.8);
} else {
  difficulty = Math.max(1, difficulty - 1.2);
}
```

---

#### **3.4 Servicio AIAnalysisService** (8 horas)
**Archivo:** `backend/src/services/AIAnalysisService.ts`

**Métodos a implementar:**
- [ ] `analyzeUserPerformance(userId)` - Análisis completo
- [ ] `identifyWeakAreas(attempts)` - Identificar debilidades
- [ ] `predictExamScore(analysis)` - Predecir nota de examen
- [ ] `generateRecommendations(analysis)` - Generar recomendaciones
- [ ] `estimateTimeToImprove(current, target)` - Estimar horas de estudio
- [ ] `getAIInsights(data)` - Llamar a OpenAI para insights

**Prompt de análisis:**
```typescript
const prompt = `
Eres un experto en análisis educativo. Analiza este historial:

Datos del estudiante: ${JSON.stringify(analysisData)}

Proporciona en JSON:
1. weakAreas: Áreas débiles específicas
2. strongAreas: Fortalezas
3. predictedExamScore: Nota estimada (0-100)
4. confidence: Confianza de la predicción
5. recommendations: Recomendaciones concretas
6. hoursToImprove: Horas estimadas para mejorar 10 puntos
`;
```

---

#### **3.5 Controlador AITestController** (4 hours)
**Archivo:** `backend/src/controllers/AITestController.ts`

**Endpoints a implementar:**
- [ ] `POST /api/tests/adaptive/start` - Iniciar test adaptativo
- [ ] `GET /api/tests/analysis/:userId` - Análisis con IA
- [ ] `POST /api/tests/weakness-test` - Test de debilidades
- [ ] `POST /api/admin/tests/generate` - Generar preguntas con IA

---

#### **3.6 Sistema de Control de Costos** (3 horas)
**Archivo:** `backend/src/services/AICostControl.ts`

**Métodos a implementar:**
- [ ] `trackAPICall(userId, cost, tokens)` - Registrar llamada
- [ ] `checkBudgetLimit()` - Verificar presupuesto
- [ ] `getUserDailyLimit(userId)` - Verificar límite diario
- [ ] `generateCostReport()` - Reporte de costos

**Tabla nueva:** `ai_usage_logs`
```sql
CREATE TABLE ai_usage_logs (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT,
  operation VARCHAR(50),
  tokens_used INT,
  estimated_cost DECIMAL(6,4),
  created_at TIMESTAMP
);
```

---

### **Criterios de Aceptación Fase 3**
- [ ] IA genera preguntas de calidad (validación manual de 10 preguntas)
- [ ] Tests adaptativos ajustan dificultad correctamente
- [ ] Análisis de IA proporciona insights útiles
- [ ] Control de costos funcionando
- [ ] Límites de uso respetados

---

# 📅 FASE 4: FRONTEND (7 días)

## **Objetivo:** Crear interfaz de usuario completa

### ⏳ **Tareas Pendientes**

#### **4.1 Página Tests Dashboard** (8 horas)
**Archivo:** `frontend/src/pages/Tests.tsx`

**Secciones a implementar:**
- [ ] Header con estadísticas globales
  - Nivel global, tests completados, probabilidad aprobar
- [ ] Próximos tests obligatorios (cards)
- [ ] Bloques de temas con niveles
  - Cards por tema mostrando nivel (🔒🥉🥈🥇💎)
  - Progreso visual (barra)
  - Botón para iniciar test
- [ ] Sección Premium (CTA si no está suscrito)
- [ ] Filtros por bloque (ORGANIZACION, JURIDICO_SOCIAL, SEGURIDAD_NACIONAL)

**Componentes a crear:**
- [ ] `StatsOverview` - Resumen de estadísticas
- [ ] `UpcomingTestCard` - Card de test programado
- [ ] `ThemeCard` - Card de tema con nivel
- [ ] `PremiumCTA` - Call to action premium

---

#### **4.2 Página Test Session** (12 horas)
**Archivo:** `frontend/src/pages/TestSession.tsx`

**Funcionalidad a implementar:**
- [ ] Header con progreso (X/15 preguntas)
- [ ] Timer si es test cronometrado
- [ ] Indicador de dificultad (tests adaptativos)
- [ ] Display de pregunta actual
  - Enunciado
  - 4 opciones (botones seleccionables)
- [ ] Navegación entre preguntas
  - Anterior/Siguiente
  - Minimap de preguntas (dots indicando respondidas)
- [ ] Botón finalizar test
- [ ] Confirmación antes de enviar
- [ ] WebSocket para tests adaptativos (opcional)

**Componentes a crear:**
- [ ] `QuestionDisplay` - Muestra pregunta y opciones
- [ ] `OptionButton` - Botón de opción con estado
- [ ] `TestTimer` - Contador de tiempo
- [ ] `ProgressBar` - Barra de progreso
- [ ] `QuestionMinimap` - Navegación visual

**Estados a manejar:**
```typescript
interface TestSessionState {
  sessionId: string;
  questions: Question[];
  currentIndex: number;
  answers: Map<number, number>;
  timeElapsed: number;
  isSubmitting: boolean;
}
```

---

#### **4.3 Página Test Results** (10 horas)
**Archivo:** `frontend/src/pages/TestResults.tsx`

**Secciones a implementar:**
- [ ] Score principal con animación
  - Puntuación (%)
  - Aprobado/Suspendido
  - Comparación con intento anterior
- [ ] Análisis IA (solo premium)
  - Fortalezas detectadas
  - Áreas de mejora
  - Predicción de examen
  - Recomendaciones personalizadas
- [ ] Revisión pregunta por pregunta
  - Pregunta
  - Respuesta del usuario
  - Respuesta correcta
  - Explicación
  - Estado (✓ correcto / ✗ incorrecto)
- [ ] Botones de acción
  - Repetir test
  - Estudiar errores
  - Test de debilidades (premium)

**Componentes a crear:**
- [ ] `ScoreDisplay` - Muestra puntuación con animación
- [ ] `AIAnalysisPanel` - Panel de análisis IA
- [ ] `QuestionReview` - Revisión de pregunta individual
- [ ] `InsightCard` - Card de insight (fortaleza/debilidad)
- [ ] `PredictionCard` - Predicción de examen

---

#### **4.4 Componente Theme Progress Card** (4 horas)
**Archivo:** `frontend/src/components/ThemeProgressCard.tsx`

**Funcionalidad:**
- [ ] Mostrar nivel actual (badge con icono 🥉🥈🥇💎)
- [ ] Progreso hacia siguiente nivel (barra)
- [ ] Estadísticas del tema
  - Tests completados
  - Puntuación promedio
  - Última sesión
- [ ] Botones de acción
  - Iniciar test de repaso
  - Ver detalles
- [ ] Estado de bloqueo si LOCKED
- [ ] Tooltip con requisitos de desbloqueo

---

#### **4.5 Componente AI Insights** (6 horas)
**Archivo:** `frontend/src/components/AIInsights.tsx`

**Secciones:**
- [ ] Análisis de fortalezas (lista con iconos)
- [ ] Análisis de debilidades (lista con acciones)
- [ ] Predicción de examen
  - Nota estimada
  - Confianza
  - Probabilidad de aprobar
- [ ] Recomendaciones accionables
  - Descripción
  - Impacto estimado
  - Botón de acción
- [ ] Gráfico de evolución temporal

**Requisito:** Solo visible para usuarios premium

---

#### **4.6 Integración con AdminPanel** (6 horas)
**Archivo:** `frontend/src/pages/AdminPanel.tsx` (modificar)

**Nueva sección a añadir:**
- [ ] Gestión de Preguntas
  - Formulario crear pregunta manual
  - Lista de preguntas con filtros
  - Editar/Eliminar preguntas
  - Importar desde archivo (JSON/CSV)
  - Generar con IA (botón)
- [ ] Gestión de Límites
  - Configurar tests/mes para FREE
  - Configurar precio Premium
  - Estadísticas de uso
- [ ] Estadísticas de Tests
  - Total de tests realizados
  - Promedio de puntuaciones
  - Temas más difíciles
  - Conversión FREE → PREMIUM

---

#### **4.7 Sistema de Notificaciones** (4 horas)
**Archivo:** `frontend/src/components/TestNotifications.tsx`

**Notificaciones a implementar:**
- [ ] "Tienes un test obligatorio pendiente para hoy"
- [ ] "Has alcanzado nivel GOLD en Tema 3 🥇"
- [ ] "Te quedan X tests gratuitos este mes"
- [ ] "Tu predicción de examen ha mejorado a X%"
- [ ] "Nuevo logro desbloqueado: Racha de 7 días"

---

#### **4.8 Responsive Design** (6 horas)

**Tareas:**
- [ ] Adaptar Tests dashboard a móvil
- [ ] Adaptar TestSession a móvil
  - Opciones apiladas verticalmente
  - Navegación touch-friendly
- [ ] Adaptar TestResults a móvil
- [ ] Probar en diferentes dispositivos
  - iPhone (Safari)
  - Android (Chrome)
  - Tablet

---

### **Criterios de Aceptación Fase 4**
- [ ] Todas las páginas funcionando
- [ ] Navegación fluida entre pantallas
- [ ] Diseño responsive en móvil
- [ ] Componentes reutilizables
- [ ] Estados de carga y error manejados
- [ ] Accesibilidad básica (ARIA labels)

---

# 📅 FASE 5: INTEGRACIÓN Y CARACTERÍSTICAS AVANZADAS (3 días)

## **Objetivo:** Integrar sistemas y añadir features premium

### ⏳ **Tareas Pendientes**

#### **5.1 Sistema de Pagos Stripe** (8 horas)

**Backend:**
**Archivo:** `backend/src/services/StripeService.ts`

- [ ] Configurar Stripe SDK
- [ ] Crear endpoint `POST /api/payments/create-checkout`
- [ ] Crear endpoint `POST /api/payments/webhook` (verificar pagos)
- [ ] Actualizar estado premium del usuario
- [ ] Manejar cancelaciones y renovaciones

**Frontend:**
**Archivo:** `frontend/src/pages/PremiumUpgrade.tsx`

- [ ] Página de planes (FREE vs PREMIUM)
- [ ] Tabla comparativa de features
- [ ] Botón "Probar 7 días gratis"
- [ ] Integración con Stripe Checkout
- [ ] Página de éxito/cancelación

**Variables de entorno:**
```env
STRIPE_SECRET_KEY=sk_test_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_test_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PREMIUM_PRICE_ID=price_xxxxx
```

---

#### **5.2 Sistema de Logros** (6 horas)
**Archivo:** `backend/src/services/AchievementService.ts`

**Logros a implementar:**
- [ ] Primera Puntuación Perfecta (100%)
- [ ] Demonio de la Velocidad (test en <5 min)
- [ ] Rey del Regreso (mejora +30 puntos)
- [ ] Racha Maestra (7 días seguidos)
- [ ] Todo es Oro (todos los temas en GOLD)

**Tabla:** `user_achievements`
```sql
CREATE TABLE user_achievements (
  id INT PRIMARY KEY,
  user_id INT,
  achievement_id VARCHAR(50),
  unlocked_at TIMESTAMP,
  UNIQUE(user_id, achievement_id)
);
```

**Métodos:**
- [ ] `checkAchievements(userId, event)` - Verificar logros
- [ ] `unlockAchievement(userId, achievementId)` - Desbloquear
- [ ] `getUserAchievements(userId)` - Obtener logros del usuario

---

#### **5.3 Ranking Global** (5 horas)
**Archivo:** `backend/src/services/RankingService.ts`

**Funcionalidad:**
- [ ] Calcular ranking global (todos los usuarios)
- [ ] Calcular ranking por bloque
- [ ] Calcular ranking semanal/mensual
- [ ] Endpoint `GET /api/tests/leaderboard`
- [ ] Página frontend con tabla de ranking

**Criterios de ranking:**
- Puntuación promedio (40%)
- Total de tests completados (30%)
- Nivel de maestría global (20%)
- Consistencia (10%)

**Privacidad:** Ranking anónimo (solo mostrar iniciales)

---

#### **5.4 Exportación de Certificados** (4 horas)
**Archivo:** `backend/src/services/CertificateService.ts`

**Funcionalidad:**
- [ ] Generar PDF de certificado
- [ ] Usar librería `pdfkit`
- [ ] Plantilla de certificado
  - Logo OpoMelilla
  - Nombre del usuario
  - Tema dominado
  - Nivel alcanzado (DIAMOND)
  - Fecha
  - Código de verificación
- [ ] Endpoint `GET /api/tests/certificate/:themeId`

**Requisito:** Solo para temas nivel DIAMOND

---

#### **5.5 WebSockets para Tests Adaptativos** (6 horas)
**Archivo:** `backend/src/websockets/testSocket.ts`

**Eventos a implementar:**
- [ ] `test:start` - Usuario inicia test
- [ ] `test:answer` - Usuario responde pregunta
- [ ] `test:next-question` - Servidor envía siguiente pregunta
- [ ] `test:complete` - Test finalizado
- [ ] `test:difficulty-change` - Notificar cambio de dificultad

**Frontend:**
**Archivo:** `frontend/src/hooks/useAdaptiveTest.ts`

- [ ] Hook para manejar conexión WebSocket
- [ ] Enviar respuestas en tiempo real
- [ ] Recibir siguiente pregunta
- [ ] Manejar desconexiones

---

#### **5.6 Cron Jobs** (3 horas)
**Archivo:** `backend/src/jobs/testJobs.ts`

**Jobs a implementar:**
- [ ] Resetear contador mensual (día 1 de cada mes)
- [ ] Actualizar rankings (diario a las 00:00)
- [ ] Enviar recordatorios de tests pendientes (diario a las 09:00)
- [ ] Limpiar sesiones expiradas (cada hora)
- [ ] Generar reporte de costos IA (semanal)

**Usar:** `node-cron`

---

### **Criterios de Aceptación Fase 5**
- [ ] Pagos Stripe funcionando en test
- [ ] Logros desbloqueándose correctamente
- [ ] Ranking visible para premium
- [ ] Certificados generándose en PDF
- [ ] WebSockets estables (sin desconexiones)
- [ ] Cron jobs ejecutándose puntualmente

---

# 📅 FASE 6: TESTING Y DEPLOYMENT (2 días)

## **Objetivo:** Asegurar calidad y desplegar a producción

### ⏳ **Tareas Pendientes**

#### **6.1 Tests Unitarios Backend** (6 horas)

**Archivos a crear:**
- [ ] `backend/tests/services/TestService.test.ts`
- [ ] `backend/tests/services/AdaptiveTestEngine.test.ts`
- [ ] `backend/tests/services/AIQuestionGenerator.test.ts`
- [ ] `backend/tests/controllers/TestController.test.ts`

**Casos de prueba:**
- [ ] Selección de preguntas por dificultad
- [ ] Cálculo de puntuaciones
- [ ] Sistema de niveles
- [ ] Validación de preguntas generadas por IA
- [ ] Algoritmo adaptativo

**Comando:**
```bash
npm run test:backend
```

---

#### **6.2 Tests E2E Frontend** (6 hours)

**Archivos a crear:**
- [ ] `frontend/tests/e2e/test-flow.spec.ts`

**Flujos a probar:**
- [ ] Usuario inicia test de repaso
- [ ] Usuario responde todas las preguntas
- [ ] Usuario ve resultados
- [ ] Usuario alcanza nuevo nivel
- [ ] Usuario alcanza límite mensual (FREE)
- [ ] Usuario upgrade a Premium

**Usar:** Playwright o Cypress

**Comando:**
```bash
npm run test:e2e
```

---

#### **6.3 Optimización de Performance** (4 horas)

**Backend:**
- [ ] Añadir índices en queries lentas
- [ ] Implementar cache con Redis (opcional)
  - Cache de rankings
  - Cache de estadísticas
- [ ] Optimizar queries N+1
- [ ] Añadir paginación en listados

**Frontend:**
- [ ] Lazy loading de componentes
- [ ] Optimizar re-renders (React.memo)
- [ ] Comprimir imágenes
- [ ] Code splitting por rutas

---

#### **6.4 Seguridad** (3 horas)

**Tareas:**
- [ ] Validar todos los inputs (backend)
- [ ] Sanitizar respuestas de IA
- [ ] Rate limiting en endpoints sensibles
- [ ] CORS configurado correctamente
- [ ] Variables de entorno en producción
- [ ] Encriptar API keys
- [ ] Validar permisos (admin vs user)

---

#### **6.5 Documentación API** (2 horas)

**Archivo:** `backend/docs/API_TESTS.md`

**Documentar:**
- [ ] Todos los endpoints con ejemplos
- [ ] Códigos de error
- [ ] Modelos de datos
- [ ] Flujos de autenticación

**Usar:** Swagger/OpenAPI (opcional)

---

#### **6.6 Deploy a Producción** (4 horas)

**Backend (Railway):**
- [ ] Configurar variables de entorno
- [ ] Ejecutar migraciones en producción
- [ ] Verificar conexión a BD
- [ ] Configurar logs (CloudWatch o similar)
- [ ] Healthcheck endpoint `GET /health`

**Frontend (Vercel/Netlify):**
- [ ] Build de producción
- [ ] Configurar variables de entorno
- [ ] Configurar redirects
- [ ] SSL/HTTPS habilitado

**Tareas post-deploy:**
- [ ] Cargar 200 preguntas iniciales (importar CSV)
- [ ] Crear usuarios de prueba
- [ ] Verificar Stripe en modo live
- [ ] Monitorear logs primeras 24h

---

### **Criterios de Aceptación Fase 6**
- [ ] Tests unitarios al 80% cobertura
- [ ] Tests E2E pasando
- [ ] Sin errores en consola
- [ ] Performance aceptable (< 2s carga)
- [ ] Deploy exitoso en producción
- [ ] Monitoreo configurado

---

# 🎯 CHECKLIST FINAL DE FEATURES

## **Tier Gratuito**
- [ ] 10 tests de repaso/mes (configurable por admin)
- [ ] Tests obligatorios ilimitados (vinculados al calendario)
- [ ] Sistema de niveles (LOCKED → BRONZE → SILVER → GOLD → DIAMOND)
- [ ] Estadísticas básicas por tema
- [ ] Historial de tests
- [ ] Explicaciones detalladas de respuestas

## **Tier Premium**
- [ ] Tests ilimitados de todos los tipos
- [ ] Tests adaptativos con IA
- [ ] Análisis profundo con IA
- [ ] Tests centrados en debilidades
- [ ] Simulacros completos (50 preguntas)
- [ ] Generación de preguntas con IA (admin)
- [ ] Rankings globales
- [ ] Logros desbloqueables
- [ ] Certificados descargables
- [ ] Predicción de nota de examen
- [ ] Recomendaciones personalizadas

## **Panel de Administración**
- [ ] Crear preguntas manualmente
- [ ] Importar preguntas (JSON/CSV)
- [ ] Generar preguntas con IA
- [ ] Editar/Eliminar preguntas
- [ ] Configurar límites FREE (tests/mes)
- [ ] Configurar precio Premium
- [ ] Ver estadísticas de uso
- [ ] Ver costos de IA
- [ ] Gestionar usuarios premium

---

# 📊 MÉTRICAS DE ÉXITO

**Objetivos a medir post-lanzamiento:**

| Métrica | Objetivo Mes 1 | Objetivo Mes 3 |
|---------|----------------|----------------|
| Tests completados | 500 | 2,000 |
| Usuarios activos (tests) | 50 | 200 |
| Conversión FREE → PREMIUM | 5% | 10% |
| Preguntas generadas por IA | 100 | 500 |
| Tasa de aprobación tests | 65% | 70% |
| NPS (satisfacción) | 7/10 | 8/10 |

---

# 🚀 PRÓXIMOS PASOS INMEDIATOS

1. ✅ **Confirmar inicio de implementación** - CONFIRMADO
2. **Crear cuenta OpenAI y obtener API key**
3. **Crear cuenta Stripe (modo test)**
4. **Preparar CSV con 50 preguntas iniciales**
5. **Iniciar Fase 1: Base de Datos**

---

## ⚠️ RECORDATORIO IMPORTANTE: GIT/GITHUB

```bash
# ✅ PERMITIDO: Commits locales para guardar progreso
git add .
git commit -m "feat: implementar modelo TestQuestion"

# ❌ PROHIBIDO: Push a GitHub hasta finalizar TODO
# git push origin main  ← NO EJECUTAR HASTA EL FINAL
```

**Razón:** Evitar subir código incompleto o en desarrollo. Solo se hará push cuando el sistema esté 100% funcional y probado.

**Cuándo hacer push:**
- [ ] Todas las 6 fases completadas
- [ ] Tests pasando correctamente
- [ ] Deploy funcionando en producción
- [ ] Sistema validado por usuario final

---

# 📝 NOTAS IMPORTANTES

- **⚠️ GIT/GITHUB:** NO subir cambios a GitHub hasta completar TODO el proyecto. Solo commit local.
- **Prioridad:** Implementar primero features básicos (Fase 1-2), luego IA (Fase 3)
- **Costos IA:** Estimar ~$30-50/mes para 100 usuarios premium
- **Testing:** Probar exhaustivamente antes de pasar a siguiente fase
- **Documentación:** Mantener este documento actualizado con progreso real
- **Feedback:** Recoger feedback de primeros usuarios en Fase 4

---

**Última actualización:** 19/11/2025 - 21:30  
**Estado:** ✅ Fase 3 COMPLETADA | ⏳ Fase 4 pendiente  
**Progreso total:** 45% (2.5/22 días completados)  

**Últimos cambios:**
- ✅ Creado AIQuestionGenerator (generación con Z.AI GLM-4)
- ✅ Creado AdaptiveTestEngine (algoritmo adaptativo)
- ✅ Creado AIAnalysisService (análisis y predicciones)
- ✅ Creado AITestController con 5 endpoints
- ✅ API Key configurada en .env
- 🚀 Listo para Fase 4: Frontend
