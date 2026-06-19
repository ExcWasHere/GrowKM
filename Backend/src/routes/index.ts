import { OpenAPIHono } from '@hono/zod-openapi';
import userRoutes from './user.routes';
import documentRoutes from './document.routes';
import authRoutes from './auth.routes';
import chatRoutes from './chat.routes';
import opportunityRoutes from './opportunity.routes';
import financeRoutes from './finance.routes';
import { authMiddleware } from '../middlewares/auth.middleware';
import { HonoEnv } from '../types/env';

const router = new OpenAPIHono<HonoEnv>();

// Public Routes (No Auth Required)
router.route('/auth', authRoutes);

// Protected Routes
router.use('/*', authMiddleware);
router.route('/users', userRoutes);
router.route('/users', documentRoutes);
router.route('/chat', chatRoutes);
router.route('/opportunities', opportunityRoutes);
router.route('/finance', financeRoutes);

export default router;
