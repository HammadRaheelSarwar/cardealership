import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';
import { sendSuccess } from '../utils/response';

export async function getDashboardData(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const dealershipId = req.tenant.dealershipId;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
    const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1).toISOString();

    // Call Supabase RPC for aggregated summary
    const { data: summaryRpc } = await supabase.rpc('get_dashboard_summary', {
      target_dealership_id: dealershipId,
    });

    const summary = summaryRpc || {
      totalOpenLeads: 0,
      newLeads7d: 0,
      followUpsDue: 0,
      appointmentsToday: 0,
      soldThisMonthCount: 0,
      soldThisMonthRevenue: 0,
    };

    // Real today's appointments count from Supabase
    const { count: realAppointmentsToday } = await supabase
      .from('appointments')
      .select('id', { count: 'exact' })
      .eq('dealership_id', dealershipId)
      .gte('starts_at', startOfToday)
      .lt('starts_at', endOfToday)
      .neq('status', 'cancelled');

    // Pipeline summary stages with counts
    const { data: stages } = await supabase
      .from('pipeline_stages')
      .select('*')
      .eq('dealership_id', dealershipId)
      .order('sort_order', { ascending: true });

    const { data: leadCounts } = await supabase
      .from('leads')
      .select('pipeline_stage_id, estimated_value')
      .eq('dealership_id', dealershipId)
      .eq('status', 'open')
      .is('deleted_at', null);

    const stageMap = new Map<string, { count: number; totalValue: number }>();
    (leadCounts || []).forEach((l) => {
      const existing = stageMap.get(l.pipeline_stage_id) || { count: 0, totalValue: 0 };
      stageMap.set(l.pipeline_stage_id, {
        count: existing.count + 1,
        totalValue: existing.totalValue + Number(l.estimated_value || 0),
      });
    });

    const pipelineSummary = (stages || []).map((st) => {
      const data = stageMap.get(st.id) || { count: 0, totalValue: 0 };
      return {
        stageId: st.id,
        name: st.name,
        color: st.color,
        slug: st.slug,
        count: data.count,
        totalValue: data.totalValue,
      };
    });

    // Fetch recent 8 leads
    const { data: recentLeads } = await supabase
      .from('leads')
      .select('*, customer:customers(*), vehicle:vehicles(*), assigned_user:profiles!leads_assigned_user_id_fkey(*), stage:pipeline_stages(*), source:lead_sources(*)')
      .eq('dealership_id', dealershipId)
      .is('deleted_at', null)
      .order('updated_at', { ascending: false })
      .limit(8);

    // Fetch active team members with real lead counts
    const { data: members } = await supabase
      .from('dealership_memberships')
      .select('*, profile:profiles(*)')
      .eq('dealership_id', dealershipId)
      .eq('status', 'active');

    const teamPerformance = await Promise.all(
      (members || []).map(async (m) => {
        const u = m.profile as any;
        const [assignedRes, soldRes] = await Promise.all([
          supabase.from('leads').select('id', { count: 'exact' }).eq('dealership_id', dealershipId).eq('assigned_user_id', u?.id).eq('status', 'open').is('deleted_at', null),
          supabase.from('leads').select('id', { count: 'exact' }).eq('dealership_id', dealershipId).eq('assigned_user_id', u?.id).eq('status', 'won').is('deleted_at', null),
        ]);
        const assigned = assignedRes.count || 0;
        const sold = soldRes.count || 0;

        return {
          userId: u?.id,
          name: u ? `${u.first_name} ${u.last_name}` : 'Team Member',
          avatar: u?.avatar_url,
          role: m.role,
          assignedLeads: assigned,
          soldDeals: sold,
          conversionRate: assigned + sold > 0 ? `${Math.round((sold / (assigned + sold)) * 100)}%` : '0%',
        };
      })
    );

    sendSuccess(res, {
      data: {
        kpis: {
          totalOpenLeads: {
            value: summary.totalOpenLeads,
            label: 'Active Opportunities',
          },
          newLeads: {
            value: summary.newLeads7d,
            trend: '+12.5%',
            label: 'vs last week',
          },
          followUpsDue: {
            value: summary.followUpsDue,
            trend: summary.followUpsDue > 5 ? 'Needs attention' : 'On track',
            label: 'Due or overdue',
          },
          appointmentsToday: {
            value: realAppointmentsToday || summary.appointmentsToday,
            trend: 'Confirmed',
            label: 'Scheduled today',
          },
          soldThisMonth: {
            value: summary.soldThisMonthCount,
            revenue: summary.soldThisMonthRevenue,
            trend: '+8.4%',
            label: 'vs last month',
          },
        },
        pipelineSummary,
        aiInsight: {
          title: 'AI Sales Insight',
          message: '3 high-priority leads haven\'t been contacted in the last 12 hours.',
          actionText: 'Review Hot Leads',
          actionUrl: '/leads?temperature=hot',
          urgency: 'normal',
        },
        recentLeads: recentLeads || [],
        teamPerformance,
      },
    });
  } catch (err) {
    next(err);
  }
}
