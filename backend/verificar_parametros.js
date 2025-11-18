// Verificar qué parámetros se están pasando realmente al RotationStudyService
const { addDays } = require('date-fns');

// Simular la llamada exacta desde StudyPlanService.generateSmartCalendar
console.log('🔍 VERIFICACIÓN DE PARÁMETROS AL RotationStudyService:');

// Datos del usuario
const userStartDate = '2025-11-18';
const userExamDate = '2026-10-22';
const bufferDays = 30;

console.log(`📅 Datos usuario - startDate: ${userStartDate}`);
console.log(`📅 Datos usuario - examDate: ${userExamDate}`);

// Calcular buffer (como en el controlador)
const startDate = new Date(userStartDate);
const examDate = new Date(userExamDate);
const bufferEnd = addDays(examDate, -bufferDays);

console.log(`\n📅 Parámetros que deberían pasarse al servicio:`);
console.log(`   startDate: ${startDate.toLocaleDateString()}`);
console.log(`   examDate: ${bufferEnd.toLocaleDateString()} (bufferEnd)`);

// Verificar cuántas semanas debería generar el servicio
const totalDays = Math.ceil((bufferEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const totalWeeks = Math.ceil(totalDays / 7);

console.log(`\n📊 Cálculo de semanas:`);
console.log(`   Total días: ${totalDays}`);
console.log(`   Total semanas: ${totalWeeks}`);

// Pero el usuario reporta solo 6 semanas
const userReportedEnd = new Date('2025-12-28');
const userReportedDays = Math.ceil((userReportedEnd.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
const userReportedWeeks = Math.ceil(userReportedDays / 7);

console.log(`\n🚨 LO QUE REPORTA EL USUARIO:`);
console.log(`   Usuario reporta que llega hasta: ${userReportedEnd.toLocaleDateString()}`);
console.log(`   Días reportados: ${userReportedDays}`);
console.log(`   Semanas reportadas: ${userReportedWeeks}`);

// Calcular qué fecha de examen generaría solo 6 semanas
const sixWeeksInDays = 6 * 7;
const sixWeeksEndDate = addDays(startDate, sixWeeksInDays);

console.log(`\n🔍 HIPÓTESIS - Si el sistema usara esta fecha de examen:`);
console.log(`   Fecha que generaría 6 semanas: ${sixWeeksEndDate.toLocaleDateString()}`);
console.log(`   Esto es: ${sixWeeksInDays} días después del inicio`);

// Verificar si hay algún problema con el buffer
const wrongBufferEnd = addDays(startDate, sixWeeksInDays);
const wrongExamDate = addDays(wrongBufferEnd, bufferDays);

console.log(`\n🚨 HIPÓTESIS - Si el buffer se calculó mal:`);
console.log(`   Buffer end incorrecto: ${wrongBufferEnd.toLocaleDateString()}`);
console.log(`   Examen resultante: ${wrongExamDate.toLocaleDateString()}`);

// Comparar con lo que debería ser
console.log(`\n📊 COMPARACIÓN:`);
console.log(`   Buffer end correcto: ${bufferEnd.toLocaleDateString()}`);
console.log(`   Buffer end que da 6 semanas: ${wrongBufferEnd.toLocaleDateString()}`);
console.log(`   Diferencia: ${Math.ceil((bufferEnd.getTime() - wrongBufferEnd.getTime()) / (1000 * 60 * 60 * 24))} días`);