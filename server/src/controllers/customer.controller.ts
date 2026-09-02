import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';
import { sendSuccess, sendPaginated } from '../utils/response';

export async function getCustomers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    let query = supabase
      .from('customers')
      .select('*, assigned_user:profiles(*)', { count: 'exact' })
      .eq('dealership_id', req.tenant.dealershipId)
      .is('deleted_at', null);

    if (req.query.search) {
      const s = `%${req.query.search}%`;
      query = query.or(`first_name.ilike.${s},last_name.ilike.${s},email.ilike.${s},phone.ilike.${s}`);
    }

    const { data: customers, count, error } = await query
      .order('created_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw new AppError(error.message, 500);

    sendPaginated(res, customers || [], { page, limit, total: count || 0 });
  } catch (err) {
    next(err);
  }
}

export async function getCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*, assigned_user:profiles(*)')
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .is('deleted_at', null)
      .single();

    if (error || !customer) throw new AppError('Customer not found', 404);

    const [leadsRes, messagesRes, tasksRes, appointmentsRes] = await Promise.all([
      supabase.from('leads').select('*, stage:pipeline_stages(*)').eq('customer_id', customer.id).is('deleted_at', null),
      supabase.from('messages').select('*').eq('customer_id', customer.id).order('created_at', { ascending: false }).limit(20),
      supabase.from('tasks').select('*').eq('customer_id', customer.id).is('deleted_at', null),
      supabase.from('appointments').select('*').eq('customer_id', customer.id),
    ]);

    sendSuccess(res, {
      data: {
        customer,
        leads: leadsRes.data || [],
        messages: messagesRes.data || [],
        tasks: tasksRes.data || [],
        appointments: appointmentsRes.data || [],
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function createCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body;
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        dealership_id: req.tenant.dealershipId,
        first_name: body.firstName,
        last_name: body.lastName,
        email: body.email,
        phone: body.phone,
        location: body.location,
        preferred_contact_method: body.preferredContactMethod,
        assigned_user_id: body.assignedUserId || req.user.id,
        tags: body.tags || [],
      })
      .select('*, assigned_user:profiles(*)')
      .single();

    if (error || !customer) throw new AppError(`Failed to create customer: ${error?.message}`, 400);

    sendSuccess(res, { statusCode: 201, message: 'Customer created', data: { customer } });
  } catch (err) {
    next(err);
  }
}

export async function updateCustomer(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .update({ ...req.body, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();

    if (error || !customer) throw new AppError('Customer not found', 404);

    sendSuccess(res, { message: 'Customer updated', data: { customer } });
  } catch (err) {
    next(err);
  }
}
