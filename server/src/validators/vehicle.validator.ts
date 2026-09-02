import { z } from 'zod';

export const createVehicleSchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  make: z.string().trim().min(1),
  model: z.string().trim().min(1),
  trim: z.string().trim().optional(),
  vin: z.string().trim().toUpperCase().optional(),
  stockNumber: z.string().trim().optional(),
  mileage: z.coerce.number().min(0).optional(),
  price: z.coerce.number().min(0).optional(),
  exteriorColor: z.string().trim().optional(),
  interiorColor: z.string().trim().optional(),
  transmission: z.enum(['automatic', 'manual', 'cvt', 'other']).optional(),
  fuelType: z.enum(['gasoline', 'diesel', 'hybrid', 'electric', 'other']).optional(),
  status: z.enum(['available', 'reserved', 'pending', 'sold']).default('available'),
  description: z.string().max(5000).optional(),
});

export const updateVehicleSchema = createVehicleSchema.partial();

export const vehicleQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().optional(),
  status: z.enum(['available', 'reserved', 'pending', 'sold']).optional(),
  make: z.string().optional(),
  minYear: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
});

export type CreateVehicleInput = z.infer<typeof createVehicleSchema>;
export type UpdateVehicleInput = z.infer<typeof updateVehicleSchema>;
export type VehicleQueryInput = z.infer<typeof vehicleQuerySchema>;
