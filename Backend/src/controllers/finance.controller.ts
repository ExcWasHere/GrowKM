import { Context } from 'hono';
import { HonoEnv } from '../types/env';
import * as financeService from '../services/business/finance.service';
import * as excelService from '../services/business/excel.service';
import * as userRepository from '../repositories/user.repository';
import { AppError } from '../middlewares/error.middleware';

export const handleRecordTransaction = async (c: any) => {
    const userId = c.get('userId');
    const supabase = c.get('supabase');
    const env = c.env;
    const body = c.req.valid('json');

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const result = await financeService.recordTransaction(
        supabase,
        env,
        userId,
        businessProfile,
        body.message,
        body.record_date
    );

    return c.json({
        status: 'success' as const,
        message: 'Transaction recorded successfully',
        data: result
    }, 200);
};

export const handleGetRecords = async (c: any) => {
    const userId = c.get('userId');
    const supabase = c.get('supabase');
    const query = c.req.valid('query');

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const result = await financeService.getRecords(
        supabase,
        businessProfile,
        query.start_date,
        query.end_date,
        query.type
    );

    return c.json({
        status: 'success' as const,
        data: result
    }, 200);
};

export const handleGetSummary = async (c: any) => {
    const userId = c.get('userId');
    const supabase = c.get('supabase');
    const query = c.req.valid('query');

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const result = await financeService.getSummary(
        supabase,
        businessProfile,
        query.period,
        query.date,
        query.year,
        query.month
    );

    return c.json({
        status: 'success' as const,
        data: result
    }, 200);
};

export const handleGetReport = async (c: any) => {
    const userId = c.get('userId');
    const supabase = c.get('supabase');
    const query = c.req.valid('query');

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const result = await financeService.getReport(
        supabase,
        businessProfile,
        query.year,
        query.month
    );

    return c.json({
        status: 'success' as const,
        data: result
    }, 200);
};

export const handleGetReportExcel = async (c: any) => {
    const userId = c.get('userId');
    const supabase = c.get('supabase');
    const query = c.req.valid('query');

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const reportData = await financeService.getReport(
        supabase,
        businessProfile,
        query.year,
        query.month
    );

    const buffer = excelService.generateKurExcelBuffer(reportData);

    const filename = `Laporan_Keuangan_${businessProfile.business_name?.replace(/\s+/g, '_') || 'Usaha'}_${reportData.period.replace('/', '_')}.xlsx`;

    return c.body(buffer, 200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
    });
};
