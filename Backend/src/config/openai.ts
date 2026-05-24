import OpenAI from 'openai';
import { EnvBindings } from '../types/env';

/**
 *
 * @param env - Environment bindings (Cloudflare Workers) or process.env fallback
 * @returns Configured OpenAI client instance
 */
export function getOpenAIClient(env: Partial<EnvBindings>): OpenAI {
    const apiKey = env.AZURE_OPENAI_API_KEY ?? process.env.AZURE_OPENAI_API_KEY ?? '';
    const endpoint = env.AZURE_OPENAI_ENDPOINT ?? process.env.AZURE_OPENAI_ENDPOINT ?? '';

    if (!apiKey || !endpoint) {
        throw new Error('Azure OpenAI credentials not configured (AZURE_OPENAI_API_KEY, AZURE_OPENAI_ENDPOINT required)');
    }

    return new OpenAI({
        apiKey,
        baseURL: endpoint,
    });
}
