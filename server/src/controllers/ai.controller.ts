import { Request, Response, NextFunction } from 'express';
import { aiService } from '../services/ai.service';
import { supabase } from '../config/supabase';

export class AIController {
  static async suggestReply(req: Request, res: Response, next: NextFunction) {
    try {
      const { customerName, vehicleName, lastCustomerMessage, channel, tone } = req.body;

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
          .select('*, customer:customers(*), vehicle:vehicles(*)')
          .eq('id', leadId)
          .eq('dealership_id', dealershipId)
          .single();

        if (lead) {
          const cust = lead.customer as any;
          const veh = lead.vehicle as any;
          leadData = {
            customerName: cust ? `${cust.first_name} ${cust.last_name}` : 'Customer',
            vehicleName: veh ? `${veh.year} ${veh.make} ${veh.model}` : 'Inventory Vehicle',
            currentStage: 'Follow-Up',
            recentMessages: lead.notes ? [lead.notes] : ['Interested in flexible financing'],
          };
        }
      }

      const summary = await aiService.summarizeLead(leadData);
      res.json({ success: true, data: summary });
    } catch (err) {
      next(err);
    }
  }

  static async processCommand(req: Request, res: Response, next: NextFunction) {
    try {
      const { query } = req.body;
      const dealershipName = 'Premier Auto Group';

      const result = await aiService.processCommand(query || '', dealershipName);
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
}
