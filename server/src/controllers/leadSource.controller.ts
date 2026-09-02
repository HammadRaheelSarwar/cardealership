import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';

export async function getLeadSources(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: sources } = await supabase
      .from('lead_sources')
      .select('*')
      .eq('dealership_id', req.tenant.dealershipId)
      .eq('is_active', true);

    sendSuccess(res, { data: sources || [] });
  } catch (err) {
    next(err);
  }
}

export async function createLeadSource(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, channel } = req.body;
    const { data: source, error } = await supabase
      .from('lead_sources')
      .insert({
        dealership_id: req.tenant.dealershipId,
        name,
        channel: channel || 'web',
        is_active: true,
      })
      .select()
      .single();

    if (error || !source) throw new Error(error?.message);
    sendSuccess(res, { statusCode: 201, message: 'Lead source created', data: { source } });
  } catch (err) {
    next(err);
  }
}
