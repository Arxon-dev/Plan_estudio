# 🎯 ANÁLISIS COMPLETO: Sistema de Creación de Cuenta y Baremo

## 📊 ESTRUCTURA DE DATOS DEFINITIVA

### Datos del Usuario (Simplificados)
```typescript
interface Usuario {
  // === REGISTRO BÁSICO ===
  id: string
  email: string
  password: string
  firstName: string
  lastName: string
  
  // === DATOS MILITARES ===
  ejercito: 'TIERRA' | 'ARMADA' | 'AIRE_Y_ESPACIO'
  empleo: 'CABO_PRIMERO' | 'CABO'
  
  // TIERRA: agrupación + especialidad
  agrupacionEspecialidad?: 'OPERATIVAS' | 'TECNICAS' // Solo si es TIERRA
  especialidadFundamental: string // Seleccionable según ejército
  
  // === BAREMO (Manual) ===
  baremo: {
    // Solo números que ellos deben saber
    tiempoServiciosUnidadesPreferentes: number // meses
    tiempoServiciosOtrasUnidades: number // meses
    tiempoOperacionesExtranjero: number // meses (máx 24)
    notaMediaInformes: number // Media de sus 5 últimos informes
    
    // Seleccionables
    recompensas: Recompensa[]
    titulacion: Titulacion
    idiomas: Idioma[]
    cursosMilitares: Curso[]
  }
  
  // === RESULTADOS PRUEBAS (Post-examen) ===
  resultadosPruebas: {
    pruebasFisicas?: {
      flexionesTronco: number
      flexionesBrazos: number
      circuitoAgilidad: number
    }
    reconocimientoMedico?: 'APTO' | 'NO_APTO'
    pruebaConocimientos?: {
      acertadas: number
      erroneas: number
      enBlanco: number
    }
  }
  
  // === PUNTUACIONES (Calculadas) ===
  puntuaciones: {
    meritosProfesionales: number // máx 40
    meritosAcademicos: number // máx 20
    informesCalificacion: number // máx 25
    pruebasFisicas: number // máx 15
    concurso: number // máx 100
    oposicion: number // máx 100
    total: number // máx 200
    posicionRanking?: number
  }
  
  perfilPublico: boolean
  createdAt: Date
  updatedAt: Date
}
```

## 🏛️ CATÁLOGOS EXTRAÍDOS

### 1. EJÉRCITO DE TIERRA (550 plazas)
**Agrupaciones de Especialidades**
```typescript
const AGRUPACIONES_TIERRA = [
  { id: 'OPERATIVAS', nombre: 'Agrupación de Especialidades Operativas', plazas: 357 },
  { id: 'TECNICAS', nombre: 'Agrupación de Especialidades Técnicas', plazas: 193 }
] as const;
```

**Especialidades Operativas**
```typescript
const ESPECIALIDADES_OPERATIVAS_TIERRA = [
  { id: 'OPERATIVAS_GENERAL', nombre: 'Especialidades Operativas (General)' }
] as const;
```

**Especialidades Técnicas**
```typescript
const ESPECIALIDADES_TECNICAS_TIERRA = [
  { id: 'MANTENIMIENTO_VEHICULOS', nombre: 'Mantenimiento de Vehículos', plazas: 56 },
  { id: 'MONTADOR_EQUIPOS', nombre: 'Montador de Equipos/Electricidad/Instalaciones', plazas: 12 },
  { id: 'APOYO_SANITARIO', nombre: 'Apoyo Sanitario', plazas: 29 },
  { id: 'HOSTELERIA', nombre: 'Hostelería', plazas: 20 },
  { id: 'MANTENIMIENTO_AERONAVES', nombre: 'Mantenimiento de Aeronaves', plazas: 3 },
  { id: 'MANTENIMIENTO_ELECTRONICO', nombre: 'Mantenimiento Electrónico y de Telecomunicaciones', plazas: 26 },
  { id: 'CUALQUIER_TECNICA', nombre: 'Cualquier Especialidad Técnica', plazas: 47 }
] as const;
```

### 2. ARMADA (195 plazas)
**Cuerpos**
```typescript
const CUERPOS_ARMADA = [
  { id: 'GENERAL', nombre: 'Cuerpo General', plazas: 130 },
  { id: 'INFANTERIA_MARINA', nombre: 'Cuerpo de Infantería de Marina', plazas: 65 }
] as const;
```

**Especialidades Cuerpo General - OM 15/2000**
```typescript
const ESPECIALIDADES_CG_OM_2000 = [
  { id: 'MNM', nombre: 'Maniobra y Navegación', plazas: 23 },
  { id: 'AMM', nombre: 'Artillería y Misiles', plazas: 5 },
  { id: 'ASM', nombre: 'Armas Submarinas', plazas: 2 },
  { id: 'DTM', nombre: 'Dirección de Tiro', plazas: 4 },
  { id: 'STM', nombre: 'Sistemas Tácticos', plazas: 6 },
  { id: 'SOM', nombre: 'Sonar', plazas: 4 },
  { id: 'ERM', nombre: 'Electrónica', plazas: 6 },
  { id: 'COM', nombre: 'Comunicaciones', plazas: 7 },
  { id: 'ADM', nombre: 'Administración', plazas: 8 },
  { id: 'ELM', nombre: 'Electricidad', plazas: 11 },
  { id: 'MQM', nombre: 'Máquinas', plazas: 19 },
  { id: 'HAM', nombre: 'Hostelería y Alimentación', plazas: 18 }
] as const;
```

**Especialidades Cuerpo General - RD 711/2010**
```typescript
const ESPECIALIDADES_CG_RD_2010 = [
  { id: 'MNM_RD', nombre: 'Maniobra y Navegación (RD 711/2010)', plazas: 23, nota: 'Pueden optar a MNM de OM 15/2000' },
  { id: 'OSM', nombre: 'Operaciones y Sistemas', plazas: 2 },
  { id: 'EPM', nombre: 'Energía y Propulsión', plazas: 2 },
  { id: 'APM', nombre: 'Aprovisionamiento', plazas: 2 }
] as const;
```

**Especialidades Cuerpo General - Cualquier Especialidad**
```typescript
const ESPECIALIDADES_CG_CUALQUIERA = [
  { id: 'CUALQUIERA', nombre: 'Cualquier Especialidad', plazas: 11 }
] as const;
```

**Especialidades Infantería de Marina**
```typescript
const ESPECIALIDADES_INFANTERIA_MARINA = [
  { id: 'IMT', nombre: 'Infantería de Marina', plazas: 64 },
  { id: 'MUS', nombre: 'Música', plazas: 1 }
] as const;
```

### 3. EJÉRCITO DEL AIRE Y DEL ESPACIO (255 plazas)
**Especialidades**
```typescript
const ESPECIALIDADES_AIRE_ESPACIO = [
  { id: 'MCO', nombre: 'Mando y Control', plazas: 10 },
  { id: 'SDG_POL', nombre: 'Seguridad y Defensa / Policía', plazas: 41 },
  { id: 'SDG_BND', nombre: 'Seguridad y Defensa / Banda', plazas: 2 },
  { id: 'OAS_SC', nombre: 'Operaciones Aéreas / Supervisor de Carga', plazas: 4 },
  { id: 'OAS_COMB', nombre: 'Operaciones Aéreas / Combustible', plazas: 5 },
  { id: 'OAS_ZV', nombre: 'Operaciones Aéreas / Zona de Vuelos', plazas: 5 },
  { id: 'OAS_NBQ', nombre: 'Operaciones Aéreas / NBQ', plazas: 12 },
  { id: 'OAS_CIM', nombre: 'Operaciones Aéreas / Cartografía e Imagen', plazas: 4 },
  { id: 'LGA', nombre: 'Logística Aérea', plazas: 4 },
  { id: 'HAM', nombre: 'Hostelería', plazas: 23 },
  { id: 'MIN_PST', nombre: 'Instalaciones / Pistas', plazas: 7 },
  { id: 'MIN_TLL', nombre: 'Instalaciones / Talleres', plazas: 4 },
  { id: 'MIN_CON', nombre: 'Instalaciones / Conservación', plazas: 3 },
  { id: 'ADN', nombre: 'Administración', plazas: 26 },
  { id: 'MUS', nombre: 'Música', plazas: 3 },
  { id: 'AMA', nombre: 'Mantenimiento de Aeronaves', plazas: 20 },
  { id: 'MMA', nombre: 'Mantenimiento de Armamento', plazas: 4 },
  { id: 'TCE', nombre: 'Mantenimiento de Telecomunicaciones y Electrónica', plazas: 11 },
  { id: 'AMV', nombre: 'Mantenimiento de Vehículos', plazas: 16 },
  { id: 'CUALQUIERA', nombre: 'Cualquier Especialidad', plazas: 51 }
] as const;
```

## 🎖️ CATÁLOGOS DE BAREMO

### 1. RECOMPENSAS MILITARES
```typescript
const RECOMPENSAS_MILITARES = [
  { id: 'CRUZ_LAUREADA', nombre: 'Cruz Laureada de San Fernando', puntos: 10 },
  { id: 'MEDALLA_MILITAR', nombre: 'Medalla Militar', puntos: 8 },
  { id: 'CRUZ_GUERRA', nombre: 'Cruz de Guerra', puntos: 7 },
  { id: 'MEDALLA_EJERCITO_INDIVIDUAL', nombre: 'Medallas del Ejército, Naval y Aérea (individuales)', puntos: 6 },
  { id: 'CRUZ_MERITO_ROJO', nombre: 'Cruz al Mérito Militar, Naval o Aeronáutico (distintivo rojo)', puntos: 5 },
  { id: 'CRUZ_MERITO_AZUL', nombre: 'Cruz al Mérito Militar, Naval o Aeronáutico (distintivo azul o amarillo)', puntos: 4 },
  { id: 'CRUZ_MERITO_BLANCO', nombre: 'Cruz al Mérito Militar, Naval o Aeronáutico (distintivo blanco)', puntos: 3 },
  { id: 'CITACION_DISTINGUIDO', nombre: 'Citación como distinguido en la Orden General', puntos: 2.5 },
  { id: 'CRUZ_CONSTANCIA_PLATA', nombre: 'Cruz de plata a la constancia en el Servicio', puntos: 4 },
  { id: 'CRUZ_CONSTANCIA_BRONCE', nombre: 'Cruz de bronce a la constancia en el Servicio', puntos: 3 },
  { id: 'MENCION_HONORIFICA', nombre: 'Mención Honorífica', puntos: 1 },
  { id: 'FELICITACION', nombre: 'Felicitaciones individuales anotadas en Hoja de Servicios', puntos: 0.5 },
  { id: 'CONDECORACION_EXTRANJERA_CONFLICTO', nombre: 'Condecoraciones extranjeras (mérito individual en conflictos armados)', puntos: 3 },
  { id: 'CONDECORACION_EXTRANJERA_ORGANISMO', nombre: 'Condecoraciones extranjeras (por organización u organismo internacional)', puntos: 0.25 },
  { id: 'VALOR_RECONOCIDO', nombre: 'Valor reconocido', puntos: 0.5 }
] as const;
```

### 2. TITULACIONES ACADÉMICAS
```typescript
const TITULACIONES_ACADEMICAS = [
  { id: 'MECES_4_DOCTOR', nombre: 'MECES 4 / Doctor', puntos: 6 },
  { id: 'MECES_3_MASTER', nombre: 'MECES 3 / Máster / Licenciado, Ingeniero o Arquitecto', puntos: 5 },
  { id: 'MECES_2_GRADO', nombre: 'MECES 2 / Grado', puntos: 4 },
  { id: 'DIPLOMADO', nombre: 'Diplomado Universitario, Arquitecto Técnico o Ingeniero Técnico', puntos: 3.5 },
  { id: 'MECES_1_TECNICO_SUPERIOR', nombre: 'MECES 1 / Título de Técnico Superior', puntos: 3 },
  { id: 'BACHILLER', nombre: 'Título Bachiller (LOE, LOGSE, etc.) / Bachiller experimental / COU', puntos: 2 }
] as const;
```

### 3. IDIOMAS
```typescript
const IDIOMAS = [
  { id: 'INGLES', nombre: 'Inglés' },
  { id: 'FRANCES', nombre: 'Francés' },
  { id: 'ALEMAN', nombre: 'Alemán' },
  { id: 'ITALIANO', nombre: 'Italiano' },
  { id: 'PORTUGUES', nombre: 'Portugués' },
  { id: 'RUSO', nombre: 'Ruso' },
  { id: 'ARABE', nombre: 'Árabe' },
  { id: 'CHINO', nombre: 'Chino' },
  { id: 'OTRO', nombre: 'Otro' }
] as const;

const NIVELES_SLP = [
  { id: 'SLP_3333', nombre: 'SLP 3.3.3.3 o superior', puntosIngles: 5, puntosOtros: 4 },
  { id: 'SLP_2222', nombre: 'SLP 2.2.2.2 o superior', puntosIngles: 3, puntosOtros: 2 },
  { id: 'SLP_1111', nombre: 'SLP 1.1.1.1 o superior', puntosIngles: 1, puntosOtros: 0.5 }
] as const;
```

### 4. CURSOS MILITARES
```typescript
const TIPOS_CURSOS = [
  { id: 'ESPECIALIZACION', nombre: 'De Especialización', puntos: 2, maximo: 4 },
  { id: 'INFORMATIVO', nombre: 'Informativos', puntos: 0.5, maximo: 4 }
] as const;
```

## 🎯 FLUJO DE USUARIO (Estrategia "Registro Simple")

### 1. Registro Rápido (Actual)
- **Datos**: Email, Password, Nombre, Apellidos.
- **Objetivo**: Eliminar fricción y permitir acceso inmediato a la plataforma.

### 2. Nueva Sección: "Mi Baremo / Oposición"
*Accesible desde el perfil de usuario o un botón destacado "Calcular mi Nota".*

**Incentivo para el usuario**:
> "Completa tu perfil militar y académico para conocer tu puntuación real y ver tu posición en el ranking de tu especialidad."

#### Pestaña 1: Datos Militares
- Selección de Ejército y Empleo
- Selección de Agrupación/Cuerpo y Especialidad

#### Pestaña 2: Méritos Profesionales
- **Tiempo de Servicios**: Input numérico para meses en diferentes unidades.
- **Cálculo Automático**:
  - Unidades preferentes: x 0.08
  - Otras unidades: x 0.04
  - Operaciones: x 0.1 (máx 24 meses)
- **Empleo**: Cabo 1º (5 pts) / Cabo (2 pts)
- **Recompensas**: Selector múltiple con suma automática.

#### Pestaña 3: Méritos Académicos
- **Titulación**: Selector único.
- **Idiomas**: Selector múltiple (Idioma + Nivel).
- **Cursos**: Selector múltiple (Tipo + Nombre manual).

#### Pestaña 4: Informes de Calificación
- Input numérico para nota media (0-10).
- Cálculo: Nota x 2.5

#### Resumen en Tiempo Real
- Barra lateral o superior fija mostrando la puntuación actual de concurso (ej: "Tienes 70.13 / 100 puntos de concurso").

### 3. Ranking Público (Competición)
*Una página donde los usuarios pueden ver su posición respecto a otros opositores de su misma especialidad.*

- **Filtrado Jerárquico**:
  1. **Cuerpo**: Ejército de Tierra, Armada o Aire y del Espacio.
  2. **Especialidad**: Filtrado dinámico según el cuerpo seleccionado (ej: "Infantería de Marina" solo si se elige Armada).
- **Privacidad**: Solo aparecen usuarios con `perfilPublico = true`.
- **Datos Visibles**:
  - Nombre (o Alias/Anónimo si se prefiere).
  - Puntuación Concurso.
  - Puntuación Oposición (si la hay).
  - **Total**.
- **Actualización**: En tiempo real (o cacheado cada X minutos) conforme los usuarios actualizan sus méritos.

## 🏋️ DESPUÉS DEL EXAMEN: Introducir Resultados

### 1. Pruebas Físicas
- Inputs: Flexiones tronco, Flexiones brazos, Circuito agilidad.
- Cálculo automático sobre 15 puntos.

### 2. Reconocimiento Médico
- Selector: APTO / NO APTO.

### 3. Prueba de Conocimientos
- Inputs: Acertadas, Erróneas, En blanco.
- Fórmula: P = A - [E/(n-1)]

## 🗄️ ESQUEMA DE BASE DE DATOS FINAL

```sql
-- ===== TABLA PRINCIPAL =====
CREATE TABLE users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  firstName VARCHAR(100) NOT NULL,
  lastName VARCHAR(100) NOT NULL,
  
  -- Datos militares
  ejercito ENUM('TIERRA', 'ARMADA', 'AIRE_Y_ESPACIO'),
  empleo ENUM('CABO_PRIMERO', 'CABO'),
  agrupacion_especialidad ENUM('OPERATIVAS', 'TECNICAS'), -- Solo TIERRA
  especialidad_fundamental VARCHAR(100),
  
  -- Tiempos de servicio (introducidos manualmente)
  tiempo_unidades_preferentes INT DEFAULT 0, -- meses
  tiempo_otras_unidades INT DEFAULT 0, -- meses
  tiempo_operaciones_extranjero INT DEFAULT 0, -- meses (máx 24)
  
  -- Informes de calificación
  nota_media_informes DECIMAL(5,3), -- Ej: 7.850
  
  -- Resultados pruebas oficiales
  flexiones_tronco INT,
  flexiones_brazos INT,
  circuito_agilidad DECIMAL(4,1), -- Ej: 13.5
  
  reconocimiento_medico ENUM('APTO', 'NO_APTO'),
  
  prueba_acertadas INT,
  prueba_erroneas INT,
  prueba_en_blanco INT,
  
  -- Puntuaciones calculadas
  puntos_meritos_profesionales DECIMAL(5,3) DEFAULT 0, -- máx 40
  puntos_meritos_academicos DECIMAL(5,3) DEFAULT 0, -- máx 20
  puntos_informes_calificacion DECIMAL(5,3) DEFAULT 0, -- máx 25
  puntos_pruebas_fisicas DECIMAL(5,3) DEFAULT 0, -- máx 15
  puntos_concurso DECIMAL(6,3) DEFAULT 0, -- máx 100
  puntos_oposicion DECIMAL(6,3) DEFAULT 0, -- máx 100
  puntos_total DECIMAL(6,3) DEFAULT 0, -- máx 200
  
  posicion_ranking INT,
  
  perfil_publico BOOLEAN DEFAULT TRUE,
  
  -- Existentes
  isAdmin BOOLEAN DEFAULT FALSE,
  isPremium BOOLEAN DEFAULT FALSE,
  isBanned BOOLEAN DEFAULT FALSE,
  
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===== RECOMPENSAS =====
CREATE TABLE recompensas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tipo VARCHAR(100) NOT NULL, -- 'CRUZ_LAUREADA', 'MEDALLA_MILITAR', etc.
  puntos DECIMAL(4,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== TITULACIÓN =====
CREATE TABLE titulacion (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL UNIQUE,
  nivel VARCHAR(50) NOT NULL, -- 'MECES_4_DOCTOR', etc.
  puntos DECIMAL(4,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== IDIOMAS =====
CREATE TABLE idiomas (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  idioma VARCHAR(50) NOT NULL, -- 'INGLES', 'FRANCES', etc.
  nivel VARCHAR(20) NOT NULL, -- 'SLP_3333', 'SLP_2222', 'SLP_1111'
  puntos DECIMAL(4,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ===== CURSOS MILITARES =====
CREATE TABLE cursos_militares (
  id INT PRIMARY KEY AUTO_INCREMENT,
  user_id INT NOT NULL,
  tipo ENUM('ESPECIALIZACION', 'INFORMATIVO') NOT NULL,
  nombre_curso VARCHAR(255) NOT NULL,
  puntos DECIMAL(4,2) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
```
