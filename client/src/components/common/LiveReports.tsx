import { useState } from 'react';
import {
  Page,
  QueryState,
  Table,
  money,
  name,
  date,
  vehicleName,
} from '@/components/common/LiveData';
import { useLiveQuery } from '@/hooks/useLiveQuery';
import {
  fetchOwnerWorkspace,
  fetchManagerWorkspace,
  fetchSalespersonWorkspace,
} from '@/services/workspaceService';
import { readList } from '@/services/liveData';
import { useActiveMembershipRole } from '@/store/authStore';
import type { DateRangePreset } from '@crm/shared';
function Range({
  value,
  set,
}: {
  value: DateRangePreset;
  set: (r: DateRangePreset) => void;
}) {
  return (
    <select
      aria-label="Report period"
      value={value}
      onChange={(e) => set(e.target.value as DateRangePreset)}
      className="p-2 rounded bg-black border border-white/20"
    >
      {[
        ['today', 'Today'],
        ['7d', 'Last 7 days'],
        ['30d', 'Last 30 days'],
        ['mtd', 'Month to date'],
      ].map(([v, label]) => (
        <option value={v} key={v}>
          {label}
        </option>
      ))}
    </select>
  );
}
function exportCsv(rows: any[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]).filter(
    (k) => typeof rows[0][k] !== 'object'
  );
  const cell = (v: unknown) =>
    '"' +
    String(v ?? '')
      .replace(/^[=+@-]/, "'$&")
      .replace(/"/g, '""') +
    '"';
  const csv = [
    headers.map(cell).join(','),
    ...rows.map((r) => headers.map((h) => cell(r[h])).join(',')),
  ].join('\r\n');
  const url = URL.createObjectURL(
    new Blob([csv], { type: 'text/csv;charset=utf-8' })
  );
  const a = document.createElement('a');
  a.href = url;
  a.download = 'dealership-report.csv';
  a.click();
  URL.revokeObjectURL(url);
}
export function OwnerReport({
  kind,
}: {
  kind: 'managers' | 'sales' | 'financial' | 'conversion';
}) {
  const [range, setRange] = useState<DateRangePreset>('mtd');
  const query = useLiveQuery(['workspace', 'owner', range], () =>
    fetchOwnerWorkspace(range)
  );
  const ledger = useLiveQuery(
    ['sales-ledger', range],
    () => readList(`/workspace/sales?range=${range}`),
    kind === 'sales' || kind === 'financial'
  );
  const d = query.data;
  const titles = {
    managers: 'Manager comparison',
    sales: 'Sales volume',
    financial: 'Financial reports',
    conversion: 'Conversion funnel',
  };
  return (
    <Page title={titles[kind]}>
      <Range value={range} set={setRange} />
      <QueryState query={query}>
        {d && (
          <>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                ['Active opportunities', d.totalActiveOpportunities],
                ['Units sold', d.unitsSold],
                ['Sales volume', money(d.salesVolume)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="p-5 border border-white/10 rounded-xl"
                >
                  <p className="text-gray-400 text-sm">{label}</p>
                  <p className="text-2xl text-white mt-2">{value}</p>
                </div>
              ))}
            </div>
            {kind === 'managers' && (
              <>
                <button
                  className="btn-secondary"
                  onClick={() => exportCsv(d.managerComparisons)}
                >
                  Export CSV
                </button>
                <Table
                  rows={d.managerComparisons}
                  columns={[
                    { label: 'Manager', value: (r) => r.managerName },
                    { label: 'Active pipeline', value: (r) => r.pipelineCount },
                    {
                      label: 'Appointments',
                      value: (r) => r.appointmentsCount,
                    },
                    { label: 'Shows', value: (r) => r.showsCount },
                    { label: 'Units sold', value: (r) => r.soldUnits },
                    {
                      label: 'Conversion',
                      value: (r) => `${r.conversionRate}%`,
                    },
                  ]}
                />
              </>
            )}
            {kind === 'conversion' && (
              <>
                <p className="text-sm text-gray-400">
                  Conversion follows leads created during the selected period,
                  using recorded stage visits. Earlier activity without recorded
                  history is not inferred.
                </p>
                <Table
                  rows={d.pipelineFunnel}
                  columns={[
                    { label: 'From', value: (r) => r.fromStage },
                    { label: 'To', value: (r) => r.toStage },
                    {
                      label: 'Converted',
                      value: (r) => `${r.conversionRate}%`,
                    },
                    { label: 'Drop-off', value: (r) => `${r.dropOffRate}%` },
                  ]}
                />
                <h2 className="text-white text-lg">Lost reasons</h2>
                <Table
                  rows={d.lostReasons}
                  columns={[
                    { label: 'Reason', value: (r) => r.reason },
                    { label: 'Leads', value: (r) => r.count },
                    { label: 'Share', value: (r) => `${r.percentage}%` },
                  ]}
                />
              </>
            )}
            {(kind === 'sales' || kind === 'financial') && (
              <>
                {kind === 'financial' && !d.financialsVisible ? (
                  <p className="text-gray-400">
                    Financial tracking is disabled for this dealership.
                  </p>
                ) : (
                  <QueryState query={ledger}>
                    {kind === 'financial' && (
                      <p className="text-lg text-white">
                        Gross profit: {money(d.grossProfit)} · Net profit:{' '}
                        {money(d.netProfit)}
                      </p>
                    )}
                    <button
                      className="btn-secondary my-3"
                      onClick={() => exportCsv(ledger.data || [])}
                    >
                      Export CSV
                    </button>
                    <Table
                      rows={ledger.data || []}
                      columns={[
                        { label: 'Date', value: (r) => date(r.saleDate) },
                        {
                          label: 'Customer',
                          value: (r) => name(r.lead?.customer),
                        },
                        {
                          label: 'Vehicle',
                          value: (r) => vehicleName(r.vehicle),
                        },
                        {
                          label: 'Salesperson',
                          value: (r) => name(r.salesperson),
                        },
                        {
                          label: 'Sale value',
                          value: (r) => money(r.saleValue),
                        },
                        ...(kind === 'financial'
                          ? [
                              {
                                label: 'Gross profit',
                                value: (r: any) => money(r.grossProfit),
                              },
                              {
                                label: 'Net profit',
                                value: (r: any) => money(r.netProfit),
                              },
                            ]
                          : []),
                      ]}
                    />
                  </QueryState>
                )}
              </>
            )}
          </>
        )}
      </QueryState>
    </Page>
  );
}
export function PerformanceReport() {
  const role = useActiveMembershipRole();
  const [range, setRange] = useState<DateRangePreset>('mtd');
  const query = useLiveQuery(['performance', role, range], async () =>
    role === 'salesperson'
      ? fetchSalespersonWorkspace()
      : fetchManagerWorkspace(range)
  );
  const d = query.data;
  return (
    <Page title="Performance and coaching">
      <Range value={range} set={setRange} />
      <QueryState query={query}>
        {d &&
          ('salespeople' in d ? (
            <>
              <Table
                rows={d.salespeople}
                columns={[
                  { label: 'Salesperson', value: (r) => r.name },
                  { label: 'Active leads', value: (r) => r.activeLeads },
                  { label: 'Calls', value: (r) => r.callsMade },
                  { label: 'Texts', value: (r) => r.textsSent },
                  { label: 'Emails', value: (r) => r.emailsSent },
                  { label: 'Sold', value: (r) => r.soldUnits },
                  { label: 'Overdue tasks', value: (r) => r.overdueTasks },
                  {
                    label: 'Completion',
                    value: (r) => `${r.taskCompletionRate}%`,
                  },
                ]}
              />
              <Table
                rows={d.coachingInsights}
                columns={[
                  { label: 'Salesperson', value: (r) => r.salespersonName },
                  { label: 'Finding', value: (r) => r.metricHighlight },
                  { label: 'Action', value: (r) => r.actionRecommendation },
                ]}
              />
            </>
          ) : (
            <div className="space-y-2 text-white">
              <p>Month-to-date units sold: {d.results.soldThisMonth}</p>
              <p>
                Month-to-date sales volume:{' '}
                {money(d.results.soldRevenueThisMonth)}
              </p>
              <p>Tasks remaining today: {d.tasksRemainingToday}</p>
            </div>
          ))}
      </QueryState>
    </Page>
  );
}
