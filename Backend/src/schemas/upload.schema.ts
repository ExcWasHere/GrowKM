import { z } from '@hono/zod-openapi';

export const generatePresignedUrlBodySchema = z.object({
    file_name: z.string().min(1).openapi({ example: 'nota.jpg' }),
    content_type: z.string().min(1).openapi({ example: 'image/jpeg' }),
    folder: z.string().optional().default('receipts').openapi({ example: 'receipts' })
}).openapi('GeneratePresignedUrlBody');

export const generatePresignedUrlResponseSchema = z.object({
    upload_url: z.string().url().openapi({ example: 'https://r2.cloudflare.com/...' }),
    public_url: z.string().url().openapi({ example: 'https://pub-r2.growkm.com/...' }),
    file_key: z.string().openapi({ example: 'receipts/123-nota.jpg' })
}).openapi('GeneratePresignedUrlResponse');
