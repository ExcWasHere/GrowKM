import { Context } from 'hono';
import { getAuthClient } from '../middlewares/auth.middleware';
import { successResponse } from '../utils/response.util';
import { ValidateDescriptionInput } from '../schemas/onboarding.schema';
import { validateDescription } from '../services/business/onboarding.service';

// POST /api/onboarding/validate-description
export const handleValidateDescription = async (c: Context) => {
    const { description } = (await c.req.json()) as ValidateDescriptionInput;

    const result = await validateDescription(description, c.env);
    return successResponse(c, result, 'Validation complete');
};
