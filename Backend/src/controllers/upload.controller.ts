import { Context } from 'hono';
import { HonoEnv } from '../types/env';
import { storageService } from '../services/infrastructure/storage.service';

export const handleGeneratePresignedUrl = async (c: Context<HonoEnv>) => {
    const body = await c.req.json();
    
    const result = await storageService.generatePresignedUrl(
        c.env,
        body.file_name,
        body.content_type,
        body.folder
    );

    return c.json({
        status: 'success' as const,
        data: {
            upload_url: result.uploadUrl,
            public_url: result.publicUrl,
            file_key: result.fileKey
        }
    }, 200);
};