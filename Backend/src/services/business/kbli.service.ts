import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import { EnvBindings } from '../../types/env';
import { embedQuery } from '../ai/embedding.service';
import { retrieveChunks, RetrievedChunk } from '../ai/retrieval.service';
import { askAIJson } from '../../utils/ai.util';

const DEPLOYMENT = 'gpt-4.1-mini';

export interface KBLIWarning {
    wrong_kbli: string;
    reason: string;
}

export interface KBLIMismatchAlert {
    user_kbli: string;
    recommended_kbli: string;
    reason: string;
}

export interface KBLIMatchResult {
    kbli_code: string;
    kbli_name: string;
    explanation: string;
    warnings: KBLIWarning[];
    mismatch_alert: KBLIMismatchAlert | null;
}

function buildSystemPrompt(chunks: RetrievedChunk[], businessType: string): string {
    const context = chunks
        .map(c => `### ${c.title}\n${c.content}`)
        .join('\n\n---\n\n');

    return `Kamu adalah sistem Smart KBLI Matcher untuk platform GrowKM.
Tugasmu adalah menganalisis deskripsi usaha UMKM dan merekomendasikan kode KBLI yang paling tepat.

KATEGORI BISNIS USER: ${businessType}

KNOWLEDGE BASE KBLI (gunakan HANYA informasi di bawah ini sebagai referensi):
${context}

ATURAN KETAT:
1. Pilih SATU kode KBLI yang paling sesuai dengan kegiatan UTAMA usaha.
2. Berikan "explanation" yang jelas dan singkat mengapa KBLI ini dipilih berdasarkan deskripsi usaha.
3. Jika ada potensi kebingungan atau kesalahan umum, tambahkan ke "warnings".
4. Respond HANYA dengan JSON valid. JANGAN tambahkan penjelasan di luar JSON.

FORMAT OUTPUT (JSON only):
{
  "kbli_code": "XXXXX",
  "kbli_name": "Nama KBLI",
  "explanation": "Penjelasan mengapa KBLI ini paling tepat...",
  "warnings": [
    { "wrong_kbli": "XXXXX", "reason": "Alasan kenapa KBLI ini salah untuk usaha ini" }
  ]
}`;
}

export const matchKBLI = async (
    supabase: SupabaseClient<Database>,
    env: Partial<EnvBindings>,
    description: string,
    businessType: string,
    existingKbliCode?: string, // Condition B: user already has a KBLI — AI will validate it
): Promise<KBLIMatchResult> => {
    const queryVector = await embedQuery(env, `${businessType} ${description}`);
    const chunks = await retrieveChunks(supabase, queryVector, 'kbli', 5, 0.4);

    if (chunks.length === 0) {
        return {
            kbli_code: existingKbliCode ?? '47999',
            kbli_name: existingKbliCode ? 'KBLI yang Anda Inputkan' : 'Perdagangan Eceran Lainnya',
            explanation: 'Tidak ditemukan KBLI spesifik yang cocok dengan deskripsi pada knowledge base.',
            warnings: [],
            mismatch_alert: null,
        };
    }

    let result: Omit<KBLIMatchResult, 'mismatch_alert'>;
    try {
        result = await askAIJson<Omit<KBLIMatchResult, 'mismatch_alert'>>(
            env,
            buildSystemPrompt(chunks, businessType),
            `Deskripsi usaha: "${description}"`
        );

        // Condition B: user supplied their own kbli_code — detect mismatch
        const mismatch_alert: KBLIMismatchAlert | null =
            existingKbliCode && existingKbliCode !== result.kbli_code
                ? {
                      user_kbli: existingKbliCode,
                      recommended_kbli: result.kbli_code,
                      reason: result.explanation,
                  }
                : null;

        return { ...result, mismatch_alert };
    } catch (error: any) {
        throw new Error(`Failed to parse KBLI match result: ${error.message}`);
    }
};
