import sequelize from '../config/database';
import { StudyPlan, StudySession, Theme } from '../models';

async function run() {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a BD OK');

    const plan = await StudyPlan.findOne({
      where: { status: 'ACTIVE' },
      order: [['createdAt', 'DESC']]
    } as any);

    if (!plan) {
      console.log('❌ No hay plan ACTIVO');
      return;
    }

    console.log(`📅 Plan activo: ID=${plan.id} usuario=${plan.userId} inicio=${plan.startDate} examen=${plan.examDate}`);

    const sessions = await StudySession.findAll({
      where: { studyPlanId: plan.id },
      order: [['scheduledDate', 'ASC']],
      include: [{ model: Theme as any, as: 'theme', attributes: ['id', 'block', 'themeNumber', 'title', 'parts'] }]
    } as any);

    console.log(`📈 Total sesiones: ${sessions.length}`);

    const countByTheme = new Map<number, { title: string; sessions: number; hours: number; parts: number }>();
    const presentIds = new Set<number>();
    let onuSessions = 0, otanSessions = 0;

    sessions.forEach(s => {
      const themeId = s.themeId;
      presentIds.add(themeId);
      const title = (s as any).theme?.title || `Tema ${themeId}`;
      const parts = (s as any).theme?.parts || 1;
      const hours = parseFloat(String(s.scheduledHours));
      const prev = countByTheme.get(themeId) || { title, sessions: 0, hours: 0, parts };
      prev.sessions += 1;
      prev.hours += isNaN(hours) ? 0 : hours;
      countByTheme.set(themeId, prev);

      if (themeId === 17 || /\b(onu|naciones unidas)\b/i.test(title)) onuSessions++;
      if (themeId === 18 || /\b(otan|atl[aá]ntico norte)\b/i.test(title)) otanSessions++;
    });

    console.log('\n📋 Resumen por tema:');
    Array.from(countByTheme.entries()).sort((a,b)=>a[0]-b[0]).forEach(([id, data]) => {
      console.log(`   [${id}] ${data.title} | sesiones=${data.sessions} horas=${data.hours.toFixed(1)} parts=${data.parts}`);
    });

    console.log('\n🔎 Presencia ONU/OTAN:');
    console.log(`   ONU (ID 17): ${presentIds.has(17) ? '✅ presente' : '❌ ausente'} | sesiones=${onuSessions}`);
    console.log(`   OTAN (ID 18): ${presentIds.has(18) ? '✅ presente' : '❌ ausente'} | sesiones=${otanSessions}`);

    const sampleWithParts = sessions.filter(s => !!s.subThemeIndex).slice(0, 5);
    console.log('\n🧩 Muestras con partes (subThemeIndex/subThemeLabel):');
    sampleWithParts.forEach(s => {
      console.log(`   ${s.scheduledDate.toISOString().split('T')[0]} | Tema ${s.themeId} ${((s as any).theme?.title)||''} | Parte=${s.subThemeIndex} ${s.subThemeLabel||''} | Nota=${(s.notes||'').toString().substring(0,80)}`);
    });
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await sequelize.close();
  }
}

run();