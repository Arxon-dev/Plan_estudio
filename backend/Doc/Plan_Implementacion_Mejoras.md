# Plan de Implementación de Mejoras

## 1. Estadísticas Comparativas con Otros Usuarios

### Descripción
Implementar funcionalidad para mostrar estadísticas comparativas del usuario con respecto al resto de usuarios del sistema.

### Tareas

### Backend
- [x] Crear método en TestService para calcular rankings de usuarios
- [x] Añadir endpoint en TestController para obtener estadísticas comparativas
- [~] Implementar job programado para actualizar rankings periódicamente
- [x] Actualizar modelo UserTestStats con datos necesarios para comparativas

### Frontend
- [x] Añadir sección de estadísticas comparativas en Tests.tsx
- [x] Crear componente de visualización de ranking
- [x] Implementar gráficos comparativos con otros usuarios
- [x] Mostrar posición del usuario y percentil

## 2. Tests Centrados en Debilidades

### Descripción
Crear funcionalidad para generar tests personalizados basados en las áreas débiles identificadas del usuario.

### Tareas

### Backend
- [x] Extender lógica en TestService para análisis de debilidades
- [x] Crear método para identificar patrones de errores por tema/bloque
- [x] Implementar generación de tests enfocados en debilidades
- [x] Añadir endpoint para obtener recomendaciones personalizadas

### Frontend
- [x] Añadir sección de "Practicar mis debilidades" en Tests.tsx
- [x] Crear interfaz para seleccionar tests basados en debilidades
- [x] Mostrar recomendaciones personalizadas al usuario
- [x] Implementar seguimiento de progreso en áreas débiles

## Detalles Técnicos

### Campos Disponibles
- userRank: Posición en el ranking general
- topPercentile: Percentil del usuario
- weakestBlock: Bloque más débil identificado
- strongestBlock: Bloque más fuerte identificado

### Endpoints Propuestos
- GET /api/tests/ranking - Obtener ranking y estadísticas comparativas
- GET /api/tests/weaknesses - Obtener análisis de debilidades (en lugar de /recommendations)
- POST /api/tests/weakness-focused - Generar test enfocado en debilidades

## Prioridad de Implementación
1. [x] Estadísticas Comparativas con Otros Usuarios
2. [x] Tests Centrados en Debilidades