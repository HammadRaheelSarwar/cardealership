import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';

export async function getStages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: stages, error } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('dealership_id', req.tenant.dealershipId)
      .order('sort_order', { ascending: true });

    if (error) throw new AppError(error.message, 500);
    sendSuccess(res, { data: { stages: stages || [] } });
  } catch (err) {
    next(err);
  }
}

export async function createStage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, color } = req.body;
    const slug = name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-');

    const { data: maxStage } = await supabase
      .from('pipeline_stages')
      .select('sort_order')
      .eq('dealership_id', req.tenant.dealershipId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single();

    const sortOrder = maxStage ? maxStage.sort_order + 1 : 0;

    const { data: stage, error } = await supabase
      .from('pipeline_stages')
      .insert({
        dealership_id: req.tenant.dealershipId,
        name,
        slug,
        color: color || '#2563EB',
        sort_order: sortOrder,
        type: 'standard',
        is_system: false,
      })
      .select()
      .single();

    if (error || !stage) throw new AppError(`Failed to create stage: ${error?.message}`, 400);

    sendSuccess(res, { statusCode: 201, message: 'Stage created', data: { stage } });
  } catch (err) {
    next(err);
  }
}

export async function updateStage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { name, color } = req.body;
    const { data: stage, error } = await supabase
      .from('pipeline_stages')
      .update({
        ...(name ? { name } : {}),
        ...(color ? { color } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();

    if (error || !stage) throw new AppError('Pipeline stage not found', 404);

    sendSuccess(res, { message: 'Stage updated', data: { stage } });
  } catch (err) {
    next(err);
  }
}

export async function deleteStage(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { data: stage } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .single();

    if (!stage) throw new AppError('Pipeline stage not found', 404);
    if (stage.is_system) throw new AppError('System stages (Sold / Lost) cannot be deleted', 400);

    await supabase.from('pipeline_stages').delete().eq('id', stage.id);
    sendSuccess(res, { message: 'Stage deleted' });
  } catch (err) {
    next(err);
  }
}

export async function reorderStages(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { stageIds } = req.body as { stageIds: string[] };

    await Promise.all(
      stageIds.map((id, index) =>
        supabase
          .from('pipeline_stages')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('dealership_id', req.tenant.dealershipId)
      )
    );

    const { data: stages } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('dealership_id', req.tenant.dealershipId)
      .order('sort_order', { ascending: true });

    sendSuccess(res, { message: 'Stages reordered', data: { stages: stages || [] } });
  } catch (err) {
    next(err);
  }
}
