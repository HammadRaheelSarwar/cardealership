import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { AppError } from '../utils/AppError';
import { sendSuccess } from '../utils/response';
import {
  dateWindow,
  inWindow,
  percent,
  sum,
  personName,
  ownerMetrics,
} from '../services/workspaceMetrics';
import type {
  DateRangePreset,
  LostReason,
  SalespersonWorkspaceData,
  ManagerWorkspaceData,
} from '@crm/shared';

async function rows(
  table: string,
  tenant: string,
  select = '*',
  softDelete = false
): Promise<any[]> {
  const result: any[] = [];
  for (let offset = 0; ; offset += 1000) {
    let query = supabase
      .from(table)
      .select(select)
      .eq('dealership_id', tenant)
      .order('id')
      .range(offset, offset + 999);
    if (softDelete) query = query.is('deleted_at', null);
    const { data, error } = await query;
    if (error)
      throw new AppError(`Unable to load ${table}: ${error.message}`, 503);
    result.push(...(data || []));
    if (!data || data.length < 1000) return result;
  }
}
async function load(req: Request) {
  const id = req.tenant.dealershipId;
  const [
    stages,
    leads,
    tasks,
    appointments,
    sales,
    members,
    teams,
    history,
    activities,
    messages,
  ] = await Promise.all([
    rows('pipeline_stages', id),
    rows(
      'leads',
      id,
      '*, customer:customers(*), vehicle:vehicles(*), stage:pipeline_stages(*)',
      true
    ),
    rows('tasks', id, '*, customer:customers(*)', true),
    rows('appointments', id),
    rows('sales_records', id),
    rows('dealership_memberships', id, '*, profile:profiles(*)'),
    rows('manager_team_members', id),
    rows('lead_stage_history', id),
    rows('activities', id),
    rows('messages', id),
  ]);
  stages.sort((a, b) => a.sort_order - b.sort_order);
  return {
    stages,
    leads,
    tasks,
    appointments,
    sales,
    members,
    teams,
    history,
    activities,
    messages,
  };
}
function preset(req: Request): DateRangePreset {
  const value = req.query.range || 'mtd';
  if (!['today', '7d', '30d', 'mtd'].includes(String(value)))
    throw new AppError('Invalid date range', 400);
  return value as DateRangePreset;
}
function pipeline(
  stages: any[],
  leads: any[],
  tasks: any[],
  today: Date,
  end: Date
) {
  return stages
    .filter((s) => s.type === 'standard')
    .map((s) => {
      const ids = new Set(
        leads
          .filter((l) => l.pipeline_stage_id === s.id && l.status === 'open')
          .map((l) => l.id)
      );
      const pending = tasks.filter(
        (t) => t.status === 'pending' && ids.has(t.lead_id)
      );
      return {
        stageId: s.id,
        name: s.name,
        slug: s.slug,
        color: s.color,
        customerCount: ids.size,
        tasksDueCount: pending.filter((t) => new Date(t.due_at) < end).length,
        tasksOverdueCount: pending.filter((t) => new Date(t.due_at) < today)
          .length,
      };
    });
}
export async function getOwnerWorkspace(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const d = await load(req);
    const range = preset(req);
    sendSuccess(res, {
      data: ownerMetrics(
        d,
        range,
        req.dealership.name,
        req.dealership.financial_tracking_enabled !== false,
        req.dealership.timezone
      ),
    });
  } catch (e) {
    next(e);
  }
}
export async function getSalespersonWorkspace(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const d = await load(req);
    const { start, today, end } = dateWindow('mtd', req.dealership.timezone);
    const leads = d.leads.filter((l) => l.assigned_user_id === req.user.id);
    const tasks = d.tasks.filter((t) => t.assigned_user_id === req.user.id);
    const pending = tasks.filter((t) => t.status === 'pending');
    const doNextTasks = pending
      .map((t) => {
        const lead = leads.find((l) => l.id === t.lead_id);
        const customer = lead?.customer || t.customer;
        return {
          id: t.id,
          leadId: t.lead_id || '',
          customerId: customer?.id || '',
          customerName: personName(customer),
          vehicle: lead?.vehicle
            ? `${lead.vehicle.year} ${lead.vehicle.make} ${lead.vehicle.model}`
            : 'No vehicle selected',
          stageName: lead?.stage?.name || 'No stage',
          stageSlug: lead?.stage?.slug || '',
          actionType: t.type,
          title: t.title,
          dueTime: new Date(t.due_at).toLocaleTimeString('en-US', {
            timeZone: req.dealership.timezone,
            hour: 'numeric',
            minute: '2-digit',
          }),
          dueAt: t.due_at,
          priority: t.priority,
          isOverdue: new Date(t.due_at) < today,
          isDueToday: inWindow(t.due_at, today, end),
          lastContactText: lead?.last_contact_at
            ? new Date(lead.last_contact_at).toLocaleString('en-US', {
                timeZone: req.dealership.timezone,
              })
            : 'No contact recorded',
          lastMessageText: lead?.notes || undefined,
        };
      })
      .sort(
        (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      );
    const sales = d.sales.filter(
      (s) =>
        s.salesperson_id === req.user.id && inWindow(s.sale_date, start, end)
    );
    const data: SalespersonWorkspaceData = {
      salespersonName: personName(req.user),
      tasksRemainingToday: pending.filter((t) => new Date(t.due_at) < end)
        .length,
      initialTasksTodayCount: tasks.filter(
        (t) =>
          t.status !== 'cancelled' &&
          (inWindow(t.due_at, today, end) ||
            (new Date(t.due_at) < today &&
              (t.status === 'pending' || inWindow(t.completed_at, today, end))))
      ).length,
      activePipeline: pipeline(d.stages, leads, tasks, today, end),
      results: {
        soldThisMonth: sales.length,
        soldRevenueThisMonth: sum(sales, 'sale_value'),
        lostThisMonth: leads.filter(
          (l) => l.status === 'lost' && inWindow(l.updated_at, start, end)
        ).length,
      },
      nextBestTask: doNextTasks.length
        ? { ...doNextTasks[0], reason: 'Earliest pending follow-up.' }
        : null,
      doNextTasks,
    };
    sendSuccess(res, { data });
  } catch (e) {
    next(e);
  }
}
export async function getManagerWorkspace(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const d = await load(req);
    const range = preset(req);
    const { start, today, end } = dateWindow(range, req.dealership.timezone);
    const teamIds = new Set(
      d.teams
        .filter((t) => t.manager_user_id === req.user.id)
        .map((t) => t.salesperson_user_id)
    );
    const members = d.members.filter(
      (m) =>
        m.role === 'salesperson' &&
        m.status === 'active' &&
        (req.tenant.role === 'owner' || teamIds.has(m.user_id))
    );
    const ids = new Set(members.map((m) => m.user_id));
    const leads = d.leads.filter((l) => ids.has(l.assigned_user_id));
    const tasks = d.tasks.filter((t) => ids.has(t.assigned_user_id));
    const overdue = tasks.filter(
      (t) => t.status === 'pending' && new Date(t.due_at) < today
    );
    const salespeople = members.map((m) => {
      const uid = m.user_id;
      const own = leads.filter((l) => l.assigned_user_id === uid);
      const cohort = own.filter((l) => inWindow(l.created_at, start, end));
      const ownTasks = tasks.filter((t) => t.assigned_user_id === uid);
      const periodTasks = ownTasks.filter(
        (t) => inWindow(t.due_at, start, end) && t.status !== 'cancelled'
      );
      const appts = d.appointments.filter(
        (a) =>
          a.assigned_user_id === uid &&
          inWindow(a.starts_at, start, end) &&
          a.status !== 'cancelled'
      );
      const activities = d.activities.filter(
        (a) => a.user_id === uid && inWindow(a.created_at, start, end)
      );
      const messages = d.messages.filter(
        (a) =>
          a.sender_user_id === uid &&
          a.direction === 'outbound' &&
          ['sent', 'delivered'].includes(a.status) &&
          inWindow(a.created_at, start, end)
      );
      return {
        id: uid,
        name: personName(m.profile),
        avatarUrl: m.profile?.avatar_url,
        activeLeads: own.filter((l) => l.status === 'open').length,
        tasksDue: ownTasks.filter(
          (t) => t.status === 'pending' && new Date(t.due_at) < end
        ).length,
        overdueTasks: overdue.filter((t) => t.assigned_user_id === uid).length,
        appointmentsToday: appts.filter((a) =>
          inWindow(a.starts_at, today, end)
        ).length,
        callsMade: activities.filter((a) =>
          ['call', 'call_completed'].includes(a.type)
        ).length,
        textsSent: messages.filter((a) => a.channel === 'sms').length,
        emailsSent: messages.filter((a) => a.channel === 'email').length,
        showRate: percent(
          appts.filter((a) => a.status === 'completed').length,
          appts.length
        ),
        soldUnits: d.sales.filter(
          (s) => s.salesperson_id === uid && inWindow(s.sale_date, start, end)
        ).length,
        conversionRate: percent(
          cohort.filter((l) => l.status === 'won').length,
          cohort.length
        ),
        taskCompletionRate: percent(
          periodTasks.filter((t) => t.status === 'completed').length,
          periodTasks.length
        ),
      };
    });
    const data: ManagerWorkspaceData = {
      managerName: personName(req.user),
      teamPipeline: pipeline(d.stages, leads, tasks, today, end),
      totalOverdueTasks: overdue.length,
      overdueBySalesperson: members.map((m) => ({
        salespersonId: m.user_id,
        salespersonName: personName(m.profile),
        overdueCount: overdue.filter((t) => t.assigned_user_id === m.user_id)
          .length,
        tasks: overdue
          .filter((t) => t.assigned_user_id === m.user_id)
          .map((t) => {
            const l = leads.find((l) => l.id === t.lead_id);
            return {
              id: t.id,
              leadId: t.lead_id,
              customerName: personName(l?.customer || t.customer),
              vehicle: l?.vehicle
                ? `${l.vehicle.year} ${l.vehicle.make} ${l.vehicle.model}`
                : 'No vehicle selected',
              title: t.title,
              dueAt: t.due_at,
              daysOverdue: Math.max(
                1,
                Math.floor(
                  (today.getTime() - new Date(t.due_at).getTime()) / 86400000
                )
              ),
            };
          }),
      })),
      salespeople,
      coachingInsights: salespeople
        .filter((s) => s.overdueTasks > 0)
        .map((s) => ({
          id: `overdue-${s.id}`,
          salespersonId: s.id,
          salespersonName: s.name,
          type: 'warning',
          metricHighlight: `${s.overdueTasks} overdue tasks`,
          insight: 'Pending follow-ups are past their due date.',
          actionRecommendation:
            'Review and complete overdue customer follow-ups.',
        })),
      dateRange: range,
    };
    sendSuccess(res, { data });
  } catch (e) {
    next(e);
  }
}

// ─── 4. Complete Task With Outcome ─────────────────────────────────────────────
// POST /api/v1/workspace/tasks/:id/complete
export async function completeTaskWithOutcome(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { outcome, note, nextTask, lostReason } = req.body;
    if (!outcome) throw new AppError('A task outcome is required', 400);
    const { data, error } = await supabase.rpc('complete_crm_task', {
      p_dealership_id: req.tenant.dealershipId,
      p_task_id: req.params.id,
      p_actor_id: req.user.id,
      p_outcome: outcome,
      p_note: note ?? null,
      p_next_task: nextTask ?? null,
      p_lost_reason: lostReason ?? null,
    });
    if (error)
      throw new AppError(`Unable to complete task: ${error.message}`, 400);
    sendSuccess(res, { data, message: 'Task completed' });
  } catch (e) {
    next(e);
  }
}

// ─── 5. Mark Lead Sold ────────────────────────────────────────────────────────
// POST /api/v1/workspace/leads/:id/sold
export async function markLeadSold(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { saleValue, grossProfit, netProfit, vehicleId } = req.body;
    if (
      typeof saleValue !== 'number' ||
      !Number.isFinite(saleValue) ||
      saleValue < 0
    )
      throw new AppError('Enter a valid sale value', 400);
    for (const value of [grossProfit, netProfit])
      if (
        value !== undefined &&
        (typeof value !== 'number' || !Number.isFinite(value))
      )
        throw new AppError('Enter valid profit figures', 400);
    const { data, error } = await supabase.rpc('close_crm_deal', {
      p_dealership_id: req.tenant.dealershipId,
      p_lead_id: req.params.id,
      p_actor_id: req.user.id,
      p_sale_value: saleValue,
      p_gross_profit: grossProfit ?? null,
      p_net_profit: netProfit ?? null,
      p_vehicle_id: vehicleId ?? null,
    });
    if (error)
      throw new AppError(`Unable to record sale: ${error.message}`, 400);
    sendSuccess(res, { data: { lead: data }, message: 'Sale recorded' });
  } catch (e) {
    next(e);
  }
}

// ─── 6. Mark Lead Lost ────────────────────────────────────────────────────────
// POST /api/v1/workspace/leads/:id/lost
export async function markLeadLost(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const leadId = req.params.id;
    const { lostReason } = req.body as { lostReason: LostReason };
    const nowIso = new Date().toISOString();

    const { data: lostStage } = await supabase
      .from('pipeline_stages')
      .select('id')
      .eq('dealership_id', req.tenant.dealershipId)
      .eq('type', 'lost')
      .single();

    const { data: lead, error: leadErr } = await supabase
      .from('leads')
      .update({
        status: 'lost',
        lost_reason: lostReason,
        ...(lostStage ? { pipeline_stage_id: lostStage.id } : {}),
        updated_at: nowIso,
      })
      .eq('id', leadId)
      .eq('dealership_id', req.tenant.dealershipId)
      .select()
      .single();

    if (leadErr || !lead) throw new AppError('Lead not found', 404);

    // Cancel pending tasks
    await supabase
      .from('tasks')
      .update({ status: 'cancelled', updated_at: nowIso })
      .eq('lead_id', lead.id)
      .eq('status', 'pending');

    // Track stage history
    if (lostStage) {
    }

    sendSuccess(res, { message: 'Lead marked as Lost', data: { lead } });
  } catch (err) {
    next(err);
  }
}
export async function getSalesLedger(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { start, end } = dateWindow(preset(req), req.dealership.timezone);
    const records = await rows(
      'sales_records',
      req.tenant.dealershipId,
      '*, vehicle:vehicles(*), salesperson:profiles!sales_records_salesperson_id_fkey(*), lead:leads(customer:customers(*))'
    );
    const visible = req.dealership.financial_tracking_enabled !== false;
    sendSuccess(res, {
      data: records
        .filter((r) => inWindow(r.sale_date, start, end))
        .map((r) => {
          if (visible) return r;
          const { gross_profit, net_profit, ...rest } = r;
          return rest;
        }),
    });
  } catch (e) {
    next(e);
  }
}
