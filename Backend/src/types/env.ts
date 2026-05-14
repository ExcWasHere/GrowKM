import { User } from '@supabase/supabase-js';
import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from './database.types';

export type EnvBindings = {
    SUPABASE_URL: string;
    SUPABASE_ANON_KEY: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    GEMINI_API_KEY: string;
    AZURE_OPENAI_API_KEY: string;
    AZURE_OPENAI_ENDPOINT: string;
    AZURE_OPENAI_DEPLOYMENT_NAME: string;
};

export type HonoEnv = {
    Bindings: EnvBindings;
    Variables: {
        userId: string;
        user: User;
        supabase: SupabaseClient<Database>;
    };
};
