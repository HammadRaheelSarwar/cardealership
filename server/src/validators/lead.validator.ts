import { z } from 'zod';

export const createLeadSchema = z.object({
  customerId: z.string().optional(),
  // Or create customer on the fly
  newCustomer: z
    .object({
      firstName: z.string().trim().min(1),
      lastName: z.string().trim().min(1),
      phone: z.string().trim().optional(),
      email: z.string().email().toLowerCase().trim().optional().or(z.literal('')),
      location: z.string().optional(),
    })
    .optional(),
  vehicleId: z.string().optional(),
  assignedUserId: z.string().optional(),
  sourceId: z.string().optional(),
  pipelineStageId: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).default('medium'),
  temperature: z.enum(['cold', 'warm', 'hot']).default('warm'),
  estimatedValue: z.coerce.number().min(0).optional(),
  notes: z.string().max(5000).optional(),
  nextFollowUpAt: z.string().datetime().optional(),
});

export const updateLeadStageSchema = z.object({
  pipelineStageId: z.string().min(1),
});

export const assignLeadSchema = z.object({
  assignedUserId: z.string().min(1),
});

export const updateLeadTemperatureSchema = z.object({
  temperature: z.enum(['cold', 'warm', 'hot']),
});

export const markLeadLostSchema = z.object({
  lostReason: z.string().min(1).max(500),
});

export const markLeadSoldSchema = z.object({
  soldValue: z.coerce.number().min(0),
  vehicleId: z.string().optional(),
});

export const leadQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  stageId: z.string().optional(),
  assignedUserId: z.string().optional(),
  sourceId: z.string().optional(),
  temperature: z.enum(['cold', 'warm', 'hot']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['open', 'won', 'lost', 'archived']).optional(),
  search: z.string().optional(),
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type LeadQueryInput = z.infer<typeof leadQuerySchema>;
