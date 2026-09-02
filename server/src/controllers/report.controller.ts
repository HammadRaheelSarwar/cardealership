import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';

export class ReportController {
  static async getSummary(req: Request, res: Response, next: NextFunction) {
    try {
      const dealershipId = req.tenant.dealershipId;

      const [totalLeads, wonLeads, lostLeads, totalCustomers, totalAppointments, overdueTasks, unreadMessages] =
        await Promise.all([
          supabase.from('leads').select('id', { count: 'exact' }).eq('dealership_id', dealershipId).is('deleted_at', null),
          supabase.from('leads').select('id', { count: 'exact' }).eq('dealership_id', dealershipId).eq('status', 'won').is('deleted_at', null),
          supabase.from('leads').select('id', { count: 'exact' }).eq('dealership_id', dealershipId).eq('status', 'lost').is('deleted_at', null),
          supabase.from('customers').select('id', { count: 'exact' }).eq('dealership_id', dealershipId).is('deleted_at', null),
          supabase.from('appointments').select('id', { count: 'exact' }).eq('dealership_id', dealershipId),
          supabase.from('tasks').select('id', { count: 'exact' }).eq('dealership_id', dealershipId).eq('status', 'pending').lt('due_at', new Date().toISOString()),
          supabase.from('messages').select('id', { count: 'exact' }).eq('dealership_id', dealershipId).eq('direction', 'inbound').is('read_at', null),
        ]);

      const total = totalLeads.count || 0;
      const won = wonLeads.count || 0;
      const conversionRate = total > 0 ? ((won / total) * 100).toFixed(1) : '0.0';

      sendSuccess(res, {
        data: {
          totalLeads: total,
          wonLeads: won,
          lostLeads: lostLeads.count || 0,
          totalCustomers: totalCustomers.count || 0,
          totalAppointments: totalAppointments.count || 0,
          overdueTasks: overdueTasks.count || 0,
          unreadMessages: unreadMessages.count || 0,
          conversionRate: `${conversionRate}%`,
        },
      });
    } catch (err) {
      next(err);
    }
  }

  static async getSourcePerformance(req: Request, res: Response, next: NextFunction) {
    try {
      const dealershipId = req.tenant.dealershipId;
      const { data: stats } = await supabase.rpc('get_lead_source_performance', {
        target_dealership_id: dealershipId,
      });

      sendSuccess(res, { data: stats || [] });
    } catch (err) {
      next(err);
    }
  }
}
