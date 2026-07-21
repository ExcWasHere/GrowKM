import { z } from '@hono/zod-openapi';

const FINANCIAL_TYPES = ['income', 'expense'] as const;

export const transactionSchema = z.object({
    id: z.string().uuid().openapi({ example: '123e4567-e89b-12d3-a456-426614174000' }),
    type: z.enum(FINANCIAL_TYPES).openapi({ example: 'income' }),
    category: z.string().nullable().openapi({ example: 'bahan_baku' }),
    product_name: z.string().nullable().openapi({ example: 'Nasi Goreng' }),
    amount: z.number().int().positive().openapi({ example: 500000 }),
    quantity: z.number().int().positive().nullable().openapi({ example: 20 }),
    unit_price: z.number().int().positive().nullable().openapi({ example: 25000 }),
    record_date: z.string().openapi({ example: '2026-06-16' }),
    created_at: z.string().datetime().openapi({ example: '2026-06-16T10:00:00.000Z' }),
}).openapi('Transaction');

export const recordTransactionBodySchema = z.object({
    message: z.string().min(2).openapi({ example: 'Jual 20 porsi nasi @25rb. Belanja bahan 180rb.' }),
    record_date: z.string().optional().openapi({ example: '2026-06-16' }), // YYYY-MM-DD
    images: z.array(z.string().url()).optional().openapi({ example: ['https://pub-r2.com/nota.jpg'] }),
}).openapi('RecordTransactionBody');

export const recordTransactionResponseSchema = z.object({
    ai_response: z.string().openapi({ example: 'Dicatat! ✅\n\n📊 Ringkasan Hari Ini...' }),
    transactions: z.array(transactionSchema),
    daily_summary: z.object({
        income: z.number().int().openapi({ example: 500000 }),
        expense: z.number().int().openapi({ example: 180000 }),
        profit: z.number().int().openapi({ example: 320000 }),
        margin_pct: z.number().openapi({ example: 64 }),
    }),
    streak_days: z.number().int().openapi({ example: 13 }),
}).openapi('RecordTransactionResponse');

export const getRecordsQuerySchema = z.object({
    start_date: z.string().optional().openapi({ example: '2026-05-16' }),
    end_date: z.string().optional().openapi({ example: '2026-06-16' }),
    type: z.enum(FINANCIAL_TYPES).optional(),
}).openapi('GetRecordsQuery');

export const getRecordsResponseSchema = z.object({
    records: z.array(transactionSchema),
    total: z.number().int().openapi({ example: 42 }),
}).openapi('GetRecordsResponse');

export const getSummaryQuerySchema = z.object({
    period: z.enum(['daily', 'monthly']).default('daily').openapi({ example: 'daily' }),
    date: z.string().optional().openapi({ example: '2026-06-16' }),
    year: z.string().optional().openapi({ example: '2026' }),
    month: z.string().optional().openapi({ example: '6' }),
}).openapi('GetSummaryQuery');

export const getSummaryResponseSchema = z.object({
    period: z.enum(['daily', 'monthly']).openapi({ example: 'daily' }),
    date: z.string().optional().openapi({ example: '2026-06-16' }),
    year: z.number().int().optional().openapi({ example: 2026 }),
    month: z.number().int().optional().openapi({ example: 6 }),
    income: z.number().int().openapi({ example: 500000 }),
    expense: z.number().int().openapi({ example: 180000 }),
    profit: z.number().int().openapi({ example: 320000 }),
    margin_pct: z.number().openapi({ example: 64 }),
    transaction_count: z.number().int().openapi({ example: 3 }),
}).openapi('GetSummaryResponse');

export const getReportQuerySchema = z.object({
    year: z.string().optional().openapi({ example: '2026' }),
    month: z.string().optional().openapi({ example: '6' }),
}).openapi('GetReportQuery');

export const getReportResponseSchema = z.object({
    business_name: z.string().nullable().openapi({ example: 'Warung Nasi Bu Rina' }),
    business_type: z.string().openapi({ example: 'kuliner' }),
    period: z.string().openapi({ example: 'Juni 2026' }),
    report_generated_at: z.string().datetime(),
    summary: z.object({
        total_income: z.number().int(),
        total_expense: z.number().int(),
        gross_profit: z.number().int(),
        gross_margin_pct: z.number(),
        recording_days: z.number().int(),
        consistency_pct: z.number(),
    }),
    daily_breakdown: z.array(z.object({
        date: z.string(),
        income: z.number().int(),
        expense: z.number().int(),
        profit: z.number().int(),
    })),
    kur_readiness: z.object({
        has_nib: z.boolean(),
        has_30_days_records: z.boolean(),
        days_recorded: z.number().int(),
        message: z.string(),
    }),
}).openapi('GetReportResponse');

export type Transaction = z.infer<typeof transactionSchema>;
export type RecordTransactionBody = z.infer<typeof recordTransactionBodySchema>;
export type RecordTransactionResponse = z.infer<typeof recordTransactionResponseSchema>;
export type GetRecordsQuery = z.infer<typeof getRecordsQuerySchema>;
export type GetRecordsResponse = z.infer<typeof getRecordsResponseSchema>;
export type GetSummaryQuery = z.infer<typeof getSummaryQuerySchema>;
export type GetSummaryResponse = z.infer<typeof getSummaryResponseSchema>;
export type GetReportQuery = z.infer<typeof getReportQuerySchema>;
export type GetReportResponse = z.infer<typeof getReportResponseSchema>;
