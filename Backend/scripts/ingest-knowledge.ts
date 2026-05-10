import { readFileSync, readdirSync, statSync } from 'fs';
import { join, basename, relative } from 'path';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

const GEMINI_API_KEY = process.env.GEMINI_API_KEY ?? '';
const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error('❌ ENV MISSING! Ensure .env contains GEMINI_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const KNOWLEDGE_BASE_DIR = join(import.meta.dir, '../knowledge_base_2/opportunities');

interface Chunk {
    domain: string;
    category: string;
    title: string;
    content: string;
}

// Step 1: Recursively collect all .md files from the knowledge_base directory
function getMarkdownFiles(dir: string, fileList: string[] = []): string[] {
    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        statSync(fullPath).isDirectory()
            ? getMarkdownFiles(fullPath, fileList)
            : entry.endsWith('.md') && fileList.push(fullPath);
    }
    return fileList;
}

// Step 2: Split each file into chunks at every ## heading.
// domain = top-level folder (e.g. 'kbli', 'halal'), category = filename without .md
function parseMarkdownToChunks(filePath: string): Chunk[] {
    const raw = readFileSync(filePath, 'utf-8');
    const parts = relative(KNOWLEDGE_BASE_DIR, filePath).replace(/\\/g, '/').split('/');
    const domain = parts[0];
    const category = basename(parts[parts.length - 1], '.md');

    return raw
        .split(/(?=\n## )/)
        .filter(s => s.trim().startsWith('## '))
        .map(section => {
            const trimmed = section.trim();
            const firstNewline = trimmed.indexOf('\n');
            return {
                domain,
                category,
                title: trimmed.slice(3, firstNewline === -1 ? undefined : firstNewline).trim(),
                content: firstNewline === -1 ? '' : trimmed.slice(firstNewline).trim(),
            };
        })
        .filter(c => c.content.length >= 30);
}

// Step 3: Convert document to a 1536-dim vector using Gemini asymmetric document prefix format
async function getEmbedding(title: string, content: string): Promise<number[]> {
    // Required prefix format for stored documents — must mirror query side with `task: question answering | query: ...`
    const documentText = `title: ${title} | text: ${content}`;
    const response = await ai.models.embedContent({
        model: 'gemini-embedding-2',
        contents: documentText,
        config: { outputDimensionality: 1536 },
    });
    const values = response.embeddings?.[0]?.values;
    if (!values?.length) throw new Error('Empty embedding from Gemini API');
    return values;
}

// Step 4: Delete existing row (if any) then insert — safe to re-run without duplicates
async function upsertChunk(chunk: Chunk, embedding: number[]) {
    await supabase.from('domain_knowledge').delete()
        .match({ domain: chunk.domain, category: chunk.category, title: chunk.title });

    const { error } = await supabase.from('domain_knowledge').insert({
        domain: chunk.domain,
        category: chunk.category,
        title: chunk.title,
        content: chunk.content,
        metadata: { source: `${chunk.domain}/${chunk.category}.md` },
        embedding: embedding as any,
    });

    if (error) throw new Error(`Supabase insert error: ${error.message}`);
}

async function main() {
    console.log('🚀 GrowKM Knowledge Base Ingestion Pipeline');
    console.log('==========================================');

    const files = getMarkdownFiles(KNOWLEDGE_BASE_DIR);
    console.log(`📁 Found ${files.length} Markdown files:`);
    files.forEach(f => console.log(`   ${relative(KNOWLEDGE_BASE_DIR, f)}`));

    let allChunks: Chunk[] = [];
    for (const file of files) {
        const chunks = parseMarkdownToChunks(file);
        allChunks = allChunks.concat(chunks);
        console.log(`   ✂️  ${relative(KNOWLEDGE_BASE_DIR, file)}: ${chunks.length} chunks`);
    }

    console.log(`\n📊 Total: ${allChunks.length} chunks ready for embedding`);
    console.log('🔄 Starting embedding + Supabase insert...\n');

    let success = 0;
    let failed = 0;

    for (let i = 0; i < allChunks.length; i++) {
        const chunk = allChunks[i];
        const label = `[${i + 1}/${allChunks.length}] [${chunk.domain}/${chunk.category}] ${chunk.title.slice(0, 60)}`;

        try {
            const embedding = await getEmbedding(chunk.title, chunk.content);
            await upsertChunk(chunk, embedding);
            console.log(`✅ ${label}`);
            success++;
            await new Promise(r => setTimeout(r, 2100)); // stay within Gemini free-tier rate limit
        } catch (err) {
            console.error(`❌ ${label}\n   Error:`, err instanceof Error ? err.message : err);
            failed++;
        }
    }

    console.log('\n==========================================');
    console.log(`✅ Success: ${success} chunks`);
    if (failed > 0) console.log(`❌ Failed : ${failed} chunks`);
    console.log('🎉 Pipeline complete!');
}

main().catch(err => { console.error('Fatal error:', err); process.exit(1); });
