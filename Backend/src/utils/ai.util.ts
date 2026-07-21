import { EnvBindings } from '../types/env';
import { getOpenAIClient } from '../config/openai';

export const askAIJson = async <T>(
    env: Partial<EnvBindings>,
    systemPrompt: string,
    userMessage: any, // string | any[]
    temperature: number = 0.1,
    maxTokens?: number
): Promise<T> => {
    const openai = getOpenAIClient(env);
    const deploymentName = env.AZURE_OPENAI_DEPLOYMENT_NAME ?? process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? 'gpt-4.1-mini';
    
    const completion = await openai.chat.completions.create({
        model: deploymentName,
        response_format: { type: 'json_object' },
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userMessage }
        ],
        temperature,
        max_tokens: maxTokens,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    
    try {
        return JSON.parse(raw) as T;
    } catch (e) {
        console.error('Failed to parse AI JSON response:', raw);
        throw new Error(`AI returned invalid JSON: ${raw}`);
    }
}

export const askAIText = async (
    env: Partial<EnvBindings>,
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    temperature: number = 0.3,
    maxTokens?: number
): Promise<string> => {
    const openai = getOpenAIClient(env);
    const deploymentName = env.AZURE_OPENAI_DEPLOYMENT_NAME ?? process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? 'gpt-4.1-mini';
    
    const completion = await openai.chat.completions.create({
        model: deploymentName,
        messages,
        temperature,
        max_tokens: maxTokens,
    });

    return completion.choices[0]?.message?.content?.trim() ?? '';
}
