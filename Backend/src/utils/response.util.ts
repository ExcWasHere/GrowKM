import { Context } from 'hono';
import { ContentfulStatusCode } from 'hono/utils/http-status';

export const successResponse = (c: Context, data: any, message = 'Success', statusCode: ContentfulStatusCode = 200) => {
    return c.json({
        status: 'success',
        message,
        data
    }, statusCode);
};
