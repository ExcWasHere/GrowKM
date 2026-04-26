import { Hono } from 'hono';
import * as userController from '../controllers/user.controller';

const userRoutes = new Hono();

// GET /api/users/me
userRoutes.get('/me', userController.handleGetMe);

// POST /api/users/business-profile 
userRoutes.post('/business-profile', userController.handleUpsertBusinessProfile);

export default userRoutes;
