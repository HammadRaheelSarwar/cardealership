import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';

export async function getAppointments(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let query = supabase
      .from('appointments')
      .select('*, customer:customers(*), vehicle:vehicles(*), assigned_user:profiles(*)')
      .eq('dealership_id', req.tenant.dealershipId);

    if (req.tenant.role === 'salesperson') {
      query = query.eq('assigned_user_id', req.user.id);
    }

    const { data: appointments, error } = await query.order('starts_at', { ascending: true });
    if (error) throw new AppError(error.message, 500);

    sendSuccess(res, { data: appointments || [] });
  } catch (err) {
    next(err);
  }
}

export async function createAppointment(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body;
    const { data: appointment, error } = await supabase
      .from('appointments')
      .insert({
        dealership_id: req.tenant.dealershipId,
        lead_id: body.leadId || null,
        customer_id: body.customerId || null,
        vehicle_id: body.vehicleId || null,
        assigned_user_id: body.assignedUserId || req.user.id,
        type: body.type || 'test_drive',
        starts_at: new Date(body.startsAt).toISOString(),
        ends_at: new Date(body.endsAt).toISOString(),
        timezone: body.timezone || 'UTC',
        location: body.location,
        notes: body.notes,
        status: 'scheduled',
      })
      .select('*, customer:customers(*), vehicle:vehicles(*), assigned_user:profiles(*)')
      .single();

    if (error || !appointment) throw new AppError(`Failed to create appointment: ${error?.message}`, 400);

    sendSuccess(res, { statusCode: 201, message: 'Appointment created', data: { appointment } });
  } catch (err) {
    next(err);
  }
}

export async function updateAppointmentStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body as { status: string };
    const { data: appointment, error } = await supabase
      .from('appointments')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();

    if (error || !appointment) throw new AppError('Appointment not found', 404);

    sendSuccess(res, { message: `Appointment status updated to ${status}`, data: { appointment } });
  } catch (err) {
    next(err);
  }
}
