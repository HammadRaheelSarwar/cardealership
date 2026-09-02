import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';

export class AutomationController {
  static async getAutomations(req: Request, res: Response, next: NextFunction) {
    try {
      const dealershipId = req.tenant.dealershipId;
      const { data: automations, error } = await supabase
        .from('automations')
        .select('*, steps:automation_steps(*)')
        .eq('dealership_id', dealershipId)
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      sendSuccess(res, { data: automations || [] });
    } catch (err) {
      next(err);
    }
  }

  static async createAutomation(req: Request, res: Response, next: NextFunction) {
    try {
      const dealershipId = req.tenant.dealershipId;
      const userId = req.user.id;
      const { name, description, triggerType, triggerConfig, steps } = req.body;

      const { data: automation, error } = await supabase
        .from('automations')
        .insert({
          dealership_id: dealershipId,
          name,
          description,
          trigger_type: triggerType || 'new_lead',
          trigger_config: triggerConfig || {},
          status: 'active',
          created_by: userId,
        })
        .select()
        .single();

      if (error || !automation) throw new Error(`Failed to create automation: ${error?.message}`);

      if (steps && steps.length > 0) {
        await supabase.from('automation_steps').insert(
          steps.map((st: any, i: number) => ({
            automation_id: automation.id,
            dealership_id: dealershipId,
            step_order: i,
            type: st.type,
            config: st.config || {},
          }))
        );
      }

      sendSuccess(res, { statusCode: 201, message: 'Automation created', data: { automation } });
    } catch (err) {
      next(err);
    }
  }

  static async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const dealershipId = req.tenant.dealershipId;
      const { id } = req.params;
      const { status } = req.body;

      const { data: automation, error } = await supabase
        .from('automations')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('dealership_id', dealershipId)
        .select()
        .single();

      if (error || !automation) {
        res.status(404).json({ success: false, message: 'Automation not found' });
        return;
      }

      sendSuccess(res, { message: `Automation updated to ${status}`, data: { automation } });
    } catch (err) {
      next(err);
    }
  }
}
