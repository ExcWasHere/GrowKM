import { OpenAPIHono, createRoute } from '@hono/zod-openapi';
import * as financeController from '../controllers/snapcash.controller';
import { z } from '@hono/zod-openapi';
import { HonoEnv } from '../types/env';
import {
    recordTransactionBodySchema,
    recordTransactionResponseSchema,
    getRecordsQuerySchema,
    getRecordsResponseSchema,
    getSummaryQuerySchema,
    getSummaryResponseSchema,
    getReportQuerySchema,
    getReportResponseSchema
} from '../schemas/snapcash.schema';

const financeRoutes = new OpenAPIHono<HonoEnv>();

const recordTransactionRoute = createRoute({
    method: 'post',
    path: '/record',
    tags: ['Finance'],
    summary: 'Record Financial Transaction',
    description: 'Uses AI to parse a natural language message into structured financial transactions and updates the streak.',
    security: [{ BearerAuth: [] }],
    request: {
        body: {
            content: {
                'application/json': {
                    schema: recordTransactionBodySchema,
                },
            },
        },
    },
    responses: {
        200: {
            description: 'Transaction recorded successfully',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        message: z.string(),
                        data: recordTransactionResponseSchema
                    }),
                },
            },
        },
    },
});

const getRecordsRoute = createRoute({
    method: 'get',
    path: '/records',
    tags: ['Finance'],
    summary: 'Get Financial Records',
    description: 'Retrieve a list of financial records with optional date and type filters.',
    security: [{ BearerAuth: [] }],
    request: {
        query: getRecordsQuerySchema
    },
    responses: {
        200: {
            description: 'List of records',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        data: getRecordsResponseSchema
                    })
                }
            }
        }
    }
});

const getSummaryRoute = createRoute({
    method: 'get',
    path: '/summary',
    tags: ['Finance'],
    summary: 'Get Financial Summary',
    description: 'Get daily or monthly financial aggregation.',
    security: [{ BearerAuth: [] }],
    request: {
        query: getSummaryQuerySchema
    },
    responses: {
        200: {
            description: 'Summary data',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        data: getSummaryResponseSchema
                    })
                }
            }
        }
    }
});

const getReportRoute = createRoute({
    method: 'get',
    path: '/report',
    tags: ['Finance'],
    summary: 'Get KUR Readiness Report',
    description: 'Generates a full monthly report including daily breakdown and KUR readiness status.',
    security: [{ BearerAuth: [] }],
    request: {
        query: getReportQuerySchema
    },
    responses: {
        200: {
            description: 'Report data',
            content: {
                'application/json': {
                    schema: z.object({
                        status: z.literal('success'),
                        data: getReportResponseSchema
                    })
                }
            }
        }
    }
});

const getReportExcelRoute = createRoute({
    method: 'get',
    path: '/report/excel',
    tags: ['Finance'],
    summary: 'Download KUR Excel Report',
    description: 'Generates and downloads the monthly financial report as an Excel (.xlsx) file.',
    security: [{ BearerAuth: [] }],
    request: {
        query: getReportQuerySchema
    },
    responses: {
        200: {
            description: 'Excel file',
            content: {
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
                    schema: {
                        type: 'string',
                        format: 'binary'
                    }
                }
            }
        }
    }
});

financeRoutes.openapi(recordTransactionRoute, financeController.handleRecordTransaction);
financeRoutes.openapi(getRecordsRoute, financeController.handleGetRecords);
financeRoutes.openapi(getSummaryRoute, financeController.handleGetSummary);
financeRoutes.openapi(getReportRoute, financeController.handleGetReport);
financeRoutes.openapi(getReportExcelRoute, financeController.handleGetReportExcel);

export default financeRoutes;
