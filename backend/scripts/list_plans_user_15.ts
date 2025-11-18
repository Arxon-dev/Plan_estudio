import sequelize from '../src/config/database';
import { StudyPlan, StudySession, WeeklySchedule, PlanStatus } from '../src/models';

async function main() {
  try {
    await sequelize.authenticate();
    const userId = 15;
    const plans = await StudyPlan.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']],
      include: [{ model: WeeklySchedule, as: 'weeklySchedule' }]
    } as any);

    const result: any[] = [];
    for (const p of plans) {
      const sessionsCount = await StudySession.count({ where: { studyPlanId: p.id } });
      result.push({
        id: p.id,
        status: p.status,
        startDate: p.startDate,
        examDate: p.examDate,
        createdAt: p.createdAt,
        sessions: sessionsCount,
      });
    }
    console.log(JSON.stringify({ count: plans.length, plans: result }, null, 2));
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await sequelize.close();
  }
}

main();