import { Context } from 'hono';
import { HonoEnv } from '../types/env';
import { RecordTransactionBody, GetRecordsQuery, GetSummaryQuery, GetReportQuery } from '../schemas/snapcash.schema';
import { getAuthClient, getUserId } from '../middlewares/auth.middleware';
import * as snapCashService from '../services/business/snapcash.service';
import * as excelService from '../services/business/excel.service';
import * as userRepository from '../repositories/user.repository';
import * as idempotencyRepository from '../repositories/idempotency.repository';
import { AppError } from '../middlewares/error.middleware';

export const handleRecordTransaction = async (c: Context<HonoEnv>) => {
    const userId = getUserId(c);
    const supabase = getAuthClient(c);
    const env = c.env;

    const idempotencyKey = c.req.header('X-Idempotency-Key');

    if (!idempotencyKey) {
        throw new AppError(400, 'Bad Request: Missing idempotency key');
    }

    const body = (await c.req.json()) as RecordTransactionBody;
    const businessProfile = await userRepository.getBusinessProfileByUserId(supabase, userId);
    if (!businessProfile) throw new AppError(404, 'Business profile not found');

    const idempotencyKeyData = await idempotencyRepository.getIdempotencyKey(supabase, idempotencyKey, businessProfile.id);

    if (idempotencyKeyData && idempotencyKeyData.status === 'completed') {
        return c.json({
            status: 'success' as const,
            message: 'Transaction already processed',
            data: idempotencyKeyData.response_body as any
        }, 200);
    }

    if (idempotencyKeyData && idempotencyKeyData.status === 'processing') {
        throw new AppError(409, 'Conflict: Transaction is already being processed');
    }

    // Lock status to processing (could be new insert or retry from failed)
    await idempotencyRepository.lockIdempotencyKey(supabase, idempotencyKey, businessProfile.id);

    try {
        const result = await snapCashService.recordTransaction(
            supabase,
            env,
            userId,
            businessProfile,
            body.message,
            body.record_date,
            body.images
        );

        // If successful, save the JSON response
        await idempotencyRepository.updateIdempotencyKey(supabase, idempotencyKey, businessProfile.id, 'completed', result);

        return c.json({
            status: 'success' as const,
            message: 'Transaction recorded successfully',
            data: result as any
        }, 200);
    } catch (error) {
        // If failed, update status to failed to allow retry
        await idempotencyRepository.updateIdempotencyKey(supabase, idempotencyKey, businessProfile.id, 'failed');
        throw error;
    }
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
