import { Router } from 'express';
import { ThemeController } from '@controllers/ThemeController';
import { authMiddleware } from '@middleware/auth';

const router = Router();

// Todas las rutas están protegidas
router.use(authMiddleware);

// Obtener todos los temas (con filtro opcional por bloque)
router.get('/', ThemeController.getAllThemes);

// Obtener temas agrupados por bloque
router.get('/by-block', ThemeController.getThemesByBlock);

// Obtener tema por ID
router.get('/:id', ThemeController.getThemeById);

// Actualizar tema (admin)
router.put('/:id', ThemeController.updateTheme);

// Actualizar complejidad de todos los temas (temporal)
router.post('/update-complexity', (req, res, next) => {
  console.log('🔄 Actualizando complejidad de temas...');
  next();
}, ThemeController.updateThemesComplexity);

export default router;
