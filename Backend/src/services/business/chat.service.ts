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

const TITLE_DEPLOYMENT = 'gpt-4.1-mini'; 

export interface ChatResult {
    session_id: string;
    user_message: string;
    ai_response: string;
    sources_used: number;
}

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

// Generates a short title from the first user message + AI response (fire-and-forget)
async function generateTitle(
    openai: OpenAI,
    userMessage: string,
    aiResponse: string,
): Promise<string> {
    const completion = await openai.chat.completions.create({
        model: TITLE_DEPLOYMENT,
        messages: [
            {
                role: 'system',
                content: 'Generate a short, descriptive Indonesian title (max 6 words) for this conversation. Return ONLY the title, no quotes, no punctuation at the end.',
            },
            { role: 'user', content: userMessage },
            { role: 'assistant', content: aiResponse },
        ],
        temperature: 0.5,
        max_tokens: 20,
    });
    return completion.choices[0]?.message?.content?.trim() ?? 'Percakapan Baru';
}

// Core chat function — auto-creates a session if no session_id provided, then runs RAG + LLM
export const chat = async (
    supabase: SupabaseClient<Database>,
    env: Partial<EnvBindings>,
    userId: string,
    userMessage: string,
    sessionId?: string,
    contextStepType?: StepType,
): Promise<ChatResult> => {
    // 1. Get existing session or auto-create a new one
    let session;
    if (sessionId) {
        session = await chatRepository.getSessionById(supabase, sessionId);
        if (!session) throw new AppError(404, 'Chat session not found');
        if (session.user_id !== userId) throw new AppError(403, 'Forbidden');
    } else {
        // Auto-create a fresh session for this conversation
        session = await chatRepository.createSession(supabase, userId, 'copilot', contextStepType);
    }

    // 2. Load conversation history (capped to avoid exceeding context window)
    const history = (session.messages as unknown as ChatMessage[]) ?? [];
    const recentHistory = history.slice(-MAX_HISTORY_MESSAGES);

    // 3. Load business profile for personalised system prompt
    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);

    // 4. RAG: embed user message, retrieve relevant KB chunks across ALL domains
    const queryVector = await embedQuery(env, userMessage);
    const chunks = await retrieveChunks(supabase, queryVector, undefined, 5, 0.35);

    // 5. Build LLM message array: system prompt + conversation history + new user message
    type LLMRole = 'system' | 'user' | 'assistant';
    const llmMessages: Array<{ role: LLMRole; content: string }> = [
        { role: 'system', content: buildSystemPrompt(businessProfile, session.context_step_type, chunks) },
        ...recentHistory.map(m => ({ role: m.role as LLMRole, content: m.content })),
        { role: 'user', content: userMessage },
    ];

    // 6. Call Azure OpenAI (non-streaming for MVP simplicity)
    const openai = getOpenAIClient(env);
    const completion = await openai.chat.completions.create({
        model: DEPLOYMENT,
        messages: llmMessages,
        temperature: 0.3,
    });

    const aiResponse = completion.choices[0]?.message?.content ?? 'Maaf, saya tidak dapat menghasilkan respons saat ini.';

    // 7. Persist both messages to the session
    const userMsg: ChatMessage = { role: 'user', content: userMessage, timestamp: new Date().toISOString() };
    const assistantMsg: ChatMessage = { role: 'assistant', content: aiResponse, timestamp: new Date().toISOString() };
    await chatRepository.appendMessages(supabase, session.id, [userMsg, assistantMsg]);

    // 8. Fire-and-forget: generate session title only for new sessions (first message)
    const isNewSession = !sessionId;
    if (isNewSession) {
        generateTitle(openai, userMessage, aiResponse)
            .then(title => chatRepository.updateSessionTitle(supabase, session.id, title))
            .catch(err => console.error('[TitleGen] Failed to generate session title:', err));
    }

    return {
        session_id: session.id,
        user_message: userMessage,
        ai_response: aiResponse,
        sources_used: chunks.length,
    };
};
