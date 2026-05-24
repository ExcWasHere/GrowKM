import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import * as retrievalService from '../ai/retrieval.service';
import { getOpenAIClient } from '../../config/openai';

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row'];
type StepType = Database['public']['Enums']['step_type_enum'];
type MatchStatus = Database['public']['Enums']['match_status_enum'];
type OpportunityRow = Database['public']['Tables']['opportunities']['Row'];

interface KnowledgeChunk {
    id: string;
    domain: string;
    category: string;
    title: string;
    content: string;
    similarity: number;
}

interface MatchSnapshot {
    opportunity_id: string;
    match_status: MatchStatus;
    missing_steps: StepType[];
}

export interface Recommendation {
    opportunity_id: string;
    title: string;
    priority_rank: number;
    match_status: MatchStatus | null;
    missing_steps: StepType[];
    why_this_fits: string;
    why_now: string;
    next_step: string;
    caveats: string | null;
    source_url: string | null;
}

interface LLMRecommendation {
    opportunity_title: string;
    why_this_fits: string;
    why_now: string;
    next_step: string;
    caveats?: string;
}



export function buildProfileContext(
    profile: BusinessProfile,
    completedSteps: StepType[],
): string {
    const businessTypeLabel: Record<string, string> = {
        kuliner: 'kuliner',
        fashion_craft: 'fashion & kerajinan',
        jasa_personal_care: 'jasa personal care',
        lainnya: 'lainnya',
    };

    const stepLabel: Record<StepType, string> = {
        nib: 'NIB',
        spp_irt: 'SPP-IRT',
        halal: 'Halal',
        bpom: 'BPOM',
        merek: 'Merek',
        sertifikat_standar: 'Sertifikat Standar',
    };

    const businessType = businessTypeLabel[profile.business_type] || profile.business_type;
    const location = profile.city ? `di ${profile.city}` : 'lokasi tidak disebutkan';
    const monthlyRevenue = profile.monthly_revenue_estimate
        ? `Rp ${(profile.monthly_revenue_estimate / 1_000_000).toFixed(1)}jt/bulan`
        : 'omzet belum dicatat';
    const employeeCount = profile.employee_count === 1 ? '1 orang (sendiri)' : `${profile.employee_count} karyawan`;

    const completedLabels = completedSteps.length > 0
        ? completedSteps.map(s => stepLabel[s]).join(', ')
        : 'belum ada';

    const hasNib = profile.has_nib ? 'Sudah punya NIB' : 'Belum punya NIB';
    const hasPirt = profile.has_pirt ? 'Sudah punya SPP-IRT' : 'Belum punya SPP-IRT';
    const hasHalal = profile.has_halal ? 'Sudah punya Halal' : 'Belum punya Halal';
    const hasMerek = profile.has_merek ? 'Sudah punya Merek terdaftar' : 'Belum punya Merek terdaftar';

    return `
Pemilik usaha ${businessType} ${location}.
${profile.business_name ? `Nama usaha: ${profile.business_name}.` : ''}
Omzet: ${monthlyRevenue}. Karyawan: ${employeeCount}.
${hasNib}. ${hasPirt}. ${hasHalal}. ${hasMerek}.
Sertifikasi yang sudah selesai: ${completedLabels}.
`.trim();
}



export async function retrieveRelevantChunks(
    supabase: SupabaseClient<Database>,
    profileContext: string,
    env: Partial<{ GEMINI_API_KEY: string }>,
): Promise<KnowledgeChunk[]> {
    const embeddingService = await import('../ai/embedding.service');

    const queryEmbedding = await embeddingService.embedQuery(env, profileContext);

    // Retrieve relevant chunks from pgvector
    const chunks = await retrievalService.retrieveChunks(
        supabase,
        queryEmbedding,
        'opportunities',
        8,
        0.5,
    );

    return chunks.map(c => ({
        id: c.id,
        domain: c.domain,
        category: c.category,
        title: c.title,
        content: c.content,
        similarity: c.similarity,
    }));
}


export async function generateRecommendations(
    profile: BusinessProfile,
    profileContext: string,
    matchSnapshot: MatchSnapshot[],
    chunks: KnowledgeChunk[],
    env: Partial<{ AZURE_OPENAI_API_KEY: string; AZURE_OPENAI_ENDPOINT: string; AZURE_OPENAI_DEPLOYMENT_NAME: string }>,
): Promise<Recommendation[]> {
    const openai = getOpenAIClient(env);
    const deploymentName = env.AZURE_OPENAI_DEPLOYMENT_NAME ?? process.env.AZURE_OPENAI_DEPLOYMENT_NAME ?? 'gpt-4.1-mini';

    // Build match status context for LLM
    const matchContext = matchSnapshot.map(m => {
        const missingLabel = m.missing_steps.length > 0 ? `missing: ${m.missing_steps.join(', ')}` : 'eligible';
        return `- ${m.opportunity_id}: ${m.match_status} (${missingLabel})`;
    }).join('\n');

    // Build knowledge chunks context
    const chunksContext = chunks.map((c, idx) => `
[Chunk ${idx + 1}]
Title: ${c.title}
Category: ${c.category}
Content:
${c.content}
---
`).join('\n');

    const systemPrompt = `
Kamu adalah GrowKM Advisor untuk UMKM Indonesia. Tugasmu: pilih TOP 3 peluang bisnis yang paling cocok untuk user ini dari knowledge chunks yang diberikan.

ATURAN:
- Rekomendasikan HANYA dari chunks yang diberikan. Jangan buat peluang baru.
- Setiap rekomendasi harus referensi field profil user secara konkret (omzet, lokasi, jenis usaha, sertifikasi yang sudah/belum punya).
- Jika user belum punya NIB, prioritaskan peluang yang unlock dengan NIB saja.
- Sebutkan deadline jika ada.
- Output JSON sesuai schema.
- Gunakan Bahasa Indonesia yang santai dan jelas.

Untuk setiap rekomendasi, sertakan:
- opportunity_title: harus PERSIS match dengan Title dari chunk
- why_this_fits: 1-2 kalimat yang referensi profil user
- why_now: alasan timing/urgency
- next_step: 1 aksi konkret yang bisa dilakukan
- caveats: (opsional) catatan risiko atau "konfirmasi terkini ke X"

Output format JSON:
{
  "recommendations": [
    {
      "opportunity_title": "...",
      "why_this_fits": "...",
      "why_now": "...",
      "next_step": "...",
      "caveats": "..."
    }
  ]
}
`.trim();

    const userPrompt = `
PROFIL USER:
${profileContext}

STATUS ELIGIBILITY (dari matching engine):
${matchContext}

KNOWLEDGE CHUNKS:
${chunksContext}

Berikan TOP 3 rekomendasi peluang bisnis untuk user ini, urut dari prioritas tertinggi.
`.trim();

    const completion = await openai.chat.completions.create({
        model: deploymentName,
        messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 1500,
        response_format: { type: 'json_object' },
    });

    const rawOutput = completion.choices[0]?.message?.content;
    if (!rawOutput) throw new Error('LLM returned empty response');

    const parsed = JSON.parse(rawOutput) as { recommendations: LLMRecommendation[] };
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations)) {
        throw new Error('LLM output missing recommendations array');
    }

    console.log(`[Advisor] LLM generated ${parsed.recommendations.length} recommendations:`);
    parsed.recommendations.forEach((rec, idx) => {
        console.log(`[Advisor]   ${idx + 1}. "${rec.opportunity_title}"`);
    });

    // Map LLM output to Recommendation format (opportunity_id will be resolved in validation step)
    return parsed.recommendations.slice(0, 3).map((rec, idx) => {
        const matchInfo = matchSnapshot.find(m => {
            return true; // placeholder — validation happens in validateRecommendations
        });

        return {
            opportunity_id: '', 
            title: rec.opportunity_title,
            priority_rank: idx + 1,
            match_status: matchInfo?.match_status ?? null,
            missing_steps: matchInfo?.missing_steps ?? [],
            why_this_fits: rec.why_this_fits,
            why_now: rec.why_now,
            next_step: rec.next_step,
            caveats: rec.caveats ?? null,
            source_url: null, 
        };
    });
}


export function validateRecommendations(
    recommendations: Recommendation[],
    opportunitiesInDb: OpportunityRow[],
    matchSnapshot: MatchSnapshot[],
): Recommendation[] {
    const validated: Recommendation[] = [];

    console.log(`[Advisor] Validating ${recommendations.length} recommendations against ${opportunitiesInDb.length} opportunities in DB`);
    console.log(`[Advisor] Available titles in DB:`, opportunitiesInDb.map(o => o.title));

    for (const rec of recommendations) {
        // Match by title (case-insensitive, trim whitespace)
        const matched = opportunitiesInDb.find(
            opp => opp.title.trim().toLowerCase() === rec.title.trim().toLowerCase(),
        );

        if (!matched) {
            console.warn(`[Advisor] LLM recommended "${rec.title}" but not found in DB — skipping`);
            continue;
        }

        console.log(`[Advisor] ✓ Matched "${rec.title}" to DB opportunity ID ${matched.id}`);

        // Fill in opportunity_id and source_url from DB
        rec.opportunity_id = matched.id;
        rec.source_url = matched.source_url;

        // Fill in match_status and missing_steps from matchSnapshot
        const matchInfo = matchSnapshot.find(m => m.opportunity_id === matched.id);
        if (matchInfo) {
            rec.match_status = matchInfo.match_status;
            rec.missing_steps = matchInfo.missing_steps;
        }

        validated.push(rec);
    }

    return validated;
}

export function buildFallbackRecommendations(
    matchSnapshot: MatchSnapshot[],
    opportunitiesInDb: OpportunityRow[],
): Recommendation[] {
    // Deterministic fallback: top 3 by match_status (eligible → almost → locked), then by match_score
    const statusOrder: Record<MatchStatus, number> = { eligible: 0, almost: 1, locked: 2 };

    const sorted = matchSnapshot
        .map(m => {
            const opp = opportunitiesInDb.find(o => o.id === m.opportunity_id);
            return { match: m, opp };
        })
        .filter(x => x.opp !== undefined)
        .sort((a, b) => statusOrder[a.match.match_status] - statusOrder[b.match.match_status])
        .slice(0, 3);

    return sorted.map((x, idx) => ({
        opportunity_id: x.match.opportunity_id,
        title: x.opp!.title,
        priority_rank: idx + 1,
        match_status: x.match.match_status,
        missing_steps: x.match.missing_steps,
        why_this_fits: 'Rekomendasi otomatis berdasarkan kelengkapan syarat.',
        why_now: 'Peluang ini sesuai dengan profil bisnis Anda.',
        next_step: 'Lihat detail peluang untuk langkah selanjutnya.',
        caveats: null,
        source_url: x.opp!.source_url,
    }));
}
