import { Hono } from 'hono';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { HonoEnv } from './types/env';

const app = new Hono<HonoEnv>();

app.use('*', logger());
app.use('*', cors());
app.onError(errorHandler);

app.route('/api', apiRoutes);

app.get('/health', (c) => {
    return c.json({ status: 'ok', message: 'GrowKM API is running' });
});

export default app;
