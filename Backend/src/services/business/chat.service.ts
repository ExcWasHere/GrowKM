import OpenAI from 'openai';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import { EnvBindings } from '../../types/env';
import { AppError } from '../../middlewares/error.middleware';
import * as chatRepository from '../../repositories/chat.repository';
import { ChatMessage } from '../../repositories/chat.repository';
import * as userRepository from '../../repositories/user.repository';
import { embedQuery } from '../ai/embedding.service';
import { retrieveChunks, RetrievedChunk } from '../ai/retrieval.service';

type StepType = Database['public']['Enums']['step_type_enum'];
type BusinessProfile = Database['public']['Tables']['business_profiles']['Row'];

const DEPLOYMENT = 'gpt-4.1-mini';
const MAX_HISTORY_MESSAGES = 10;

function getOpenAIClient(env: Partial<EnvBindings>): OpenAI {
    return new OpenAI({
        baseURL: env.AZURE_OPENAI_ENDPOINT ?? process.env.AZURE_OPENAI_ENDPOINT ?? '',
        apiKey: env.AZURE_OPENAI_API_KEY ?? process.env.AZURE_OPENAI_API_KEY ?? '',
    });
}

function buildSystemPrompt(
    profile: BusinessProfile | null,
    contextStepType: StepType | null,
    chunks: RetrievedChunk[],
): string {
    const profileSection = profile
        ? `PROFIL USAHA USER:
- Nama Usaha : ${profile.business_name ?? 'Belum diisi'}
- Jenis Usaha: ${profile.business_type}
- KBLI       : ${profile.kbli_code ?? 'Belum ditentukan'}
- Lokasi     : ${[profile.city, profile.province].filter(Boolean).join(', ') || 'Belum diisi'}
- Status Izin: NIB=${profile.has_nib}, PIRT=${profile.has_pirt}, Halal=${profile.has_halal}, BPOM=${profile.has_bpom}, Merek=${profile.has_merek}`
        : 'PROFIL USAHA: Belum tersedia.';

    const stepSection = contextStepType
        ? `\nKONTEKS IZIN AKTIF: User sedang memproses "${contextStepType.toUpperCase()}". Prioritaskan informasi terkait izin ini.\n`
        : '';

    const kbSection = chunks.length > 0
        ? `\nKNOWLEDGE BASE — gunakan HANYA informasi berikut sebagai referensi:\n\n${chunks.map(c => `### ${c.title}\n${c.content}`).join('\n\n---\n\n')}`
        : '\nKNOWLEDGE BASE: Tidak ada informasi spesifik yang ditemukan untuk pertanyaan ini.';

    return `Kamu adalah GrowKM Copilot — asisten AI yang membantu UMKM Indonesia memahami dan menyelesaikan proses formalisasi usaha (NIB, SPP-IRT, Sertifikat Halal, BPOM, Merek, dll.).

${profileSection}
${stepSection}
${kbSection}

ATURAN:
1. Jawab HANYA berdasarkan knowledge base di atas. Jangan mengarang informasi di luar itu.
2. Jika knowledge base tidak memuat informasi yang cukup, katakan dengan jujur dan sarankan user menghubungi instansi terkait.
3. Berikan jawaban yang spesifik, actionable, dan mudah dipahami oleh pelaku UMKM.
4. Gunakan bahasa Indonesia yang ramah dan profesional.
5. Jika pertanyaan tidak berkaitan dengan formalisasi usaha, arahkan kembali ke topik tersebut.`;
}

export const streamResponse = async (
    supabase: SupabaseClient<Database>,
    env: Partial<EnvBindings>,
    sessionId: string,
    userId: string,
    userMessage: string,
    onChunk: (token: string) => Promise<void>,
    onDone: () => Promise<void>,
): Promise<void> => {
    const session = await chatRepository.getSessionById(supabase, sessionId);
    if (!session) throw new AppError(404, 'Chat session not found');
    if (session.user_id !== userId) throw new AppError(403, 'Forbidden');

    // Capture history BEFORE appending the new user message
    const history = (session.messages as ChatMessage[]) ?? [];
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);

    // RAG: filter by context_step_type domain when available, otherwise search all
    const domain = session.context_step_type ?? undefined;
    const queryVector = await embedQuery(env, userMessage);
    const chunks = await retrieveChunks(supabase, queryVector, domain, 5, 0.35);

    // Persist user message immediately so it's saved even if streaming fails
    const userMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
    await chatRepository.appendMessages(supabase, sessionId, [userMsg]);

    // Build LLM messages: system + conversation history + current user message
    type LLMRole = 'system' | 'user' | 'assistant';
    const llmMessages: Array<{ role: LLMRole; content: string }> = [
        { role: 'system', content: buildSystemPrompt(businessProfile, session.context_step_type, chunks) },
        ...recentHistory.map(m => ({ role: m.role as LLMRole, content: m.content })),
        { role: 'user', content: userMessage },
    ];

    const openai = getOpenAIClient(env);
    const stream = await openai.chat.completions.create({
        model: DEPLOYMENT,
        messages: llmMessages,
        stream: true,
        temperature: 0.3,
    });

    let assistantContent = '';
    for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content ?? '';
        if (token) {
            assistantContent += token;
            await onChunk(token);
        }
    }

    if (assistantContent) {
        const assistantMsg: ChatMessage = {
            role: 'assistant',
            content: assistantContent,
            timestamp: new Date().toISOString(),
        };
        await chatRepository.appendMessages(supabase, sessionId, [assistantMsg]);
    }

    await onDone();
};
