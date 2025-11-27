export interface PredefinedTheme {
    id: string;
    block: string;
    name: string;
    defaultHours: number;
}

// Temas predefinidos del examen de permanencia
export const PREDEFINED_THEMES: PredefinedTheme[] = [
    // Bloque 1 – Organización (IDs de BD: 1-6)
    { id: '1', block: 'Bloque 1 – Organización', name: 'Tema 1. Constitución Española de 1978. Títulos III, IV, V, VI y VIII', defaultHours: 4 },
    { id: '2', block: 'Bloque 1 – Organización', name: 'Tema 2. Ley Orgánica 5/2005, de la Defensa Nacional', defaultHours: 4 },
    { id: '3', block: 'Bloque 1 – Organización', name: 'Tema 3. Ley 40/2015, de Régimen Jurídico del Sector Público', defaultHours: 7 },
    { id: '4', block: 'Bloque 1 – Organización', name: 'Tema 4. Real Decreto 205/2024, Ministerio de Defensa', defaultHours: 8 },
    { id: '5', block: 'Bloque 1 – Organización', name: 'Tema 5. Real Decreto 521/2020, Organización Básica de las Fuerzas Armadas', defaultHours: 5 },
    { id: '6-1', block: 'Bloque 1 – Organización', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 1: Instrucción 55/2021, EMAD', defaultHours: 11.25 },
    { id: '6-2', block: 'Bloque 1 – Organización', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 2: Instrucción 14/2021, ET', defaultHours: 11.25 },
    { id: '6-3', block: 'Bloque 1 – Organización', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 3: Instrucción 15/2021, ARMADA', defaultHours: 11.25 },
    { id: '6-4', block: 'Bloque 1 – Organización', name: 'Tema 6. Instrucciones EMAD, ET, ARMADA y EA — Parte 4: Instrucción 6/2025, EA', defaultHours: 11.25 },

    // Bloque 2 – Jurídico-Social (IDs de BD: 7-14)
    { id: '7-1', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 1. Parte 1: Ley 8/2006, Tropa y Marinería', defaultHours: 8 },
    { id: '7-2', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 1. Parte 2: Ley 39/2007 de la Carrera Militar', defaultHours: 8 },
    { id: '8', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 2. Real Decreto 96/2009, Reales Ordenanzas para las Fuerzas Armadas', defaultHours: 8 },
    { id: '9', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 3. Ley Orgánica 9/2011, Derechos y Deberes FAS', defaultHours: 7 },
    { id: '10', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 4. Ley Orgánica 8/2014, Régimen Disciplinario de las Fuerzas Armadas', defaultHours: 9 },
    { id: '11', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 5. Real Decreto 176/2014, Iniciativas y Quejas', defaultHours: 3 },
    { id: '12', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 6. Ley Orgánica 3/2007, igualdad efectiva entre mujeres y hombres', defaultHours: 8 },
    { id: '13', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 7. Observatorio militar para la igualdad entre mujeres y hombres en las Fuerzas Armadas', defaultHours: 8 },
    { id: '14', block: 'Bloque 2 – Jurídico-Social', name: 'Tema 8. Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas', defaultHours: 12 },

    // Bloque 3 – Seguridad Nacional (IDs de BD: 15-21)
    { id: '15-1', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 1. Parte 1: Ley 36/2015, Seguridad Nacional', defaultHours: 8.5 },
    { id: '15-2', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 1. Parte 2: RD 1150/2021, Estrategia de Seguridad Nacional 2021', defaultHours: 8.5 },
    { id: '16', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 2. PDC-01(B) Doctrina para el empleo de las FAS', defaultHours: 12 },
    { id: '17', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 3. Organización de las Naciones Unidas (ONU)', defaultHours: 8 },
    { id: '18', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 4. Organización del Tratado del Atlántico Norte (OTAN)', defaultHours: 8 },
    { id: '19', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 5. Organización para la Seguridad y Cooperación en Europa (OSCE)', defaultHours: 6 },
    { id: '20', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 6. Unión Europea (UE)', defaultHours: 8 },
    { id: '21', block: 'Bloque 3 – Seguridad Nacional', name: 'Tema 7. España y su participación en Misiones Internacionales', defaultHours: 11 },
];

export const COMPLEXITY_ORDER = PREDEFINED_THEMES.map(t => t.id);
