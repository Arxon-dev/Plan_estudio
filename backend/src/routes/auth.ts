import { Router } from 'express';
import { body } from 'express-validator';
import { AuthController } from '@controllers/AuthController';
import { authMiddleware } from '@middleware/auth';

const router = Router();

// Registro
router.post(
  '/register',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').isLength({ min: 6 }).withMessage('La contraseña debe tener al menos 6 caracteres'),
    body('firstName').notEmpty().withMessage('El nombre es requerido'),
    body('lastName').notEmpty().withMessage('El apellido es requerido'),
  ],
  AuthController.register
);

// Login
router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Email inválido'),
    body('password').notEmpty().withMessage('La contraseña es requerida'),
  ],
  AuthController.login
);

// Obtener perfil (protegido)
router.get('/profile', authMiddleware, AuthController.getProfile);

export default router;
