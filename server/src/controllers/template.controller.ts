import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';

export async function getTemplates(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: templates } = await supabase
      .from('message_templates')
      .select('*')
      .eq('dealership_id', req.tenant.dealershipId)
      .order('created_at', { ascending: false });

    sendSuccess(res, { data: templates || [] });
  } catch (err) {
    next(err);
  }
}

export async function createTemplate(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, channel, subject, body, category } = req.body;
    const { data: template, error } = await supabase
      .from('message_templates')
      .insert({
        dealership_id: req.tenant.dealershipId,
        name,
        channel: channel || 'sms',
        subject,
        body,
        category: category || 'general',
        created_by: req.user.id,
      })
      .select()
      .single();

    if (error || !template) throw new Error(error?.message);
    sendSuccess(res, { statusCode: 201, message: 'Template created', data: { template } });
  } catch (err) {
    next(err);
  }
}
