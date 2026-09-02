import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';
import { sendSuccess, sendPaginated } from '../utils/response';

export async function getVehicles(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = supabase
      .from('vehicles')
      .select('*, images:vehicle_images(*)', { count: 'exact' })
      .eq('dealership_id', req.tenant.dealershipId)
      .is('deleted_at', null);

    if (req.query.search) {
      const s = `%${req.query.search}%`;
      query = query.or(`make.ilike.${s},model.ilike.${s},vin.ilike.${s},stock_number.ilike.${s}`);
    }

    if (req.query.status) {
      query = query.eq('status', req.query.status as string);
    }

    const { data: vehicles, count, error } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw new AppError(error.message, 500);

    sendPaginated(res, vehicles || [], { page, limit, total: count || 0 });
  } catch (err) {
    next(err);
  }
}

export async function getVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .select('*, images:vehicle_images(*)')
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .is('deleted_at', null)
      .single();

    if (error || !vehicle) throw new AppError('Vehicle not found', 404);

    sendSuccess(res, { data: { vehicle } });
  } catch (err) {
    next(err);
  }
}

export async function createVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .insert({
        ...req.body,
        dealership_id: req.tenant.dealershipId,
        status: req.body.status || 'available',
      })
      .select()
      .single();

    if (error || !vehicle) throw new AppError(`Failed to create vehicle: ${error?.message}`, 400);

    sendSuccess(res, { statusCode: 201, message: 'Vehicle created', data: { vehicle } });
  } catch (err) {
    next(err);
  }
}

export async function updateVehicle(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: vehicle, error } = await supabase
      .from('vehicles')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();

    if (error || !vehicle) throw new AppError('Vehicle not found', 404);

    sendSuccess(res, { message: 'Vehicle updated', data: { vehicle } });
  } catch (err) {
    next(err);
  }
}
