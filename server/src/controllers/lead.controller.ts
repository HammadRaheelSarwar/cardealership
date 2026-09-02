import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { eventBus } from '../events/bus';
import { AppError } from '../utils/AppError';
import { sendSuccess, sendPaginated } from '../utils/response';
import type { CreateLeadInput, LeadQueryInput } from '../validators/lead.validator';

// ─── GET /api/v1/leads ───────────────────────────────────────────────────────

export async function getLeads(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const query = req.query as unknown as LeadQueryInput;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    let dbQuery = supabase
      .from('leads')
      .select(
        '*, customer:customers(*), vehicle:vehicles(*), assigned_user:profiles!leads_assigned_user_id_fkey(*), stage:pipeline_stages(*), source:lead_sources(*)',
        { count: 'exact' }
      )
      .eq('dealership_id', req.tenant.dealershipId)
      .is('deleted_at', null);

    if (req.tenant.role === 'salesperson') {
      dbQuery = dbQuery.eq('assigned_user_id', req.user.id);
    } else if (query.assignedUserId) {
      dbQuery = dbQuery.eq('assigned_user_id', query.assignedUserId);
    }

    if (query.stageId) dbQuery = dbQuery.eq('pipeline_stage_id', query.stageId);
    if (query.temperature) dbQuery = dbQuery.eq('temperature', query.temperature);
    if (query.priority) dbQuery = dbQuery.eq('priority', query.priority);
    if (query.status) dbQuery = dbQuery.eq('status', query.status);
    else dbQuery = dbQuery.eq('status', 'open');

    if (query.sourceId) dbQuery = dbQuery.eq('source_id', query.sourceId);

    const { data: leads, count, error } = await dbQuery
      .order('updated_at', { ascending: false })
      .range(skip, skip + limit - 1);

    if (error) throw new AppError(error.message, 500);

    sendPaginated(res, leads || [], { page, limit, total: count || 0 });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/leads ──────────────────────────────────────────────────────

export async function createLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const body = req.body as CreateLeadInput;
    let customerId = body.customerId;

    if (!customerId && body.newCustomer) {
      const { data: customer, error: custErr } = await supabase
        .from('customers')
        .insert({
          dealership_id: req.tenant.dealershipId,
          first_name: body.newCustomer.firstName,
          last_name: body.newCustomer.lastName,
          email: body.newCustomer.email,
          phone: body.newCustomer.phone,
          location: body.newCustomer.location,
          assigned_user_id: body.assignedUserId || req.user.id,
        })
        .select()
        .single();

      if (custErr || !customer) throw new AppError(`Failed to create customer: ${custErr?.message}`, 400);
      customerId = customer.id;
    }

    if (!customerId) {
      throw new AppError('Customer is required to create a lead', 400);
    }

    let pipelineStageId = body.pipelineStageId;
    if (!pipelineStageId) {
      const { data: defaultStage } = await supabase
        .from('pipeline_stages')
        .select('id')
        .eq('dealership_id', req.tenant.dealershipId)
        .eq('type', 'standard')
        .order('sort_order', { ascending: true })
        .limit(1)
        .single();

      if (defaultStage) pipelineStageId = defaultStage.id;
    }

    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .insert({
        dealership_id: req.tenant.dealershipId,
        customer_id: customerId,
        vehicle_id: body.vehicleId || null,
        assigned_user_id: body.assignedUserId || req.user.id,
        source_id: body.sourceId || null,
        pipeline_stage_id: pipelineStageId,
        priority: body.priority || 'medium',
        temperature: body.temperature || 'warm',
        estimated_value: body.estimatedValue || 0,
        notes: body.notes,
        next_follow_up_at: body.nextFollowUpAt ? new Date(body.nextFollowUpAt).toISOString() : null,
        last_contact_at: new Date().toISOString(),
        status: 'open',
      })
      .select('*, customer:customers(*), vehicle:vehicles(*), assigned_user:profiles!leads_assigned_user_id_fkey(*), stage:pipeline_stages(*)')
      .single();

    if (leadErr || !lead) throw new AppError(`Failed to create lead: ${leadErr?.message}`, 500);

    // Log Activity
    await supabase.from('activities').insert({
      dealership_id: req.tenant.dealershipId,
      lead_id: lead.id,
      customer_id: customerId,
      user_id: req.user.id,
      type: 'lead_created',
      title: 'New Lead Created',
      description: body.notes || 'Lead added to pipeline',
    });

    eventBus.emit('lead.created', {
      lead: lead as any,
      tenant: req.tenant as any,
      actor: req.user as any,
    });

    sendSuccess(res, {
      statusCode: 201,
      message: 'Lead created successfully',
      data: { lead },
    });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/leads/:id ───────────────────────────────────────────────────

export async function getLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data: lead, error } = await supabase
      .from('leads')
      .select('*, customer:customers(*), vehicle:vehicles(*), assigned_user:profiles!leads_assigned_user_id_fkey(*), stage:pipeline_stages(*), source:lead_sources(*)')
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .is('deleted_at', null)
      .single();

    if (error || !lead) throw new AppError('Lead not found', 404);

    sendSuccess(res, { data: { lead } });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/v1/leads/:id/stage ───────────────────────────────────────────

export async function updateLeadStage(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { pipelineStageId } = req.body as { pipelineStageId: string };

    const { data: targetStage } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('id', pipelineStageId)
      .eq('dealership_id', req.tenant.dealershipId)
      .single();

    if (!targetStage) throw new AppError('Pipeline stage not found', 404);

    let status = 'open';
    let soldAt = null;

    if (targetStage.type === 'won') {
      status = 'won';
      soldAt = new Date().toISOString();
    } else if (targetStage.type === 'lost') {
      status = 'lost';
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .update({
        pipeline_stage_id: targetStage.id,
        status,
        ...(soldAt ? { sold_at: soldAt } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select('*, customer:customers(*), stage:pipeline_stages(*)')
      .single();

    if (error || !lead) throw new AppError('Lead not found', 404);

    await supabase.from('activities').insert({
      dealership_id: req.tenant.dealershipId,
      lead_id: lead.id,
      customer_id: lead.customer_id,
      user_id: req.user.id,
      type: 'stage_changed',
      title: `Moved to ${targetStage.name}`,
    });

    eventBus.emit('lead.stage.changed', {
      lead: lead as any,
      fromStageId: lead.pipeline_stage_id as any,
      toStageId: targetStage.id as any,
      tenant: req.tenant as any,
      actor: req.user as any,
    });

    sendSuccess(res, { message: `Lead moved to ${targetStage.name}`, data: { lead } });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/v1/leads/:id/assign ──────────────────────────────────────────

export async function assignLead(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { assignedUserId } = req.body as { assignedUserId: string };

    const { data: lead, error } = await supabase
      .from('leads')
      .update({ assigned_user_id: assignedUserId, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select('*, assigned_user:profiles!leads_assigned_user_id_fkey(*)')
      .single();

    if (error || !lead) throw new AppError('Lead not found', 404);

    await supabase.from('activities').insert({
      dealership_id: req.tenant.dealershipId,
      lead_id: lead.id,
      customer_id: lead.customer_id,
      user_id: req.user.id,
      type: 'lead_assigned',
      title: 'Salesperson Assigned',
    });

    sendSuccess(res, { message: 'Lead assigned', data: { lead } });
  } catch (err) {
    next(err);
  }
}

// ─── PATCH /api/v1/leads/:id/temperature ─────────────────────────────────────

export async function updateLeadTemperature(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { temperature } = req.body as { temperature: 'cold' | 'warm' | 'hot' };

    const { data: lead, error } = await supabase
      .from('leads')
      .update({ temperature, updated_at: new Date().toISOString() })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();

    if (error || !lead) throw new AppError('Lead not found', 404);

    sendSuccess(res, { message: `Temperature updated to ${temperature}`, data: { lead } });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/leads/:id/lost ─────────────────────────────────────────────

export async function markLeadLost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { lostReason } = req.body as { lostReason: string };

    const { data: lostStage } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('dealership_id', req.tenant.dealershipId)
      .eq('type', 'lost')
      .single();

    const { data: lead, error } = await supabase
      .from('leads')
      .update({
        status: 'lost',
        lost_reason: lostReason,
        ...(lostStage ? { pipeline_stage_id: lostStage.id } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();

    if (error || !lead) throw new AppError('Lead not found', 404);

    sendSuccess(res, { message: 'Lead marked as lost', data: { lead } });
  } catch (err) {
    next(err);
  }
}

// ─── POST /api/v1/leads/:id/sold ─────────────────────────────────────────────

export async function markLeadSold(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { soldValue, vehicleId } = req.body as { soldValue: number; vehicleId?: string };

    const { data: soldStage } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('dealership_id', req.tenant.dealershipId)
      .eq('type', 'won')
      .single();

    const { data: lead, error } = await supabase
      .from('leads')
      .update({
        status: 'won',
        sold_at: new Date().toISOString(),
        sold_value: soldValue,
        ...(vehicleId ? { vehicle_id: vehicleId } : {}),
        ...(soldStage ? { pipeline_stage_id: soldStage.id } : {}),
        updated_at: new Date().toISOString(),
      })
      .eq('id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();

    if (error || !lead) throw new AppError('Lead not found', 404);

    sendSuccess(res, { message: 'Lead marked as Sold', data: { lead } });
  } catch (err) {
    next(err);
  }
}

// ─── GET /api/v1/leads/:id/activity ─────────────────────────────────────────

export async function getLeadActivity(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { data: activities } = await supabase
      .from('activities')
      .select('*, user:profiles(*)')
      .eq('lead_id', req.params.id)
      .eq('dealership_id', req.tenant.dealershipId)
      .order('created_at', { ascending: false })
      .limit(100);

    sendSuccess(res, { data: { activities: activities || [] } });
  } catch (err) {
    next(err);
  }
}
