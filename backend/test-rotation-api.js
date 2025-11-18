const axios = require('axios');

async function testRotation() {
  try {
    console.log('🔄 Probando sistema de rotación...');
    
    // Esperar un momento para que el servidor esté listo
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzNDcyMTQ3LCJleHAiOjE3NjQwNzY5NDd9.zUoaqhq9GRb2awNH7n-_gPRRB5C5TEgbJhM01XnT0hE';

    // 0) Eliminar plan activo
    try {
      console.log('🗑️ Eliminando plan activo...');
      await axios.delete('http://localhost:3000/api/study-plans/active', {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      console.log('✅ Plan activo eliminado');
    } catch (delErr) {
      if (delErr.response?.status === 404) {
        console.log('ℹ️ No había plan activo para eliminar');
      } else {
        console.log('⚠️ Error al eliminar plan activo:', delErr.response?.status, delErr.response?.data || delErr.message);
      }
    }

    const themesResp = await axios.get('http://localhost:3000/api/themes', {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });

    const allThemes = themesResp.data.themes.map(t => ({
      id: t.id,
      title: t.title,
      hours: Math.max(6, Number(t.estimatedHours || 6)),
      priority: 1
    }));

    const response = await axios.post('http://localhost:3000/api/study-plans', {
      startDate: '2025-11-18',
      examDate: '2026-10-22',
      weeklySchedule: {
        monday: 4,
        tuesday: 4,
        wednesday: 4,
        thursday: 4,
        friday: 6,
        saturday: 8,
        sunday: 0
      },
      themes: allThemes
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${TOKEN}`
      }
    });

    console.log('✅ Plan creado exitosamente');
    console.log('📊 Plan ID:', response.data.plan.id);
    // Esperar generación asíncrona
    console.log('⏳ Esperando generación (poll 10s x3)...');
    for (let i = 0; i < 3; i++) {
      await new Promise(resolve => setTimeout(resolve, 10000));
      const statusPoll = await axios.get(`http://localhost:3000/api/study-plans/${response.data.plan.id}/status`, {
        headers: { 'Authorization': `Bearer ${TOKEN}` }
      });
      console.log(`📈 Estado intento ${i+1}:`, statusPoll.data);
      if ((statusPoll.data.totalSessions || 0) > 0) break;
    }
    const statusResp = await axios.get(`http://localhost:3000/api/study-plans/${response.data.plan.id}/status`, {
      headers: { 'Authorization': `Bearer ${TOKEN}` }
    });
    console.log('📈 Estado de generación:', statusResp.data);
    
    const sessionsResponse = await axios.get(`http://localhost:3000/api/study-plans/${response.data.plan.id}/sessions`, {
      headers: {
        'Authorization': `Bearer ${TOKEN}`
      }
    });
    
    const sessions = sessionsResponse.data.sessions;
    console.log(`✅ ${sessions.length} sesiones generadas`);
    // Comprobación de presencia de ONU/OTAN
    const titles = sessions.map(s => (s.theme?.title || '').toLowerCase());
    const hasONU = titles.some(t => t.includes('naciones unidas'));
    const hasOTAN = titles.some(t => t.includes('atlántico norte')) || titles.some(t => t.includes('otan'));
    console.log('🔍 ONU en sesiones:', hasONU);
    console.log('🔍 OTAN en sesiones:', hasOTAN);
    // Comprobación de ausencia en martes/miércoles
    const byDay = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0 };
    sessions.forEach(s => { const d = new Date(s.scheduledDate).getDay(); byDay[d] = (byDay[d]||0)+1; });
    console.log('📅 Sesiones por día:', {
      domingo: byDay[0], lunes: byDay[1], martes: byDay[2], miercoles: byDay[3], jueves: byDay[4], viernes: byDay[5], sabado: byDay[6]
    });
    // Detectar semanas con huecos martes/miércoles
    const weeksWithGaps = [];
    const start = new Date('2025-11-18');
    function weekKey(date){
      const dt = new Date(date); const diff = Math.floor((dt - start)/(1000*60*60*24)); const w = Math.floor(diff/7); return w;
    }
    const weekDays = new Map();
    sessions.forEach(s => {
      const w = weekKey(s.scheduledDate);
      const d = new Date(s.scheduledDate).getDay();
      if (!weekDays.has(w)) weekDays.set(w, new Set());
      weekDays.get(w).add(d);
    });
    weekDays.forEach((set, w) => {
      const missingTuesday = !set.has(2);
      const missingWednesday = !set.has(3);
      if (missingTuesday || missingWednesday) {
        weeksWithGaps.push({ week: w+1, missingTuesday, missingWednesday });
      }
    });
    console.log('🧭 Semanas con huecos martes/miércoles:', weeksWithGaps.slice(0, 10));

    if (sessions.length > 0) {
      const firstDate = new Date(Math.min(...sessions.map(s => new Date(s.lastStudied).getTime())));
      const lastDate = new Date(Math.max(...sessions.map(s => new Date(s.lastStudied).getTime())));
      
      console.log('📅 Primera sesión:', firstDate.toISOString().split('T')[0]);
      console.log('📅 Última sesión:', lastDate.toISOString().split('T')[0]);
      
      // Calcular días totales entre las fechas
      const start = new Date('2025-11-18');
      const end = new Date('2026-10-22');
      const totalDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      const coveredDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      console.log('📊 Análisis de cobertura:');
      console.log(`   - Días solicitados: ${totalDays}`);
      console.log(`   - Días cubiertos: ${coveredDays}`);
      console.log(`   - Cobertura: ${((coveredDays / totalDays) * 100).toFixed(1)}%`);
      
      if (coveredDays >= totalDays * 0.95) {
        console.log('✅ COBERTURA COMPLETA - El sistema cubre casi todos los días solicitados');
      } else {
        console.log('⚠️ COBERTURA INCOMPLETA - Faltan días por cubrir');
      }
      
      // Verificar distribución por temas
      const themeDistribution = {};
      sessions.forEach(session => {
        const themeName = session.theme.title;
        themeDistribution[themeName] = (themeDistribution[themeName] || 0) + 1;
      });
      
      console.log('📊 Distribución por temas:');
      Object.entries(themeDistribution).forEach(([theme, count]) => {
        console.log(`   - ${theme}: ${count} sesiones`);
      });
      
      // Mostrar primeras 5 sesiones como ejemplo
      console.log('📋 Primeras 5 sesiones:');
      sessions.slice(0, 5).forEach((session, index) => {
        console.log(`   ${index + 1}. ${session.lastStudied.split('T')[0]} - ${session.theme.title} (${session.hours}h)`);
      });
      
    }

  } catch (error) {
    console.error('❌ Error:', error.response?.status, error.response?.data || error.message);
  }
}

testRotation();