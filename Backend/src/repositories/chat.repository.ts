import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type ChatSessionRow = Database['public']['Tables']['chat_sessions']['Row'];
type SessionType = Database['public']['Enums']['session_type_enum'];
type StepType = Database['public']['Enums']['step_type_enum'];

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
    timestamp: string;
}

export const createSession = async (
    supabase: SupabaseClient<Database>,
    userId: string,
    sessionType: SessionType = 'copilot',
    contextStepType?: StepType,
): Promise<ChatSessionRow> => {
    const { data, error } = await supabase
        .from('chat_sessions')
        .insert({ user_id: userId, session_type: sessionType, context_step_type: contextStepType ?? null })
        .select()
        .single();

    if (error) throw new Error(`Failed to create chat session: ${error.message}`);
    return data;
};

export const getSessionById = async (
    supabase: SupabaseClient<Database>,
    sessionId: string,
): Promise<ChatSessionRow | null> => {
    const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

    if (error && error.code !== 'PGRST116') throw new Error(`Failed to get chat session: ${error.message}`);
    return data;
};

export const getSessionsByUserId = async (
    supabase: SupabaseClient<Database>,
    userId: string,
): Promise<ChatSessionRow[]> => {
    const { data, error } = await supabase
        .from('chat_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to get chat sessions: ${error.message}`);
    return data ?? [];
};

// Fetches current messages, appends new ones, then writes back.
// Chat messages within a session are sequential so there's no race condition risk.
export const appendMessages = async (
    supabase: SupabaseClient<Database>,
    sessionId: string,
    newMessages: ChatMessage[],
): Promise<void> => {
    const { data: session, error: fetchError } = await supabase
        .from('chat_sessions')
        .select('messages')
        .eq('id', sessionId)
        .single();

    if (fetchError) throw new Error(`Failed to fetch session messages: ${fetchError.message}`);

    const current = (session.messages as ChatMessage[]) ?? [];
    const updated = [...current, ...newMessages];

    const { error } = await supabase
        .from('chat_sessions')
        .update({ messages: updated as any })
        .eq('id', sessionId);

    if (error) throw new Error(`Failed to append messages: ${error.message}`);
};

export const deleteSession = async (
    supabase: SupabaseClient<Database>,
    sessionId: string,
): Promise<void> => {
    const { error } = await supabase
        .from('chat_sessions')
        .delete()
        .eq('id', sessionId);

    if (error) throw new Error(`Failed to delete chat session: ${error.message}`);
};
