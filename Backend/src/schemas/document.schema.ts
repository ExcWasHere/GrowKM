import { z } from '@hono/zod-openapi';

// Document step types — only those with file uploads (sertifikat_standar excluded for now)
export const DOC_STEP_TYPES = ['nib', 'spp_irt', 'halal', 'bpom', 'merek'] as const;
export type DocStepType = (typeof DOC_STEP_TYPES)[number];

// Map step type → DB column on business_profiles
export const STEP_TO_COLUMN: Record<DocStepType, 'nib_image_path' | 'pirt_image_path' | 'halal_image_path' | 'bpom_image_path' | 'merek_image_path'> = {
    nib:     'nib_image_path',
    spp_irt: 'pirt_image_path',
    halal:   'halal_image_path',
    bpom:    'bpom_image_path',
    merek:   'merek_image_path',
};

export const documentStepParamSchema = z.object({
    stepType: z.enum(DOC_STEP_TYPES).openapi({
        param: { name: 'stepType', in: 'path' },
        example: 'nib',
    }),
}).openapi('DocumentStepParam');

export const uploadDocumentResponseSchema = z.object({
    path:       z.string().openapi({ example: 'uuid/nib/1700000000000.jpg' }),
    signed_url: z.string().openapi({ example: 'https://xyz.supabase.co/storage/v1/object/sign/...' }),
    expires_at: z.string().openapi({ example: '2026-05-24T13:00:00.000Z' }),
}).openapi('UploadDocumentResponse');

export const signedUrlResponseSchema = z.object({
    signed_url: z.string(),
    expires_at: z.string(),
}).openapi('SignedUrlResponse');
