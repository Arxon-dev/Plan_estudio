import { Request, Response } from 'express';
import User from '@models/User';
import StudyPlan from '@models/StudyPlan';
import StudySession from '@models/StudySession';
import UserAuditLog from '@models/UserAuditLog';
import UserTestStats from '@models/UserTestStats';
import ThemeProgress from '@models/ThemeProgress';
import TestAttempt from '@models/TestAttempt';
import Theme from '@models/Theme';
import SettingsService from '../services/SettingsService';
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
  /**
   * Obtener todas las configuraciones del sistema
   */
  async getSettings(req: Request, res: Response): Promise<void> {
    try {
      const result = await SettingsService.getAll();
      res.json(result);
    } catch (error) {
      console.error('Error al obtener configuraciones:', error);
      res.status(500).json({ message: 'Error al obtener configuraciones' });
    }
  }

  /**
   * Actualizar configuraciones del sistema
   */
  async updateSettings(req: Request, res: Response): Promise<void> {
    try {
      const { settings } = req.body;

      if (!Array.isArray(settings)) {
        res.status(400).json({ message: 'Formato inválido. Se espera un array de configuraciones.' });
        return;
      }

      await SettingsService.updateBulk(settings);

      res.json({ message: 'Configuraciones actualizadas correctamente' });
    } catch (error) {
      console.error('Error al actualizar configuraciones:', error);
      res.status(500).json({ message: 'Error al actualizar configuraciones' });
    }
  }
  /**
   * Obtener lista de usuarios con filtros y paginación
   */
  async getUsers(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const search = req.query.search as string;
      const role = req.query.role as string; // 'admin' | 'user'
      const isPremium = req.query.isPremium as string; // 'true' | 'false'

      const whereClause: any = {};

      // Filtro de búsqueda (nombre o email)
      if (search) {
        whereClause[Op.or] = [
          { firstName: { [Op.like]: `%${search}%` } },
          { lastName: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
        ];
      }

      // Filtro por rol
      if (role === 'admin') {
        whereClause.isAdmin = true;
      } else if (role === 'user') {
        whereClause.isAdmin = false;
      }

      // Filtro por premium
      if (isPremium === 'true') {
        whereClause.isPremium = true;
      } else if (isPremium === 'false') {
        whereClause.isPremium = false;
      }

      const { count, rows } = await User.findAndCountAll({
        where: whereClause,
        limit,
        offset,
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'firstName', 'lastName', 'email', 'isAdmin', 'isPremium', 'createdAt', 'subscriptionStatus'],
      });

      res.json({
        users: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit),
      });
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      res.status(500).json({ message: 'Error al obtener usuarios' });
    }
  }

  /**
   * Obtener detalles de un usuario por ID
   */
  async getUserById(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: { exclude: ['password'] },
      });

      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      res.status(500).json({ message: 'Error al obtener usuario' });
    }
  }

  /**
   * Actualizar usuario y registrar log
   */
  async updateUser(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { role, isPremium, isBanned, adminNotes, banReason } = req.body;
      const adminId = (req as any).user?.id;

      const user = await User.findByPk(id);
      if (!user) {
        res.status(404).json({ message: 'Usuario no encontrado' });
        return;
      }

      const changes: string[] = [];
      const oldValues: any = {};

      if (role !== undefined) {
        const isAdmin = role === 'admin';
        if (user.isAdmin !== isAdmin) {
          changes.push(`Rol cambiado de ${user.isAdmin ? 'Admin' : 'Alumno'} a ${isAdmin ? 'Admin' : 'Alumno'}`);
          oldValues.isAdmin = user.isAdmin;
          user.isAdmin = isAdmin;
        }
      }

      if (isPremium !== undefined) {
        if (user.isPremium !== isPremium) {
          changes.push(`Premium cambiado de ${user.isPremium ? 'Sí' : 'No'} a ${isPremium ? 'Sí' : 'No'}`);
          oldValues.isPremium = user.isPremium;
          user.isPremium = isPremium;
        }
      }

      if (isBanned !== undefined) {
        if (user.isBanned !== isBanned) {
          changes.push(`Estado cambiado de ${user.isBanned ? 'Baneado' : 'Activo'} a ${isBanned ? 'Baneado' : 'Activo'}`);
          oldValues.isBanned = user.isBanned;
          user.isBanned = isBanned;

          // Si se banea, guardar razón
          if (isBanned && banReason) {
            changes.push(`Razón de baneo: ${banReason}`);
            user.banReason = banReason;
          } else if (!isBanned) {
            // Si se desbanea, limpiar razón
            user.banReason = null;
          }
        }
      }

      if (adminNotes !== undefined) {
        if (user.adminNotes !== adminNotes) {
          changes.push('Notas de administrador actualizadas');
          oldValues.adminNotes = user.adminNotes;
          user.adminNotes = adminNotes;
        }
      }

      if (changes.length > 0) {
        await user.save();

        // Crear log de auditoría
        await UserAuditLog.create({
          userId: user.id,
          action: 'UPDATE_USER',
          changedBy: adminId,
          details: JSON.stringify({
            changes,
            oldValues,
            newValues: { isAdmin: user.isAdmin, isPremium: user.isPremium, isBanned: user.isBanned, adminNotes: user.adminNotes, banReason: user.banReason }
          }),
        });
      }

      res.json({ message: 'Usuario actualizado correctamente', user });
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      res.status(500).json({ message: 'Error al actualizar usuario' });
    }
  }

  /**
   * Obtener historial de cambios de un usuario
   */
  async getUserLogs(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const logs = await UserAuditLog.findAll({
        where: { userId: id },
        include: [
          {
            model: User,
            as: 'editor',
            attributes: ['id', 'firstName', 'lastName', 'email'],
          },
        ],
        order: [['createdAt', 'DESC']],
      });

      res.json(logs);
    } catch (error) {
      console.error('Error al obtener logs:', error);
      res.status(500).json({ message: 'Error al obtener logs' });
    }
  }

  /**
   * Obtener progreso detallado de un usuario
   */
  async getUserProgress(req: Request, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      // 1. Obtener estadísticas generales
      const stats = await UserTestStats.findOne({ where: { userId: id } });

      // 2. Obtener progreso por temas
      const themeProgress = await ThemeProgress.findAll({
        where: { userId: id },
        include: [{ model: Theme, as: 'theme', attributes: ['id', 'title', 'block', 'themeNumber'] }],
      });

      // 3. Obtener últimos tests
      const recentTests = await TestAttempt.findAll({
        where: { userId: id },
        limit: 10,
        order: [['createdAt', 'DESC']],
        include: [{ model: Theme, as: 'theme', attributes: ['title'] }],
      });

      const recentTestsFormatted = recentTests.map((test: any) => ({
        ...test.toJSON(),
        score: Number(test.score),
      }));

      // 4. Calcular estadísticas por bloque
      const blockStats: any = {
        ORGANIZACION: { total: 0, mastered: 0, avgScore: 0, count: 0 },
        JURIDICO_SOCIAL: { total: 0, mastered: 0, avgScore: 0, count: 0 },
        SEGURIDAD_NACIONAL: { total: 0, mastered: 0, avgScore: 0, count: 0 },
      };

      themeProgress.forEach((tp: any) => {
        const block = tp.theme?.block;
        if (block && blockStats[block]) {
          blockStats[block].total++;
          if (tp.masteryLevel >= 80) blockStats[block].mastered++;
          blockStats[block].avgScore += Number(tp.averageScore);
          blockStats[block].count++;
        }
      });

      // Normalizar promedios
      Object.keys(blockStats).forEach((key) => {
        if (blockStats[key].count > 0) {
          blockStats[key].avgScore = (blockStats[key].avgScore / blockStats[key].count).toFixed(2);
        }
      });

      res.json({
        stats,
        blockStats,
        recentTests: recentTestsFormatted,
        totalThemes: themeProgress.length,
        masteredThemes: themeProgress.filter((tp) => tp.masteryLevel >= 80).length,
      });
    } catch (error) {
      console.error('Error al obtener progreso:', error);
      res.status(500).json({ message: 'Error al obtener progreso del usuario' });
    }
  }

  /**
   * Probar conexión con proveedor de IA
   */
  async testAIConnection(req: Request, res: Response): Promise<void> {
    try {
      const { provider, apiKey, model } = req.body;

      if (!provider || !apiKey) {
        res.status(400).json({ message: 'Proveedor y API Key son requeridos' });
        return;
      }

      const axios = require('axios');
      let success = false;
      let message = 'Conexión exitosa';
      let detectedModel = model;

      try {
        if (provider === 'openai' || provider === 'deepseek' || provider === 'glm' || provider === 'perplexity') {
          let apiUrl = 'https://api.openai.com/v1/chat/completions';
          if (provider === 'deepseek') apiUrl = 'https://api.deepseek.com/chat/completions';
          if (provider === 'glm') apiUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
          if (provider === 'perplexity') apiUrl = 'https://api.perplexity.ai/chat/completions';

          await axios.post(
            apiUrl,
            {
              model: model || 'gpt-3.5-turbo', // Fallback model for test
              messages: [{ role: 'user', content: 'Hi' }],
              max_tokens: 5
            },
            {
              headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
            }
          );
          success = true;
        } else if (provider === 'claude') {
          await axios.post(
            'https://api.anthropic.com/v1/messages',
            {
              model: model || 'claude-3-opus-20240229',
              max_tokens: 5,
              messages: [{ role: 'user', content: 'Hi' }]
            },
            {
              headers: { 'x-api-key': apiKey, 'anthropic-version': '2023-06-01', 'Content-Type': 'application/json' }
            }
          );
          success = true;
        } else if (provider === 'gemini') {
          const url = `https://generativelanguage.googleapis.com/v1beta/models/${model || 'gemini-pro'}:generateContent?key=${apiKey}`;
          await axios.post(url, { contents: [{ parts: [{ text: 'Hi' }] }] });
          success = true;
        } else {
          throw new Error('Proveedor no soportado para pruebas');
        }
      } catch (e: any) {
        console.error('Error testing AI connection:', e.response?.data || e.message);
        success = false;
        message = e.response?.data?.error?.message || e.message || 'Error de conexión';
      }

      if (success) {
        res.json({ success: true, message: 'Conexión exitosa', model: detectedModel });
      } else {
        res.status(400).json({ success: false, message });
      }

    } catch (error) {
      console.error('Error testing AI connection:', error);
      res.status(500).json({ message: 'Error interno al probar conexión' });
    }
  }
}

export default new AdminController();
