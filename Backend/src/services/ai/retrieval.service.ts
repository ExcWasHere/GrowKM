import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';

export interface RetrievedChunk {
    id: string;
    domain: string;
    category: string;
    title: string;
    content: string;
    similarity: number;
}

// Calls the match_knowledge SQL function in Supabase (pgvector cosine similarity)
export const retrieveChunks = async (
    supabase: SupabaseClient<Database>,
    queryEmbedding: number[],
    domain?: string,
    matchCount = 5,
    matchThreshold = 0.5,
): Promise<RetrievedChunk[]> => {
    const { data, error } = await supabase.rpc('match_knowledge', {
        query_embedding: queryEmbedding as any,
        match_domain: domain,
        match_count: matchCount,
        match_threshold: matchThreshold,
    });

    if (error) throw new Error(`pgvector retrieval error: ${error.message}`);
    return (data ?? []) as RetrievedChunk[];
};
