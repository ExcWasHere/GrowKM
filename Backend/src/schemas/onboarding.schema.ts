import { z } from '@hono/zod-openapi';

export const validateDescriptionSchema = z.object({
    description: z.string().min(10).openapi({
        example: 'Menjual nasi goreng dan mie goreng di gerobak keliling. Buka malam hari di area perumahan.'
    })
}).openapi('ValidateDescription');

export type ValidateDescriptionInput = z.infer<typeof validateDescriptionSchema>;

export const validateDescriptionResponseSchema = z.object({
    is_valid: z.boolean(),
    feedback: z.string().optional(),
});
