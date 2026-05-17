import { OpenAPIHono } from '@hono/zod-openapi';
import { logger } from 'hono/logger';
import { cors } from 'hono/cors';
import apiRoutes from './routes';
import { errorHandler } from './middlewares/error.middleware';
import { HonoEnv } from './types/env';

const app = new OpenAPIHono<HonoEnv>();

app.use('*', logger());

app.use(
  '*',
  cors({
    origin: [
      'http://localhost:5173',
      'https://growkm.pages.dev',
    ],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization'],
  })
);


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

// Serve Scalar UI — plain HTML so it works in both Bun and Cloudflare Workers.
// @scalar/hono-api-reference pulls in Node.js deps that break the Workers V8 runtime.
app.get('/reference', (c) => c.html(`<!doctype html>
<html>
  <head>
    <title>GrowKM API Reference</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script id="api-reference" data-url="/openapi.json"></script>
    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`));

app.get('/health', (c) => {
    return c.json({ status: 'ok', message: 'GrowKM API is running' });
});

console.log('\n📚 API Reference: /reference\n');

export default app;
