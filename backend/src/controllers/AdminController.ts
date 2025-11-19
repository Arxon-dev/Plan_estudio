import { Request, Response } from 'express';
import User from '@models/User';
import StudyPlan from '@models/StudyPlan';
import StudySession from '@models/StudySession';
import { Op } from 'sequelize';

/**
 * Controlador para funcionalidades de administración
 */
class AdminController {
  /**
   * Obtiene estadísticas generales de la aplicación
   */
  async getStatistics(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      // Verificar que el usuario es administrador
      const user = await User.findByPk(userId);
      if (!user || !user.isAdmin) {
        res.status(403).json({ message: 'Acceso denegado. Solo administradores.' });
        return;
      }

      // Calcular fechas
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today);
      weekAgo.setDate(weekAgo.getDate() - 7);
      const monthAgo = new Date(today);
      monthAgo.setMonth(monthAgo.getMonth() - 1);

      // Estadísticas de usuarios
      const totalUsers = await User.count();
      const usersToday = await User.count({
        where: {
          createdAt: {
            [Op.gte]: today,
          },
        },
      });
      const usersThisWeek = await User.count({
        where: {
          createdAt: {
            [Op.gte]: weekAgo,
          },
        },
      });
      const usersThisMonth = await User.count({
        where: {
          createdAt: {
            [Op.gte]: monthAgo,
          },
        },
      });

      // Estadísticas de planes
      const totalPlans = await StudyPlan.count();
      const activePlans = await StudyPlan.count({
        where: {
          examDate: {
            [Op.gte]: today,
          },
        },
      });
      const usersWithPlans = await StudyPlan.count({
        distinct: true,
        col: 'userId',
      });

      // Estadísticas de sesiones
      const totalSessions = await StudySession.count();
      const completedSessions = await StudySession.count({
        where: { status: 'COMPLETED' },
      });
      const pendingSessions = await StudySession.count({
        where: { status: 'PENDING' },
      });

      // Registros por día (últimos 30 días)
      const registrationsByDay = await User.findAll({
        attributes: [
          [User.sequelize!.fn('DATE', User.sequelize!.col('createdAt')), 'date'],
          [User.sequelize!.fn('COUNT', User.sequelize!.col('id')), 'count'],
        ],
        where: {
          createdAt: {
            [Op.gte]: monthAgo,
          },
        },
        group: [User.sequelize!.fn('DATE', User.sequelize!.col('createdAt'))],
        order: [[User.sequelize!.fn('DATE', User.sequelize!.col('createdAt')), 'ASC']],
        raw: true,
      });

      // Usuarios más activos (top 10 por número de sesiones)
      const [topUsers] = await StudySession.sequelize!.query(`
        SELECT 
          sp.userId,
          COUNT(ss.id) as sessionCount
        FROM study_sessions ss
        INNER JOIN study_plans sp ON ss.studyPlanId = sp.id
        GROUP BY sp.userId
        ORDER BY sessionCount DESC
        LIMIT 10
      `);

      // Obtener detalles de los usuarios más activos
      const topUserIds = (topUsers as any[]).map((u: any) => u.userId);
      const topUsersDetails = await User.findAll({
        where: {
          id: topUserIds,
        },
        attributes: ['id', 'firstName', 'lastName', 'email', 'createdAt'],
      });

      const topUsersWithStats = (topUsers as any[]).map((stat: any) => {
        const userDetail = topUsersDetails.find((u) => u.id === stat.userId);
        return {
          userId: stat.userId,
          sessionCount: Number(stat.sessionCount),
          firstName: userDetail?.firstName,
          lastName: userDetail?.lastName,
          email: userDetail?.email,
        };
      });

      res.json({
        users: {
          total: totalUsers,
          today: usersToday,
          thisWeek: usersThisWeek,
          thisMonth: usersThisMonth,
          withPlans: usersWithPlans,
          registrationsByDay,
        },
        plans: {
          total: totalPlans,
          active: activePlans,
        },
        sessions: {
          total: totalSessions,
          completed: completedSessions,
          pending: pendingSessions,
          completionRate: totalSessions > 0 ? ((completedSessions / totalSessions) * 100).toFixed(1) : 0,
        },
        topUsers: topUsersWithStats,
      });
    } catch (error) {
      console.error('Error al obtener estadísticas de admin:', error);
      res.status(500).json({ message: 'Error al obtener estadísticas' });
    }
  }

  /**
   * Verifica si el usuario actual es administrador
   */
  async checkAdminStatus(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user?.id;

      const user = await User.findByPk(userId);
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.json({
        isAdmin: user.isAdmin || false,
      });
    } catch (error) {
      console.error('Error al verificar estado de admin:', error);
      res.status(500).json({ message: 'Error al verificar estado de admin' });
    }
  }
}

export default new AdminController();
