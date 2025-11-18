const axios = require('axios');

async function run() {
  const API = 'http://localhost:3000/api';
  const TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUsImVtYWlsIjoiY2FybG9zLm9wb21lbGlsbGFAZ21haWwuY29tIiwiaWF0IjoxNzYzNDc1Mjg4LCJleHAiOjE3NjM1NjE2ODh9.AzMI3lfXUpxeiH6EdV2uLFZb9GLxBdeTF7K3R52fgak';
  const headers = { Authorization: `Bearer ${TOKEN}` };
  try {
    await new Promise(r => setTimeout(r, 2000));
    try {
      console.log('🗑️ Eliminando plan activo...');
      const del = await axios.delete(`${API}/study-plans/active`, { headers });
      console.log('✅ Eliminado:', del.data);
    } catch (e) {
      console.log('ℹ️ Eliminar:', e.response?.status || e.message, e.response?.data || '');
    }

    console.log('📚 Obteniendo temas...');
    const themesResp = await axios.get(`${API}/themes`, { headers });
    const themes = themesResp.data.themes.map(t => ({ id: t.id, title: t.title, hours: Math.max(6, Number(t.estimatedHours || 6)), priority: 1 }));
    console.log('✅ Temas:', themes.length);
    console.log('🔍 ONU:', themesResp.data.themes.some(t => /naciones unidas/i.test(t.title)), 'OTAN:', themesResp.data.themes.some(t => /(atlántico norte|otan)/i.test(t.title)));

    console.log('📝 Creando plan...');
    const weeklySchedule = { monday: 4, tuesday: 4, wednesday: 4, thursday: 4, friday: 6, saturday: 8, sunday: 0 };
    const create = await axios.post(`${API}/study-plans`, {
      startDate: '2025-11-18',
      examDate: '2026-10-22',
      weeklySchedule,
      themes
    }, { headers: { ...headers, 'Content-Type': 'application/json' } });
    const planId = create.data.plan.id;
    console.log('✅ Plan ID:', planId);

    for (let i = 0; i < 6; i++) {
      await new Promise(r => setTimeout(r, 5000));
      const status = await axios.get(`${API}/study-plans/${planId}/status`, { headers });
      console.log(`📈 Status ${i+1}:`, status.data);
      if ((status.data.totalSessions || 0) > 0) break;
    }

    const sessionsResp = await axios.get(`${API}/study-plans/${planId}/sessions`, { headers });
    const sessions = sessionsResp.data.sessions || [];
    console.log('📊 Sesiones:', sessions.length);

    const titles = sessions.map(s => (s.theme?.title || '').toLowerCase());
    console.log('🔍 ONU en sesiones:', titles.some(t => t.includes('naciones unidas')));
    console.log('🔍 OTAN en sesiones:', titles.some(t => t.includes('atlántico norte')) || titles.some(t => t.includes('otan')));
    const countByDay = { 0:0,1:0,2:0,3:0,4:0,5:0,6:0 };
    sessions.forEach(s => { const d = new Date(s.scheduledDate).getDay(); countByDay[d] = (countByDay[d]||0)+1; });
    console.log('📅 Por día:', { domingo: countByDay[0], lunes: countByDay[1], martes: countByDay[2], miercoles: countByDay[3], jueves: countByDay[4], viernes: countByDay[5], sabado: countByDay[6] });
    const expectedDays = [weeklySchedule.sunday>0, weeklySchedule.monday>0, weeklySchedule.tuesday>0, weeklySchedule.wednesday>0, weeklySchedule.thursday>0, weeklySchedule.friday>0, weeklySchedule.saturday>0];
    const missing = [];
    const names = ['domingo','lunes','martes','miercoles','jueves','viernes','sabado'];
    for (let i=0;i<7;i++){ if (expectedDays[i] && (countByDay[i]||0)===0) missing.push(names[i]); }
    console.log('✅ Días esperados con sesiones:', names.filter((_,i)=>expectedDays[i]));
    console.log('⚠️ Días esperados SIN sesiones:', missing);
  } catch (err) {
    console.log('❌ Error:', err.response?.status || '', err.response?.data || err.message);
  }
}

run();