import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { HonoEnv } from '../types/env';
import { createSupabaseClient } from '../config/supabase';

const authRoutes = new OpenAPIHono<HonoEnv>();

const loginRoute = createRoute({
    method: 'post',
    path: '/login',
    tags: ['Auth'],
    summary: 'Login (Proxy to Supabase)',
    description: 'Endpoint proxy untuk mempermudah mendapatkan JWT Token via UI Scalar. Di aplikasi Frontend sungguhan, sebaiknya gunakan SDK `@supabase/supabase-js` langsung.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        email: z.string().email().openapi({ example: 'umkm.baru2@gmail.com' }),
                        password: z.string().min(6).openapi({ example: 'password12345678' }),
                    }).openapi('LoginInput')
                }
            }
        }
    },
    responses: {
        200: { description: 'Returns Supabase Auth Session' },
        400: { description: 'Invalid Credentials' }
    }
});

// Register route is hidden from OpenAPI schema


authRoutes.openapi(loginRoute, async (c) => {
    const { email, password } = c.req.valid('json');
    const supabase = createSupabaseClient(c.env);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        return c.json({ success: false, message: error.message }, 400);
    }
    
    return c.json({ success: true, data });
});

authRoutes.post('/register', async (c) => {
    try {
        const { email, password, data: metaData } = await c.req.json();
        const supabase = createSupabaseClient(c.env);
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: metaData
            }
        });
        
        if (error) {
            return c.json({ success: false, message: error.message }, 400);
        }
        
        return c.json({ success: true, data });
    } catch (e: any) {
        return c.json({ success: false, message: 'Invalid payload' }, 400);
    }
});

export default authRoutes;
