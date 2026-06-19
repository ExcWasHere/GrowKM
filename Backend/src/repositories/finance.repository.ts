import { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '../types/database.types';

type FinancialRecord = Database['public']['Tables']['financial_records']['Row'];
type InsertFinancialRecord = Database['public']['Tables']['financial_records']['Insert'];

export const insertRecords = async (
    supabase: SupabaseClient<Database>,
    records: InsertFinancialRecord[]
): Promise<FinancialRecord[]> => {
    const { data, error } = await supabase
        .from('financial_records')
        .insert(records)
        .select('*');

    if (error) throw new Error(`Failed to insert financial records: ${error.message}`);
    return data;
};

export const getRecordsByProfileId = async (
    supabase: SupabaseClient<Database>,
    profileId: string,
    startDate?: string,
    endDate?: string,
    type?: 'income' | 'expense'
): Promise<FinancialRecord[]> => {
    let query = supabase
        .from('financial_records')
        .select('*')
        .eq('profile_id', profileId)
        .order('record_date', { ascending: false })
        .order('created_at', { ascending: false });

    if (startDate) query = query.gte('record_date', startDate);
    if (endDate) query = query.lte('record_date', endDate);
    if (type) query = query.eq('type', type);

    const { data, error } = await query;
    if (error) throw new Error(`Failed to get financial records: ${error.message}`);
    return data;
};

export const getSummaryByDate = async (
    supabase: SupabaseClient<Database>,
    profileId: string,
    date: string
) => {
    const { data, error } = await supabase
        .from('financial_records')
        .select('type, amount')
        .eq('profile_id', profileId)
        .eq('record_date', date);

    if (error) throw new Error(`Failed to get daily summary: ${error.message}`);

    let income = 0;
    let expense = 0;

    for (const row of data) {
        if (row.type === 'income') income += row.amount;
        if (row.type === 'expense') expense += row.amount;
    }

    return {
        income,
        expense,
        profit: income - expense,
        margin_pct: income > 0 ? Math.round(((income - expense) / income) * 1000) / 10 : 0,
        transaction_count: data.length
    };
};

export const getSummaryByMonth = async (
    supabase: SupabaseClient<Database>,
    profileId: string,
    year: number,
    month: number
) => {
    const startDate = `${year}-${String(month).padStart(2, '0')}-01`;
    const nextMonth = month === 12 ? 1 : month + 1;
    const nextYear = month === 12 ? year + 1 : year;
    const endDate = `${nextYear}-${String(nextMonth).padStart(2, '0')}-01`;

    const { data, error } = await supabase
        .from('financial_records')
        .select('type, amount, record_date')
        .eq('profile_id', profileId)
        .gte('record_date', startDate)
        .lt('record_date', endDate);

    if (error) throw new Error(`Failed to get monthly summary: ${error.message}`);

    let income = 0;
    let expense = 0;
    const recordingDays = new Set<string>();

    for (const row of data) {
        if (row.type === 'income') income += row.amount;
        if (row.type === 'expense') expense += row.amount;
        recordingDays.add(row.record_date);
    }

    return {
        income,
        expense,
        profit: income - expense,
        margin_pct: income > 0 ? Math.round(((income - expense) / income) * 1000) / 10 : 0,
        transaction_count: data.length,
        recording_days: recordingDays.size,
        data // return raw data for daily breakdown
    };
};

export const updateProfileStreak = async (
    supabase: SupabaseClient<Database>,
    profileId: string,
    streakDays: number
) => {
    const { error } = await supabase
        .from('business_profiles')
        .update({ streak_days: streakDays })
        .eq('id', profileId);

    if (error) throw new Error(`Failed to update streak: ${error.message}`);
};

export const getLastRecordDate = async (
    supabase: SupabaseClient<Database>,
    profileId: string
): Promise<string | null> => {
    const { data, error } = await supabase
        .from('financial_records')
        .select('record_date')
        .eq('profile_id', profileId)
        .order('record_date', { ascending: false })
        .limit(1)
        .single();

    if (error) {
        // PostgrestError: JSON object requested, multiple (or no) rows returned
        if (error.code === 'PGRST116') return null;
        throw new Error(`Failed to get last record date: ${error.message}`);
    }

    return data?.record_date ?? null;
};
