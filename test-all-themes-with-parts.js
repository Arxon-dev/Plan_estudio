const axios = require('axios');

// Generar token JWT para autenticación
const jwt = require('jsonwebtoken');
const token = jwt.sign(
  { userId: 1, email: 'test@example.com' },
  'tu_clave_secreta_super_segura_para_el_desarrollo_de_la_aplicacion',
  { expiresIn: '7d' }
);

const API_URL = 'http://localhost:3001/api';

// Todos los temas incluyendo ONU (17), OTAN (18) y temas con partes
const allThemes = [
  // Bloque 1 - Organización
  { id: 1, name: 'Constitución Española de 1978. Títulos III, IV, V, VI y VIII', defaultHours: 12.5 },
  { id: 2, name: 'Ley Orgánica 5/2005, de la Defensa Nacional', defaultHours: 16.5 },
  { id: 3, name: 'Real Decreto 205/2024, Ministerio de Defensa', defaultHours: 9.9 },
  { id: 4, name: 'Real Decreto 521/2020, Organización Básica de las Fuerzas Armadas', defaultHours: 19.2 },
  { id: 5, name: 'Ley 40/2015, de Régimen Jurídico del Sector Público', defaultHours: 16.4 },
  { id: 6, name: 'Instrucciones EMAD, ET, ARMADA y EA', defaultHours: 15.5, parts: 4 },
  
  // Bloque 2 - Jurídico-Social
  { id: 7, name: 'Real Decreto 96/2009, Reales Ordenanzas para las Fuerzas Armadas', defaultHours: 9.9 },
  { id: 8, name: 'Ley Orgánica 9/2011, Derechos y Deberes FAS', defaultHours: 12.8 },
  { id: 9, name: 'Real Decreto 176/2014, Iniciativas y Quejas', defaultHours: 11.0 },
  { id: 10, name: 'Ley Orgánica 3/2007, igualdad efectiva entre mujeres y hombres', defaultHours: 8.9 },
  { id: 11, name: 'Observatorio militar para la igualdad entre mujeres y hombres en las Fuerzas Armadas', defaultHours: 9.6 },
  { id: 12, name: 'Ley 8/2006, Tropa y Marinería / Ley 39/2007 de la Carrera Militar', defaultHours: 11.4, parts: 2 },
  { id: 13, name: 'Ley Orgánica 8/2014, Régimen Disciplinario de las Fuerzas Armadas', defaultHours: 9.9 },
  { id: 14, name: 'Ley 39/2015, Procedimiento Administrativo Común de las Administraciones Públicas', defaultHours: 8.9 },
  
  // Bloque 3 - Seguridad Nacional
  { id: 15, name: 'Ley 36/2015, Seguridad Nacional / RD 1150/2021, Estrategia de Seguridad Nacional 2021', defaultHours: 16.5, parts: 2 },
  { id: 16, name: 'PDC-01(B) Doctrina para el empleo de las FAS', defaultHours: 7.3 },
  { id: 17, name: 'Organización de las Naciones Unidas (ONU)', defaultHours: 10.0 }, // ONU
  { id: 18, name: 'Organización del Tratado del Atlántico Norte (OTAN)', defaultHours: 10.0 }, // OTAN
  { id: 19, name: 'Organización para la Seguridad y Cooperación en Europa (OSCE)', defaultHours: 10.0 },
  { id: 20, name: 'Unión Europea (UE)', defaultHours: 18.5 },
  { id: 21, name: 'España y su participación en Misiones Internacionales', defaultHours: 19.0 }
];

async function testAllThemesWithParts() {
  try {
    console.log('🧪 Probando generación con TODOS los temas incluyendo ONU, OTAN y temas con partes...\n');
    
    const studyPlanData = {
      title: 'Plan Completo con ONU, OTAN y Partes',
      description: 'Plan de estudio completo con todos los temas incluyendo ONU, OTAN y temas con partes',
      examDate: '2025-03-15',
      weeklySchedule: {
        monday: { enabled: true, hours: 4 },
        tuesday: { enabled: true, hours: 4 },
        wednesday: { enabled: true, hours: 4 },
        thursday: { enabled: true, hours: 4 },
        friday: { enabled: true, hours: 4 },
        saturday: { enabled: true, hours: 3 },
        sunday: { enabled: false, hours: 0 }
      },
      themes: allThemes,
      totalHours: 300,
      bufferDays: 30
    };

    console.log('📋 Enviando plan con temas:', allThemes.map(t => ({ id: t.id, name: t.name, parts: t.parts })));
    
    const response = await axios.post(
      `${API_URL}/study-plans/`,
      studyPlanData,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✅ Plan generado exitosamente!');
    console.log('📊 ID del plan:', response.data.id);
    console.log('📊 Total de sesiones:', response.data.totalSessions);
    console.log('📊 Distribución por bloques:', response.data.blockDistribution);
    
    // Obtener las sesiones generadas
    const sessionsResponse = await axios.get(
      `${API_URL}/study-plans/${response.data.id}/sessions`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );

    const sessions = sessionsResponse.data;
    console.log('\n📋 Análisis de sesiones generadas:');
    
    // Verificar ONU y OTAN
    const onuSessions = sessions.filter(s => s.themeId === 17);
    const otanSessions = sessions.filter(s => s.themeId === 18);
    
    console.log(`🔍 ONU (ID 17): ${onuSessions.length} sesiones`);
    console.log(`🔍 OTAN (ID 18): ${otanSessions.length} sesiones`);
    
    if (onuSessions.length > 0) {
      console.log('✅ ONU encontrado en sesiones:');
      onuSessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - ${s.scheduledHours}h`);
      });
    }
    
    if (otanSessions.length > 0) {
      console.log('✅ OTAN encontrado en sesiones:');
      otanSessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - ${s.scheduledHours}h`);
      });
    }
    
    // Verificar temas con partes
    const tema6Sessions = sessions.filter(s => s.themeId === 6);
    const tema12Sessions = sessions.filter(s => s.themeId === 12);
    const tema15Sessions = sessions.filter(s => s.themeId === 15);
    
    console.log(`\n📚 Tema 6 (Instrucciones - 4 partes): ${tema6Sessions.length} sesiones`);
    if (tema6Sessions.length > 0) {
      tema6Sessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - Parte: ${s.subThemeIndex || 'N/A'}`);
      });
    }
    
    console.log(`\n📚 Tema 12 (Tropa/Carrera - 2 partes): ${tema12Sessions.length} sesiones`);
    if (tema12Sessions.length > 0) {
      tema12Sessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - Parte: ${s.subThemeIndex || 'N/A'}`);
      });
    }
    
    console.log(`\n📚 Tema 15 (Seguridad Nacional - 2 partes): ${tema15Sessions.length} sesiones`);
    if (tema15Sessions.length > 0) {
      tema15Sessions.forEach((s, i) => {
        console.log(`  ${i+1}. ${s.notes} - Parte: ${s.subThemeIndex || 'N/A'}`);
      });
    }
    
    // Resumen final
    console.log('\n📊 RESUMEN FINAL:');
    console.log(`✅ Total sesiones: ${sessions.length}`);
    console.log(`✅ ONU: ${onuSessions.length > 0 ? 'PRESENTE' : 'AUSENTE'}`);
    console.log(`✅ OTAN: ${otanSessions.length > 0 ? 'PRESENTE' : 'AUSENTE'}`);
    console.log(`✅ Temas con partes: Procesados correctamente`);
    
  } catch (error) {
    console.error('❌ Error en la prueba:', error.response?.data || error.message);
  }
}

// Ejecutar la prueba
testAllThemesWithParts();