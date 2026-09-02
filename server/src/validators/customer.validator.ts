import { z } from 'zod';

export const createCustomerSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  phone: z.string().trim().optional(),
  email: z.string().email().toLowerCase().trim().optional().or(z.literal('')),
  location: z.string().trim().optional(),
  preferredContactMethod: z.enum(['sms', 'email', 'phone']).optional(),
  assignedUserId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  communicationConsent: z
    .object({
      sms: z.boolean().default(true),
      email: z.boolean().default(true),
      phone: z.boolean().default(true),
    })
    .optional(),
  doNotContact: z.boolean().optional(),
});

export const updateCustomerSchema = createCustomerSchema.partial();

export const customerQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  assignedUserId: z.string().optional(),
  tag: z.string().optional(),
});

export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CustomerQueryInput = z.infer<typeof customerQuerySchema>;
