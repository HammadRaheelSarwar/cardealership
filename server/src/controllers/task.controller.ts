import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';

export async function getTasks(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    let query = supabase
      .from('tasks')
      .select('*, assigned_user:profiles(*), lead:leads(*), customer:customers(*)')
      .eq('dealership_id', req.tenant.dealershipId)
      .is('deleted_at', null);

    if (req.tenant.role === 'salesperson') {
      query = query.eq('assigned_user_id', req.user.id);
    }

    const { data: tasks, error } = await query.order('due_at', { ascending: true });
    if (error) throw new AppError(error.message, 500);

    sendSuccess(res, { data: tasks || [] });
  } catch (err) {
    next(err);
  }
}

export async function createTask(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const body = req.body;
    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        dealership_id: req.tenant.dealershipId,
        lead_id: body.leadId || null,
        customer_id: body.customerId || null,
        assigned_user_id: body.assignedUserId || req.user.id,
        created_by_user_id: req.user.id,
        type: body.type || 'follow_up',
        title: body.title,
        description: body.description,
        priority: body.priority || 'medium',
        due_at: new Date(body.dueAt).toISOString(),
        status: 'pending',
      })
      .select('*, assigned_user:profiles(*)')
      .single();

    if (error || !task) throw new AppError(`Failed to create task: ${error?.message}`, 400);

    sendSuccess(res, { statusCode: 201, message: 'Task created', data: { task } });
  } catch (err) {
    next(err);
  }
}

export async function updateTaskStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { status } = req.body as { status: 'pending' | 'completed' | 'cancelled' };
    const { data: task, error } = await supabase
      .from('tasks')
      .update({
        status,
        ...(status === 'completed' ? { completed_at: new Date().toISOString() } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();

    if (error || !task) throw new AppError('Task not found', 404);

    sendSuccess(res, { message: `Task status updated to ${status}`, data: { task } });
  } catch (err) {
    next(err);
  }
}
