const { RotationStudyService } = require('./backend/src/services/RotationStudyService');

const themes = [
  { id: 15, title: 'Tema 15 – Seguridad Nacional', block: 'SEGURIDAD_NACIONAL', complexity: 3 },
  { id: 16, title: 'Tema 16 – PDC-01(B) Doctrina', block: 'SEGURIDAD_NACIONAL', complexity: 3 },
  { id: 17, title: 'Tema 17 – Organización de las Naciones Unidas (ONU)', block: 'SEGURIDAD_NACIONAL', complexity: 2 },
  { id: 18, title: 'Tema 18 – Organización del Tratado del Atlántico Norte (OTAN)', block: 'SEGURIDAD_NACIONAL', complexity: 2 },
  { id: 19, title: 'Tema 19 – OSCE', block: 'SEGURIDAD_NACIONAL', complexity: 2 },
  { id: 20, title: 'Tema 20 – Unión Europea (UE)', block: 'SEGURIDAD_NACIONAL', complexity: 2 },
  { id: 1, title: 'Tema 1 – Constitución', block: 'ORGANIZACION', complexity: 3 },
  { id: 2, title: 'Tema 2 – Defensa Nacional', block: 'ORGANIZACION', complexity: 2 }
];

const weeklySchedule = {
  monday: 2,
  tuesday: 2,
  wednesday: 2,
  thursday: 2,
  friday: 2,
  saturday: 0,
  sunday: 0
};

const startDate = new Date('2025-11-18');
const examDate = new Date('2026-10-22');

console.log('🔄 Probando sistema de rotación...');
console.log(`📅 Período: ${startDate.toLocaleDateString()} → ${examDate.toLocaleDateString()}`);

const rotationPlan = RotationStudyService.createRotationGroups(
  themes,
  weeklySchedule,
  startDate,
  examDate
);

console.log(`📊 Total de semanas generadas: ${rotationPlan.length}`);

// Verificar distribución por semanas
rotationPlan.forEach((weekSessions, index) => {
  const weekStart = new Date(startDate);
  weekStart.setDate(startDate.getDate() + (index * 7));
  console.log(`Semana ${index + 1} (${weekStart.toLocaleDateString()}): ${weekSessions.length} sesiones`);
});

const firstWeekThemes = new Set(rotationPlan[0].map(s => s.themeId));
console.log('Temas presentes en la primera semana:', Array.from(firstWeekThemes).sort((a,b)=>a-b));

const themeBlocks = new Map();
themes.forEach(t => {
  const b = t.block || 'ORGANIZACION';
  if (!themeBlocks.has(b)) themeBlocks.set(b, []);
  themeBlocks.get(b).push(t);
});
const selectedFirstWeek = RotationStudyService.selectSimultaneousThemes(
  themeBlocks.get('SEGURIDAD_NACIONAL'),
  3,
  startDate
);
console.log('Selección interna primera semana:', selectedFirstWeek.map(t => t.id));
const pinnedIds = new Set([17,18]);
const pinnedLocal = themeBlocks.get('SEGURIDAD_NACIONAL').filter(t => pinnedIds.has(t.id));
console.log('Pinned locales:', pinnedLocal.map(t=>t.id));

// Calcular cobertura total
const totalDays = Math.ceil((examDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWeeks = Math.ceil(totalDays / 7);

console.log(`📅 Días totales: ${totalDays}`);
console.log(`📅 Semanas totales necesarias: ${totalWeeks}`);
console.log(`✅ Semanas generadas: ${rotationPlan.length}`);
console.log(`📊 Cobertura: ${((rotationPlan.length / totalWeeks) * 100).toFixed(1)}%`);