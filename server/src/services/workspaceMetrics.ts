import { formatInTimeZone, fromZonedTime } from 'date-fns-tz';
import { addDays, format, parseISO } from 'date-fns';
import type { DateRangePreset, OwnerWorkspaceData } from '@crm/shared';

export function dateWindow(
  range: DateRangePreset,
  timezone = 'UTC',
  now = new Date()
) {
  const localDay = formatInTimeZone(now, timezone, 'yyyy-MM-dd');
  const midnight = parseISO(localDay);
  const today = fromZonedTime(`${localDay}T00:00:00`, timezone);
  const end = fromZonedTime(
    `${format(addDays(midnight, 1), 'yyyy-MM-dd')}T00:00:00`,
    timezone
  );
  const first =
    range === 'mtd'
      ? `${localDay.slice(0, 7)}-01`
      : format(
          addDays(midnight, range === '7d' ? -6 : range === '30d' ? -29 : 0),
          'yyyy-MM-dd'
        );
  return {
    start: fromZonedTime(`${first}T00:00:00`, timezone),
    today,
    end,
    now,
  };
}
export const inWindow = (value: string | undefined, start: Date, end: Date) =>
  Boolean(value) &&
  new Date(value!).getTime() >= start.getTime() &&
  new Date(value!).getTime() < end.getTime();
export const percent = (n: number, d: number) =>
  d ? Math.round((n / d) * 1000) / 10 : 0;
export const sum = (rows: any[], field: string) =>
  rows.reduce((n, r) => n + Number(r[field] ?? 0), 0);
export const personName = (p: any) =>
  p ? `${p.first_name || ''} ${p.last_name || ''}`.trim() : 'Unassigned';

export function ownerMetrics(
  d: any,
  range: DateRangePreset,
  name: string,
  financialsVisible: boolean,
  timezone = 'UTC',
  now = new Date()
): OwnerWorkspaceData {
  const { start, end } = dateWindow(range, timezone, now);
  const sales = d.sales.filter((s: any) => inWindow(s.sale_date, start, end));
  const appointments = d.appointments.filter(
    (a: any) => inWindow(a.starts_at, start, end) && a.status !== 'cancelled'
  );
  const shows = appointments.filter((a: any) => a.status === 'completed');
  const cohort = d.leads.filter((l: any) => inWindow(l.created_at, start, end));
  const cohortIds = new Set(cohort.map((l: any) => l.id));
  const active = d.leads.filter((l: any) => l.status === 'open');
  const lost = d.leads.filter(
    (l: any) => l.status === 'lost' && inWindow(l.updated_at, start, end)
  );
  const reasons = new Map<string, number>();
  lost.forEach((l: any) => {
    const reason = l.lost_reason || 'Unspecified';
    reasons.set(reason, (reasons.get(reason) || 0) + 1);
  });
  const stages = d.stages.filter((s: any) => s.type !== 'lost');
  // Conversion is measured on leads created in the selected period, using recorded stage visits.
  const visits = stages.map(
    (s: any, index: number) =>
      new Set([
        ...cohort
          .filter((l: any) => index === 0 || l.pipeline_stage_id === s.id)
          .map((l: any) => l.id),
        ...d.history
          .filter(
            (h: any) =>
              cohortIds.has(h.lead_id) &&
              (h.to_stage_id === s.id || h.from_stage_id === s.id)
          )
          .map((h: any) => h.lead_id),
      ])
  );
  const pipelineFunnel = stages.slice(0, -1).map((s: any, i: number) => {
    const advanced = [...visits[i]].filter((id) =>
      visits[i + 1].has(id)
    ).length;
    const rate = percent(advanced, visits[i].size);
    return {
      fromStage: s.name,
      toStage: stages[i + 1].name,
      conversionRate: rate,
      dropOffRate: visits[i].size ? Math.round((100 - rate) * 10) / 10 : 0,
      isHighestDropOff: false,
    };
  });
  const maxDrop = Math.max(0, ...pipelineFunnel.map((s: any) => s.dropOffRate));
  pipelineFunnel.forEach((s: any) => {
    s.isHighestDropOff = maxDrop > 0 && s.dropOffRate === maxDrop;
  });
  const managerComparisons = d.members
    .filter((m: any) => m.role === 'manager' && m.status === 'active')
    .map((m: any) => {
      const ids = new Set(
        d.teams
          .filter((t: any) => t.manager_user_id === m.user_id)
          .map((t: any) => t.salesperson_user_id)
      );
      ids.add(m.user_id);
      const teamLeads = d.leads.filter((l: any) => ids.has(l.assigned_user_id));
      const teamSales = sales.filter(
        (s: any) =>
          s.manager_id === m.user_id ||
          (!s.manager_id && ids.has(s.salesperson_id))
      );
      const teamAppts = appointments.filter((a: any) =>
        ids.has(a.assigned_user_id)
      );
      const teamCohort = teamLeads.filter((l: any) =>
        inWindow(l.created_at, start, end)
      );
      return {
        managerId: m.user_id,
        managerName: personName(m.profile),
        teamName: `${personName(m.profile)}'s team`,
        pipelineCount: teamLeads.filter((l: any) => l.status === 'open').length,
        appointmentsCount: teamAppts.length,
        showsCount: teamAppts.filter((a: any) => a.status === 'completed')
          .length,
        soldUnits: teamSales.length,
        conversionRate: percent(
          teamCohort.filter((l: any) => l.status === 'won').length,
          teamCohort.length
        ),
        ...(financialsVisible
          ? {
              grossProfit: sum(teamSales, 'gross_profit'),
              netProfit: sum(teamSales, 'net_profit'),
            }
          : {}),
      };
    });
  return {
    dealershipName: name,
    totalActiveOpportunities: active.length,
    appointmentsCount: appointments.length,
    showsCount: shows.length,
    showRate: percent(shows.length, appointments.length),
    workingDealsCount: active.filter((l: any) =>
      ['working-deal', 'negotiation'].includes(l.stage?.slug)
    ).length,
    unitsSold: sales.length,
    overallConversionRate: percent(
      cohort.filter((l: any) => l.status === 'won').length,
      cohort.length
    ),
    salesVolume: sum(sales, 'sale_value'),
    financialsVisible,
    ...(financialsVisible
      ? {
          grossProfit: sum(sales, 'gross_profit'),
          netProfit: sum(sales, 'net_profit'),
        }
      : {}),
    managerComparisons,
    pipelineFunnel,
    lostReasons: [...reasons].map(([reason, count]) => ({
      reason,
      count,
      percentage: percent(count, lost.length),
    })),
    dateRange: range,
  };
}
