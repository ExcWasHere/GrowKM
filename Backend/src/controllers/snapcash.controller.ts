import { Context } from 'hono';
import { HonoEnv } from '../types/env';
import { RecordTransactionBody, GetRecordsQuery, GetSummaryQuery, GetReportQuery } from '../schemas/snapcash.schema';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import * as snapCashService from '../services/business/snapcash.service';
import * as excelService from '../services/business/excel.service';
import * as userRepository from '../repositories/user.repository';
import { AppError } from '../middlewares/error.middleware';

export const handleRecordTransaction = async (c: Context<HonoEnv>) => {
    const userId = getUserId(c);
    const supabase = getAuthClient(c);
    const env = c.env;
    const body = (await c.req.json()) as RecordTransactionBody;

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const result = await snapCashService.recordTransaction(
        supabase,
        env,
        userId,
        businessProfile,
        body.message,
        body.record_date,
        body.images
    );

    return c.json({
        status: 'success' as const,
        message: 'Transaction recorded successfully',
        data: result
    }, 200);
};

export const handleGetRecords = async (c: Context<HonoEnv>) => {
    const userId = getUserId(c);
    const supabase = getAuthClient(c);
    const query = (c.req.query() as unknown) as GetRecordsQuery;

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const result = await snapCashService.getRecords(
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

export const handleGetSummary = async (c: Context<HonoEnv>) => {
    const userId = getUserId(c);
    const supabase = getAuthClient(c);
    const query = (c.req.query() as unknown) as GetSummaryQuery;

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const result = await snapCashService.getSummary(
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

export const handleGetReport = async (c: Context<HonoEnv>) => {
    const userId = getUserId(c);
    const supabase = getAuthClient(c);
    const query = (c.req.query() as unknown) as GetReportQuery;

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const result = await snapCashService.getReport(
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

export const handleGetReportExcel = async (c: Context<HonoEnv>) => {
    const userId = getUserId(c);
    const supabase = getAuthClient(c);
    const query = (c.req.query() as unknown) as GetReportQuery;

    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const reportData = await snapCashService.getReport(
        supabase,
        businessProfile,
        query.year,
        query.month
    );

    const buffer = excelService.generateKurExcelBuffer(reportData);

    const filename = `Laporan_Keuangan_${businessProfile.business_name?.replace(/\s+/g, '_') || 'Usaha'}_${reportData.period.replace('/', '_')}.xlsx`;

    return c.body(buffer as any, 200, {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`
    });
};
