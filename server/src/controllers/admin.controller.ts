import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';

export class AdminController {
  static async getPlatformStats(_req: Request, res: Response, next: NextFunction) {
    try {
      const [totalDealerships, activeDealerships, totalUsers, totalLeads, totalMessages] =
        await Promise.all([
          supabase.from('dealerships').select('id', { count: 'exact' }),
          supabase.from('dealerships').select('id', { count: 'exact' }).eq('status', 'active'),
          supabase.from('profiles').select('id', { count: 'exact' }),
          supabase.from('leads').select('id', { count: 'exact' }),
          supabase.from('messages').select('id', { count: 'exact' }),
        ]);

      sendSuccess(res, {
        data: {
          totalDealerships: totalDealerships.count || 0,
          activeDealerships: activeDealerships.count || 0,
          totalUsers: totalUsers.count || 0,
          totalLeads: totalLeads.count || 0,
          totalMessages: totalMessages.count || 0,
          systemStatus: 'healthy',
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getDealerships(_req: Request, res: Response, next: NextFunction) {
    try {
      const { data: dealerships, error } = await supabase
        .from('dealerships')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      sendSuccess(res, { data: dealerships || [] });
    } catch (err) {
      next(err);
    }
  }

  static async toggleDealershipStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      const { data: dealership, error } = await supabase
        .from('dealerships')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error || !dealership) {
        res.status(404).json({ success: false, message: 'Dealership not found' });
        return;
      }

      sendSuccess(res, { message: `Dealership status updated to ${status}`, data: { dealership } });
    } catch (err) {
      next(err);
    }
  }
}
