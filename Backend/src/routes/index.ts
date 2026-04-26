import { Hono } from 'hono';
import userRoutes from './user.routes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { HonoEnv } from '../types/env';

const router = new Hono<HonoEnv>();

router.use('/*', authMiddleware);

router.route('/users', userRoutes);

export default router;
