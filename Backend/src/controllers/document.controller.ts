import { Context } from 'hono';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import { AppError } from '../middlewares/error.middleware';
import * as documentService from '../services/business/document.service';
import { successResponse } from '../utils/response.util';
import { DocStepType } from '../schemas/document.schema';

// POST /api/users/business-profile/documents/:stepType
export const handleUploadDocument = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const stepType = c.req.param('stepType') as DocStepType;

    const formData = await c.req.formData();
    const file = formData.get('file');

    if (!(file instanceof File)) {
        throw new AppError(400, 'File tidak ditemukan dalam request. Gunakan field "file" pada form-data');
    }

    const result = await documentService.uploadDocument(supabase, userId, stepType, file);
    return successResponse(c, result, 'Dokumen berhasil diunggah');
};

// GET /api/users/business-profile/documents/:stepType/url
export const handleGetDocumentUrl = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const stepType = c.req.param('stepType') as DocStepType;

    const result = await documentService.getSignedUrlForStep(supabase, userId, stepType);
    return successResponse(c, result, 'Signed URL generated');
};

// DELETE /api/users/business-profile/documents/:stepType
export const handleDeleteDocument = async (c: Context) => {
    const supabase = getAuthClient(c);
    const userId = getUserId(c);
    const stepType = c.req.param('stepType') as DocStepType;

    await documentService.deleteDocument(supabase, userId, stepType);
    return successResponse(c, null, 'Dokumen dihapus');
};
