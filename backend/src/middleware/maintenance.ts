import { Request, Response, NextFunction } from 'express';
import SettingsService from '../services/SettingsService';
import jwt from 'jsonwebtoken';
import User from '../models/User';

export const maintenanceMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // 1. Rutas siempre permitidas (Whitelist)
        const allowedPaths = [
            '/api/auth/login',
            '/api/auth/validate',
            '/api/auth/logout',
            '/api/announcements/active',
            '/api/payments'
        ];

        if (allowedPaths.some(path => req.path.startsWith(path))) {
            return next();
        }

        // 2. Verificar si el modo mantenimiento está activo
        const isMaintenance = await SettingsService.get('MAINTENANCE_MODE', false);

        if (!isMaintenance) {
            return next();
        }

        // 3. Si está en mantenimiento, verificar si es admin (Bypass)
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '');
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as { id: number };
                const user = await User.findByPk(decoded.id);

                if (user && user.isAdmin) {
                    return next();
                }
            } catch (error) {
                // Token inválido o expirado, continuar al bloqueo
            }
        }

        // 4. Bloquear acceso
        return res.status(503).json({
            message: 'El sistema se encuentra en mantenimiento. Por favor, inténtelo más tarde.',
            maintenance: true
        });

    } catch (error) {
        console.error('Error en maintenanceMiddleware:', error);
        next(); // En caso de error crítico, permitimos el paso
    }
};
