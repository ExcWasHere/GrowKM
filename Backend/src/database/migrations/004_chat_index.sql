-- Migration 004: Index for chat session listing by user
CREATE INDEX IF NOT EXISTS idx_chat_sessions_user_id
    ON public.chat_sessions(user_id, updated_at DESC);
