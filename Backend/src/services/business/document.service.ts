import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import { AppError } from '../../middlewares/error.middleware';
import { DocStepType, STEP_TO_COLUMN } from '../../schemas/document.schema';

const BUCKET = 'business-documents';
const SIGNED_URL_TTL = 3600; // 1 hour
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIMES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

const MIME_TO_EXT: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png':  'png',
    'image/webp': 'webp',
    'application/pdf': 'pdf',
};

export const uploadDocument = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    stepType: DocStepType,
    file: File,
) => {
    if (file.size > MAX_SIZE) {
        throw new AppError(400, 'File terlalu besar. Maksimal 5 MB');
    }
    if (!ALLOWED_MIMES.includes(file.type)) {
        throw new AppError(400, `Format file tidak didukung: ${file.type}. Gunakan JPG, PNG, WEBP, atau PDF`);
    }

    const ext = MIME_TO_EXT[file.type] ?? 'bin';
    const path = `${userId}/${stepType}/${Date.now()}.${ext}`;
    const column = STEP_TO_COLUMN[stepType];

    const { data: profile } = await supabase
        .from('business_profiles')
        .select(column)
        .eq('user_id', userId)
        .single();

    const oldPath = (profile as Record<string, string | null> | null)?.[column];
    if (oldPath) {
        await supabase.storage.from(BUCKET).remove([oldPath]);
    }

    // Upload new file
    const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, {
            contentType: file.type,
            upsert: false,
        });

    if (uploadError) {
        throw new AppError(500, `Gagal mengunggah file: ${uploadError.message}`);
    }

    const { error: dbError } = await supabase
        .from('business_profiles')
        .update({ [column]: path } as never)
        .eq('user_id', userId);

    if (dbError) {
  
        await supabase.storage.from(BUCKET).remove([path]);
        throw new AppError(500, `Gagal menyimpan path dokumen: ${dbError.message}`);
    }

    // Generate signed URL
    const { data: signed, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL);

    if (signError || !signed) {
        throw new AppError(500, `Gagal generate signed URL: ${signError?.message ?? 'unknown'}`);
    }

    return {
        path,
        signed_url: signed.signedUrl,
        expires_at: new Date(Date.now() + SIGNED_URL_TTL * 1000).toISOString(),
    };
};

export const getSignedUrlForStep = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    stepType: DocStepType,
) => {
    const column = STEP_TO_COLUMN[stepType];

    const { data: profile, error } = await supabase
        .from('business_profiles')
        .select(column)
        .eq('user_id', userId)
        .single();

    if (error && error.code !== 'PGRST116') {
        throw new AppError(500, `Gagal membaca profil: ${error.message}`);
    }

    const path = (profile as Record<string, string | null> | null)?.[column];
    if (!path) {
        throw new AppError(404, `Belum ada dokumen ${stepType} yang diunggah`);
    }

    const { data: signed, error: signError } = await supabase.storage
        .from(BUCKET)
        .createSignedUrl(path, SIGNED_URL_TTL);

    if (signError || !signed) {
        throw new AppError(404, 'File tidak ditemukan atau tidak berhak akses');
    }

    return {
        signed_url: signed.signedUrl,
        expires_at: new Date(Date.now() + SIGNED_URL_TTL * 1000).toISOString(),
    };
};

export const deleteDocument = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    stepType: DocStepType,
) => {
    const column = STEP_TO_COLUMN[stepType];

    const { data: profile } = await supabase
        .from('business_profiles')
        .select(column)
        .eq('user_id', userId)
        .single();

    const path = (profile as Record<string, string | null> | null)?.[column];
    if (!path) return;

    await supabase.storage.from(BUCKET).remove([path]);

    const { error } = await supabase
        .from('business_profiles')
        .update({ [column]: null } as never)
        .eq('user_id', userId);

    if (error) throw new AppError(500, `Gagal menghapus path dokumen: ${error.message}`);
};
