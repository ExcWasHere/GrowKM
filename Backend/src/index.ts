import { OpenAPIHono } from '@hono/zod-openapi';
import { apiReference } from '@scalar/hono-api-reference';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { HonoEnv } from './types/env';

const app = new OpenAPIHono<HonoEnv>();

app.use('*', logger());
app.use('*', cors());
app.onError(errorHandler);

app.route('/api', apiRoutes);

// Register JWT Bearer Auth for Swagger/Scalar UI
app.openAPIRegistry.registerComponent('securitySchemes', 'BearerAuth', {
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT',
});


// Generate OpenAPI JSON
app.doc('/openapi.json', {
    openapi: '3.0.0',
    info: {
        version: '1.0.0',
        title: 'GrowKM API',
        description: 'GrowKM Backend API Services',
    },
});

// Serve Scalar UI
app.get('/reference', apiReference({
    url: '/openapi.json',
    theme: 'kepler',
    layout: 'modern',
    cdn: 'https://unpkg.com/@scalar/api-reference',
}));

app.get('/health', (c) => {
    return c.json({ status: 'ok', message: 'GrowKM API is running' });
});

console.log('\n📚 API Reference: /reference\n');

export default app;
