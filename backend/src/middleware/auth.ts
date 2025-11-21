import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  user?: any;
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.status(401).json({ error: 'Token no proporcionado' });
      return;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || '') as {
      id: number;
      email: string;
    };

    // Buscar usuario en la base de datos para tener datos actualizados (isPremium, etc)
    const { User } = require('../models'); // Importación dinámica para evitar ciclos
    const user = await User.findByPk(decoded.id);

    if (!user) {
      res.status(401).json({ error: 'Usuario no encontrado' });
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token inválido o expirado' });
  }
};
