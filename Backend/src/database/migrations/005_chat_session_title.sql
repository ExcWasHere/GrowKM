-- Migration: Add title column to chat_sessions
-- Title is AI-generated from the first message of the conversation (fire-and-forget, non-blocking)

ALTER TABLE public.chat_sessions
    ADD COLUMN IF NOT EXISTS title TEXT;
