import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi';
import { createClient } from '@supabase/supabase-js';
import { HonoEnv } from '../types/env';

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
                        password: z.string().min(6).openapi({ example: 'password123' }),
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

const registerRoute = createRoute({
    method: 'post',
    path: '/register',
    tags: ['Auth'],
    summary: 'Register (Proxy to Supabase)',
    description: 'Endpoint proxy untuk registrasi user baru. Termasuk data `name` untuk tabel users.',
    request: {
        body: {
            content: {
                'application/json': {
                    schema: z.object({
                        email: z.string().email().openapi({ example: 'umkm.baru2@gmail.com' }),
                        password: z.string().min(6).openapi({ example: 'password123' }),
                        data: z.object({
                            name: z.string().openapi({ example: 'Toko Kue Ibu Budi' })
                        }).openapi('RegisterMetadata')
                    }).openapi('RegisterInput')
                }
            }
        }
    },
    responses: {
        200: { description: 'Returns User Data' },
        400: { description: 'Registration Failed' }
    }
});

authRoutes.openapi(loginRoute, async (c) => {
    const { email, password } = c.req.valid('json');
    const supabaseUrl = c.env?.SUPABASE_URL || process.env.SUPABASE_URL!;
    const supabaseKey = c.env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    
    if (error) {
        return c.json({ success: false, message: error.message }, 400);
    }
    
    return c.json({ success: true, data });
});

authRoutes.openapi(registerRoute, async (c) => {
    const { email, password, data: metaData } = c.req.valid('json');
    const supabaseUrl = c.env?.SUPABASE_URL || process.env.SUPABASE_URL!;
    const supabaseKey = c.env?.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY!;
    
    const supabase = createClient(supabaseUrl, supabaseKey);
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
});

export default authRoutes;
