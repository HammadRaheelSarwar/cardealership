import { dateWindow, ownerMetrics } from '../services/workspaceMetrics';
const now = new Date('2026-09-09T15:00:00Z');
function records() {
  return {
    stages: [
      { id: 'new', name: 'New', type: 'standard', sort_order: 0 },
      { id: 'sold', name: 'Sold', type: 'won', sort_order: 1 },
    ],
    leads: [],
    tasks: [],
    sales: [],
    appointments: [],
    members: [],
    teams: [],
    history: [],
  };
}
describe('live owner metrics', () => {
  it('reports genuine zeros for an empty dealership', () => {
    const d = ownerMetrics(
      records(),
      'mtd',
      'Empty dealership',
      true,
      'UTC',
      now
    );
    expect(d).toMatchObject({
      unitsSold: 0,
      salesVolume: 0,
      grossProfit: 0,
      appointmentsCount: 0,
      totalActiveOpportunities: 0,
      managerComparisons: [],
      lostReasons: [],
    });
    expect(d.pipelineFunnel[0]).toMatchObject({
      conversionRate: 0,
      dropOffRate: 0,
      isHighestDropOff: false,
    });
  });
  it('uses selected-period sales and appointments, excludes cancelled and out-of-period records', () => {
    const d: any = records();
    d.sales = [
      {
        sale_date: '2026-09-09T10:00:00Z',
        sale_value: 40000,
        gross_profit: 0,
        net_profit: -100,
      },
      { sale_date: '2026-08-01T10:00:00Z', sale_value: 90000 },
    ];
    d.appointments = [
      { starts_at: '2026-09-09T09:00:00Z', status: 'completed' },
      { starts_at: '2026-09-09T11:00:00Z', status: 'scheduled' },
      { starts_at: '2026-09-09T12:00:00Z', status: 'cancelled' },
    ];
    const result = ownerMetrics(d, 'today', 'Store', true, 'UTC', now);
    expect(result).toMatchObject({
      unitsSold: 1,
      salesVolume: 40000,
      grossProfit: 0,
      netProfit: -100,
      appointmentsCount: 2,
      showsCount: 1,
      showRate: 50,
    });
  });
  it('omits financial amounts when disabled', () => {
    const d: any = records();
    d.members = [
      {
        user_id: 'manager',
        role: 'manager',
        status: 'active',
        profile: { first_name: 'Real', last_name: 'Manager' },
      },
    ];
    const result = ownerMetrics(d, 'mtd', 'Store', false, 'UTC', now);
    expect(result).not.toHaveProperty('grossProfit');
    expect(result.managerComparisons[0]).not.toHaveProperty('grossProfit');
  });
  it('builds conversion from unique recorded stage visits, without double-counting repeat visits', () => {
    const d: any = records();
    d.leads = [
      {
        id: 'a',
        created_at: '2026-09-01',
        pipeline_stage_id: 'sold',
        status: 'won',
      },
      {
        id: 'b',
        created_at: '2026-09-01',
        pipeline_stage_id: 'new',
        status: 'open',
      },
    ];
    d.history = [
      { lead_id: 'a', from_stage_id: 'new', to_stage_id: 'sold' },
      { lead_id: 'a', from_stage_id: 'new', to_stage_id: 'sold' },
    ];
    const result = ownerMetrics(d, 'mtd', 'Store', true, 'UTC', now);
    expect(result.pipelineFunnel[0]).toMatchObject({
      conversionRate: 50,
      dropOffRate: 50,
    });
  });
  it('does not attribute unassigned leads to a manager without a team', () => {
    const d: any = records();
    d.members = [
      {
        user_id: 'manager',
        role: 'manager',
        status: 'active',
        profile: { first_name: 'Real' },
      },
    ];
    d.leads = [{ id: 'a', assigned_user_id: 'other', status: 'open' }];
    expect(
      ownerMetrics(d, 'mtd', 'Store', true, 'UTC', now).managerComparisons[0]
        .pipelineCount
    ).toBe(0);
  });
  it('honors timezone and DST day boundaries', () => {
    const w = dateWindow(
      'today',
      'America/New_York',
      new Date('2026-03-08T16:00:00Z')
    );
    expect(w.today.toISOString()).toBe('2026-03-08T05:00:00.000Z');
    expect(w.end.toISOString()).toBe('2026-03-09T04:00:00.000Z');
  });
});
