import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { User } from '@models/index';

export class AuthController {
  // Registro de usuario
  static async register(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password, firstName, lastName } = req.body;

      // Verificar si el usuario ya existe
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        res.status(400).json({ error: 'El email ya está registrado' });
        return;
      }

      // Crear usuario
      const user = await User.create({
        email,
        password,
        firstName,
        lastName,
      });

      // Generar token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
      );

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
          stripeCustomerId: user.stripeCustomerId,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionEndDate: user.subscriptionEndDate,
        },
        token,
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  }

  // Login de usuario
  static async login(req: Request, res: Response): Promise<void> {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({ errors: errors.array() });
        return;
      }

      const { email, password } = req.body;

      // Buscar usuario
      const user = await User.findOne({ where: { email } });
      if (!user) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      // Validar contraseña
      const isValidPassword = await user.validatePassword(password);
      if (!isValidPassword) {
        res.status(401).json({ error: 'Credenciales inválidas' });
        return;
      }

      // Generar token
      const token = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET as string,
        { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as any
      );

      res.json({
        message: 'Login exitoso',
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          isPremium: user.isPremium,
          isAdmin: user.isAdmin,
          stripeCustomerId: user.stripeCustomerId,
          subscriptionStatus: user.subscriptionStatus,
          subscriptionEndDate: user.subscriptionEndDate,
        },
        token,
      });
    } catch (error) {
      console.error('Error en login:', error);
      res.status(500).json({ error: 'Error al iniciar sesión' });
    }
  }

  // Obtener perfil del usuario autenticado
  static async getProfile(req: any, res: Response): Promise<void> {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: [
          'id',
          'email',
          'firstName',
          'lastName',
          'createdAt',
          'isPremium',
          'isAdmin',
          'stripeCustomerId',
          'subscriptionStatus',
          'subscriptionEndDate',
          'hasUsedTrial'
        ],
      });

      if (!user) {
        res.status(404).json({ error: 'Usuario no encontrado' });
        return;
      }

      res.json({ user });
    } catch (error) {
      console.error('Error al obtener perfil:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
}
