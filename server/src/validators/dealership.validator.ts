import { z } from 'zod';

export const createDealershipSchema = z.object({
  name: z.string().trim().min(2, 'Dealership name is required').max(200),
  email: z.string().email('Invalid dealership email address').toLowerCase().trim(),
  phone: z.string().trim().optional(),
  website: z.string().trim().optional().or(z.literal('')),
  timezone: z.string().default('America/New_York'),
  address: z
    .object({
      street: z.string().trim().optional(),
      city: z.string().trim().optional(),
      state: z.string().trim().optional(),
      zip: z.string().trim().optional(),
      country: z.string().trim().default('US'),
    })
    .optional(),
});

export const updateDealershipSchema = createDealershipSchema.partial();

export type CreateDealershipInput = z.infer<typeof createDealershipSchema>;
export type UpdateDealershipInput = z.infer<typeof updateDealershipSchema>;
