import { z } from '@hono/zod-openapi';
import { Database } from '../types/database.types';

type StepType = Database['public']['Enums']['step_type_enum'];

export const chatRequestBodySchema = z.object({
    message: z.string().min(1),
    session_id: z.string().optional(),
    context_step_type: z.string().optional(),
}).openapi('ChatRequestBody');

export interface ChatRequestBody {
    message: string;
    session_id?: string;
    context_step_type?: StepType;
}
