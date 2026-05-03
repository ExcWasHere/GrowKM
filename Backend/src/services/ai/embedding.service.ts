import { GoogleGenAI } from '@google/genai';
import { EnvBindings } from '../../types/env';

const EMBEDDING_MODEL = 'gemini-embedding-2';
const OUTPUT_DIMENSIONS = 1536;

function getAI(env: Partial<EnvBindings>) {
    const apiKey = env.GEMINI_API_KEY ?? process.env.GEMINI_API_KEY ?? '';
    return new GoogleGenAI({ apiKey });
}

async function embed(env: Partial<EnvBindings>, text: string): Promise<number[]> {
    const ai = getAI(env);
    const response = await ai.models.embedContent({
        model: EMBEDDING_MODEL,
        contents: text,
        config: { outputDimensionality: OUTPUT_DIMENSIONS },
    });
    const values = response.embeddings?.[0]?.values;
    if (!values?.length) throw new Error('Empty embedding from Gemini API');
    return values;
}

// For querying: asymmetric prefix required by gemini-embedding-2
export const embedQuery = (env: Partial<EnvBindings>, text: string): Promise<number[]> =>
    embed(env, `task: question answering | query: ${text}`);

// For documents 
export const embedDocument = (env: Partial<EnvBindings>, title: string, content: string): Promise<number[]> =>
    embed(env, `title: ${title} | text: ${content}`);
