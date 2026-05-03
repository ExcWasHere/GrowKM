import { OpenAPIHono } from '@hono/zod-openapi';
import userRoutes from './user.routes';
import authRoutes from './auth.routes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { HonoEnv } from '../types/env';

const router = new OpenAPIHono<HonoEnv>();

// Public Routes (No Auth Required)
router.route('/auth', authRoutes);

// Protected Routes
router.use('/*', authMiddleware);

router.route('/users', userRoutes);

export default router;
