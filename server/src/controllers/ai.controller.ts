import { AppError } from '../utils/AppError';
import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { supabase } from '../config/supabase';

export class AIController {
  static async suggestReply(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerName, vehicleName, lastCustomerMessage, channel, tone } =
        req.body;

      const suggestion = await aiService.generateReply({
        customerName: customerName || 'Customer',
        vehicleName,
        lastCustomerMessage: lastCustomerMessage || 'Hello',
        channel: channel || 'sms',
        tone,
      });

      res.json({ success: true, data: suggestion });
    } catch (err) {
      next(err);
    }
  }

  static async summarizeLead(req: Request, res: Response, next: NextFunction) {
    try {
      const { leadId } = req.body;
      const dealershipId = req.tenant!.dealershipId;

      let leadData = {
        customerName: 'Customer',
        vehicleName: 'Inventory Vehicle',
        currentStage: 'New Lead',
        recentMessages: [] as string[],
      };

      if (leadId) {
        const { data: lead } = await supabase
          .from('leads')
          .select(
            '*, customer:customers(*), vehicle:vehicles(*), stage:pipeline_stages(*)'
          )
          .eq('id', leadId)
          .eq('dealership_id', dealershipId)
          .single();

        if (!lead) throw new AppError('Lead not found', 404);
        if (
          req.tenant.role === 'salesperson' &&
          lead.assigned_user_id !== req.user.id
        )
          throw new AppError('Lead access denied', 403);
        if (lead) {
          const cust = lead.customer as any;
          const veh = lead.vehicle as any;
          leadData = {
            customerName: cust
              ? `${cust.first_name} ${cust.last_name}`
              : 'Customer',
            vehicleName: veh
              ? `${veh.year} ${veh.make} ${veh.model}`
              : 'Inventory Vehicle',
            currentStage: lead.stage?.name || 'No stage recorded',
            recentMessages: lead.notes ? [lead.notes] : [],
          };
        }
      }

      if (!leadId) throw new AppError('Select a lead to summarize', 400);
      const summary = await aiService.summarizeLead(leadData);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async processCommand(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      const dealershipName = req.dealership.name;
      let leadsQuery = supabase
        .from('leads')
        .select('id,status,temperature,notes,created_at,assigned_user_id')
        .eq('dealership_id', req.tenant.dealershipId)
        .is('deleted_at', null)
        .order('updated_at', { ascending: false })
        .limit(100);
      let tasksQuery = supabase
        .from('tasks')
        .select('title,status,due_at,assigned_user_id')
        .eq('dealership_id', req.tenant.dealershipId)
        .is('deleted_at', null)
        .order('due_at')
        .limit(100);
      if (req.tenant.role === 'salesperson') {
        leadsQuery = leadsQuery.eq('assigned_user_id', req.user.id);
        tasksQuery = tasksQuery.eq('assigned_user_id', req.user.id);
      }
      if (req.tenant.role === 'manager') {
        const team = await supabase
          .from('manager_team_members')
          .select('salesperson_user_id')
          .eq('dealership_id', req.tenant.dealershipId)
          .eq('manager_user_id', req.user.id);
        if (team.error) throw new AppError('Unable to load team', 503);
        const ids = [
          req.user.id,
          ...(team.data || []).map((t) => t.salesperson_user_id),
        ];
        leadsQuery = leadsQuery.in('assigned_user_id', ids);
        tasksQuery = tasksQuery.in('assigned_user_id', ids);
      }
      const [leads, tasks] = await Promise.all([leadsQuery, tasksQuery]);
      if (leads.error || tasks.error)
        throw new AppError('Unable to load records for AI analysis', 503);

      const result = await aiService.processCommand(
        query || '',
        dealershipName,
        { leads: leads.data, tasks: tasks.data, asOf: new Date().toISOString() }
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
