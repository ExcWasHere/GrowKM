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

// Creates a new chat session for a user
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

// Returns a single session by ID (or null if not found)
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

// Returns all sessions for a user, ordered by most recent (excludes messages for lightweight list)
export const getSessionsByUserId = async (
    supabase: SupabaseClient<Database>,
    userId: string,
): Promise<Omit<ChatSessionRow, 'messages'>[]> => {
    const { data, error } = await supabase
        .from('chat_sessions')
        .select('id, user_id, title, session_type, context_step_type, created_at, updated_at')
        .eq('user_id', userId)
        .order('updated_at', { ascending: false });

    if (error) throw new Error(`Failed to get chat sessions: ${error.message}`);
    return (data ?? []) as Omit<ChatSessionRow, 'messages'>[];
};

// Appends new messages to the session's JSONB messages array
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

    const current = (session.messages as unknown as ChatMessage[]) ?? [];
    const updated = [...current, ...newMessages];

    const { error } = await supabase
        .from('chat_sessions')
        .update({ messages: updated as any })
        .eq('id', sessionId);

    if (error) throw new Error(`Failed to append messages: ${error.message}`);
};

// Permanently deletes a session and its message history
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

// Updates the AI-generated title of a session (called fire-and-forget after first message)
export const updateSessionTitle = async (
    supabase: SupabaseClient<Database>,
    sessionId: string,
    title: string,
): Promise<void> => {
    const { error } = await supabase
        .from('chat_sessions')
        .update({ title } as any)
        .eq('id', sessionId);

    if (error) throw new Error(`Failed to update session title: ${error.message}`);
};
