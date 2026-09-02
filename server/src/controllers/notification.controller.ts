import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';

export async function getNotifications(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: notifications } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('dealership_id', req.tenant.dealershipId)
      .order('created_at', { ascending: false })
      .limit(30);

    sendSuccess(res, { data: notifications || [] });
  } catch (err) {
    next(err);
  }
}

export async function markAsRead(_req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    sendSuccess(res, { message: 'Notifications marked as read' });
  } catch (err) {
    next(err);
  }
}
