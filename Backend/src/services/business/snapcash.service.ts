import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../../types/database.types';
import { EnvBindings } from '../../types/env';
import { askAIJson } from '../../utils/ai.util';
import * as financeRepo from '../../repositories/snapcash.repository';
import { AppError } from '../../middlewares/error.middleware';
import { RecordTransactionResponse } from '../../schemas/snapcash.schema';

type BusinessProfile = Database['public']['Tables']['business_profiles']['Row'];

interface ParsedTransaction {
    type: 'income' | 'expense';
    product_name: string | null;
    category: string | null;
    unit_price: number | null;
    quantity: number | null;
    amount: number;
}

function buildParserPrompt(businessType: string): string {
    return `Kamu adalah asisten pencatat keuangan cerdas untuk UMKM Indonesia.
Tugasmu: Ekstrak data transaksi ke dalam format JSON array yang valid.

Jenis usaha user: ${businessType}

ATURAN KETAT DAN LOGIKA PENALARAN:
1. 'amount' WAJIB diisi angka (integer). TIDAK BOLEH null.
2. Kamus singkatan uang: ceban=10000, gocap=50000, goceng=5000, seceng=1000, cepek=100000, gopek=500. 'rb' atau 'ribu' kalikan 1000. 'jt' atau 'juta' kalikan 1000000.
3. Ambiguitas Harga vs Kuantitas: Jika user bilang "jual nasi goreng 5 100 ribu", gunakan penalaran: tidak mungkin 1 porsi 100 ribu. Artinya TOTAL amount = 100000, quantity = 5, unit_price = 20000.
4. Jika transaksi batal/refund, abaikan atau set type="expense" jika memang mengembalikan uang kas.
5. Jika pesan BUKAN berisi transaksi keuangan (misal: curhat, tanya resep), JAWAB dengan array kosong [].

FORMAT (JSON Array):
[
  {
    "type": "income" | "expense",
    "product_name": string | null,
    "category": string | null,
    "unit_price": number | null,
    "quantity": number | null,
    "amount": number
  }
]`;
}

function calculateStreak(
    lastRecordDate: string | null,
    recordDate: string,
    currentStreak: number
): number {
    if (!lastRecordDate) return 1;

    // We assume recordDate is 'YYYY-MM-DD'
    const current = new Date(recordDate);
    current.setHours(0, 0, 0, 0);

    const last = new Date(lastRecordDate);
    last.setHours(0, 0, 0, 0);

    const diffTime = current.getTime() - last.getTime();
    const diffDays = Math.round(diffTime / (1000 * 3600 * 24));

    if (diffDays === 1) {
        return currentStreak + 1; // Consecutive day
    } else if (diffDays === 0) {
        return currentStreak; // Same day, streak doesn't increase
    } else if (diffDays > 1) {
        return 1; // Streak broken
    } else {
        // diffDays < 0 (recording past dates)
        return currentStreak;
    }
}

function buildHumanizedResponse(
    recordDate: string,
    dailySummary: { income: number; expense: number; profit: number; margin_pct: number },
    streakDays: number
): string {
    const fmtRp = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(n);
    
    // Format tanggal: 2026-06-16 -> 16 Juni 2026
    const dateObj = new Date(recordDate);
    const dateStr = dateObj.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const STREAK_MOTIVATIONS = [
        { min: 30, text: 'Luar biasa! Sebulan konsisten. Laporan KUR-mu sudah siap. 🏆' },
        { min: 14, text: 'Dua minggu berturut-turut! Laporanmu makin rapi.' },
        { min: 7, text: 'Seminggu penuh! Kamu lebih konsisten dari rata-rata UMKM. 🎉' },
        { min: 3, text: 'Bagus, pertahankan! 📈' },
        { min: 1, text: 'Yuk mulai konsisten mencatat hari demi hari! 💪' }
    ];

    const motivationObj = STREAK_MOTIVATIONS.find(m => streakDays >= m.min);
    const motivation = motivationObj ? motivationObj.text : 'Terus semangat mencatat!';

    return `Dicatat! ✅

📊 Ringkasan Hari Ini (${dateStr})
Pemasukan   : ${fmtRp(dailySummary.income)}
Pengeluaran : ${fmtRp(dailySummary.expense)}
Laba Kotor  : ${fmtRp(dailySummary.profit)} (${dailySummary.margin_pct}%)

🔥 Streak ${streakDays} hari! ${motivation}`;
}

export const recordTransaction = async (
    supabase: SupabaseClient<Database>,
    env: Partial<EnvBindings>,
    userId: string,
    businessProfile: BusinessProfile,
    message: string,
    recordDateInput?: string,
    imageUrls?: string[]
): Promise<RecordTransactionResponse> => {
    // 1. Get current date (WIB approx)
    const recordDate = recordDateInput || new Date(new Date().getTime() + 7 * 3600 * 1000).toISOString().split('T')[0];

    // 2. Call Azure OpenAI to parse
    const systemPrompt = buildParserPrompt(businessProfile.business_type).replace('FORMAT (JSON Array):\n[', 'FORMAT (JSON Object):\n{ "transactions": [').replace(']\n', ']\n}');
    
    // Merge image URLs into the message if provided
    let payloadMessage: any = message;
    if (imageUrls && imageUrls.length > 0) {
        payloadMessage = [
            { type: "text", text: `Pesan User: "${message}"\n\nTolong baca gambar struk/nota terlampir dan gabungkan dengan instruksi teks di atas.` }
        ];
        for (const url of imageUrls) {
            payloadMessage.push({ type: "image_url", image_url: { url: url } });
        }
    }

    let parsedTransactions: ParsedTransaction[] = [];
    
    try {
        const parsed = await askAIJson<{ transactions: ParsedTransaction[] }>(
            env,
            systemPrompt,
            payloadMessage, 
            0.1
        );
        parsedTransactions = parsed.transactions || parsed; // Handle both array and object wrapper
        if (!Array.isArray(parsedTransactions)) parsedTransactions = [];
    } catch (err) {
        console.error('[SnapCash] Parsing error:', err);
        throw new AppError(400, 'Gagal memahami pesan. Pastikan menyebutkan nominal transaksi.');
    }

    if (parsedTransactions.length === 0) {
        throw new AppError(400, 'Tidak ada transaksi yang terdeteksi. Sebutkan harga atau nominalnya.');
    }

    // 3. Validasi parsed transactions (cegah DB crash)
    for (const t of parsedTransactions) {
        if (t.amount == null || isNaN(t.amount)) {
            throw new AppError(400, 'Nominal uang tidak terdeteksi dengan jelas. Coba sebutkan angkanya lagi.');
        }
    }

    // 4. Hitung Streak (AMBIL LAST DATE SEBELUM INSERT)
    const lastDate = await financeRepo.getLastRecordDate(supabase, businessProfile.id);
    const newStreak = calculateStreak(lastDate, recordDate, businessProfile.streak_days);

    // 5. Prepare inserts
    const inserts = parsedTransactions.map(t => ({
        profile_id: businessProfile.id,
        record_date: recordDate,
        type: t.type,
        category: t.category,
        product_name: t.product_name,
        amount: t.amount,
        quantity: t.quantity,
        unit_price: t.unit_price,
        raw_input: message
    }));

    // 6. Save to DB
    const savedRecords = await financeRepo.insertRecords(supabase, inserts);

    // 7. Update streak di DB
    if (newStreak !== businessProfile.streak_days) {
        await financeRepo.updateProfileStreak(supabase, businessProfile.id, newStreak);
    }

    // 8. Get Daily Summary
    const dailySummary = await financeRepo.getSummaryByDate(supabase, businessProfile.id, recordDate);

    // 7. Build Humanized Response
    const aiResponse = buildHumanizedResponse(recordDate, dailySummary, newStreak);

    return {
        ai_response: aiResponse,
        transactions: savedRecords as any[], // mapped back to schema
        daily_summary: dailySummary,
        streak_days: newStreak
    };
};

export const getRecords = async (
    supabase: SupabaseClient<Database>,
    businessProfile: BusinessProfile,
    startDate?: string,
    endDate?: string,
    type?: 'income' | 'expense'
) => {
    const records = await financeRepo.getRecordsByProfileId(supabase, businessProfile.id, startDate, endDate, type);
    return {
        records: records as any[],
        total: records.length
    };
};

export const getSummary = async (
    supabase: SupabaseClient<Database>,
    businessProfile: BusinessProfile,
    period: 'daily' | 'monthly',
    date?: string,
    year?: string,
    month?: string
) => {
    if (period === 'daily') {
        const queryDate = date || new Date(new Date().getTime() + 7 * 3600 * 1000).toISOString().split('T')[0];
        const summary = await financeRepo.getSummaryByDate(supabase, businessProfile.id, queryDate);
        return {
            period: 'daily' as const,
            date: queryDate,
            ...summary
        };
    } else {
        const queryYear = parseInt(year || new Date().getFullYear().toString());
        const queryMonth = parseInt(month || (new Date().getMonth() + 1).toString());
        const summary = await financeRepo.getSummaryByMonth(supabase, businessProfile.id, queryYear, queryMonth);
        
        return {
            period: 'monthly' as const,
            year: queryYear,
            month: queryMonth,
            income: summary.income,
            expense: summary.expense,
            profit: summary.profit,
            margin_pct: summary.margin_pct,
            transaction_count: summary.transaction_count
        };
    }
};

export const getReport = async (
    supabase: SupabaseClient<Database>,
    businessProfile: BusinessProfile,
    year?: string,
    month?: string
) => {
    const queryYear = parseInt(year || new Date().getFullYear().toString());
    const queryMonth = parseInt(month || (new Date().getMonth() + 1).toString());
    
    const summary = await financeRepo.getSummaryByMonth(supabase, businessProfile.id, queryYear, queryMonth);
    
    // Group daily breakdown
    const dailyMap = new Map<string, { income: number, expense: number, profit: number }>();
    for (const row of summary.data) {
        if (!dailyMap.has(row.record_date)) {
            dailyMap.set(row.record_date, { income: 0, expense: 0, profit: 0 });
        }
        const stat = dailyMap.get(row.record_date)!;
        if (row.type === 'income') stat.income += row.amount;
        if (row.type === 'expense') stat.expense += row.amount;
        stat.profit = stat.income - stat.expense;
    }

    const dailyBreakdown = Array.from(dailyMap.entries()).map(([date, stat]) => ({
        date,
        ...stat
    })).sort((a, b) => a.date.localeCompare(b.date));

    // Calculate KUR readiness
    const has30Days = summary.recording_days >= 30;
    let kurMessage = "Laporan sudah lengkap (30+ hari pencatatan) dan siap digunakan untuk pengajuan KUR.";
    if (!has30Days) {
        kurMessage = `Kamu baru mencatat ${summary.recording_days} hari. Catat ${30 - summary.recording_days} hari lagi untuk mencapai syarat minimum laporan historis KUR bank.`;
    }
    if (!businessProfile.has_nib) {
        kurMessage += ' Eits, tapi NIB belum ada! Selesaikan dulu di Roadmap.';
    }

    return {
        business_name: businessProfile.business_name,
        business_type: businessProfile.business_type,
        period: `${queryMonth}/${queryYear}`, // simple string
        report_generated_at: new Date().toISOString(),
        summary: {
            total_income: summary.income,
            total_expense: summary.expense,
            gross_profit: summary.profit,
            gross_margin_pct: summary.margin_pct,
            recording_days: summary.recording_days,
            consistency_pct: Math.round((summary.recording_days / 30) * 100),
        },
        daily_breakdown: dailyBreakdown,
        kur_readiness: {
            has_nib: businessProfile.has_nib,
            has_30_days_records: has30Days,
            days_recorded: summary.recording_days,
            message: kurMessage
        }
    };
};
