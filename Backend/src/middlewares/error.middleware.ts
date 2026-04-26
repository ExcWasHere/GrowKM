import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export class AppError extends Error {
    constructor(public statusCode: ContentfulStatusCode, message: string) {
        super(message);
        this.name = 'AppError';
    }
}

// Hono's onError handler takes (err, c)
export const errorHandler = async (err: Error | AppError, c: Context) => {
    console.error('Error:', err);
    
    const statusCode = err instanceof AppError ? err.statusCode : 500 as ContentfulStatusCode;
    
    return c.json({
        status: 'error',
        message: err.message || 'Internal Server Error'
    }, statusCode);
};
