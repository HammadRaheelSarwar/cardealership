import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, AlertTriangle, TrendingUp, Sparkles, ChevronRight,
  Phone, MessageSquare, Mail, Calendar, CheckCircle2, AlertCircle, X, ChevronDown
} from 'lucide-react';
import { fetchManagerWorkspace } from '@/services/workspaceService';
import type {
  ManagerWorkspaceData,
  DateRangePreset,
  OverdueSalespersonBreakdown,
  SalespersonPerformanceMetric,
} from '@crm/shared';

export default function ManagerDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [workspace, setWorkspace] = useState<ManagerWorkspaceData | null>(null);
  const [range, setRange] = useState<DateRangePreset>('mtd');

  // Drilldown modals
  const [activeOverdueRep, setActiveOverdueRep] = useState<OverdueSalespersonBreakdown | null>(null);
  const [activeRepScorecard, setActiveRepScorecard] = useState<SalespersonPerformanceMetric | null>(null);

  useEffect(() => {
    loadWorkspace(range);
  }, [range]);

  const loadWorkspace = async (selectedRange: DateRangePreset) => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchManagerWorkspace(selectedRange);
      setWorkspace(data);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || 'Failed to load manager workspace.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-10 bg-[#141414] rounded w-1/3" />
        <div className="h-28 bg-[#141414] rounded" />
        <div className="h-64 bg-[#141414] rounded" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-red-950/20 border border-red-500/30 rounded-xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-sm font-semibold text-white">Error Loading Manager Workspace</h3>
        <p className="text-xs text-[#A0A0A0]">{error || 'Unable to load team workspace.'}</p>
        <button onClick={() => loadWorkspace(range)} className="btn-secondary btn-sm mt-2">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Editorial Header (§13) ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Team Pipeline & Accountability
          </h1>
          <p className="text-xs text-[#8C8C8C] mt-0.5">
            Monitoring Downtown Sales Team · {workspace.managerName}
          </p>
        </div>

        {/* Date Range Selector (§8) */}
        <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-lg border border-white/[0.06] text-xs">
          {(['today', '7d', '30d', 'mtd'] as DateRangePreset[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded font-medium transition ${
                range === r ? 'bg-[#222222] text-[#E6C85C] shadow-sm' : 'text-[#8C8C8C] hover:text-white'
              }`}
            >
              {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'Month to Date'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 1: Team Pipeline (§13) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#6E6E6E] uppercase tracking-wider">
            Team Pipeline (Total Team Lead Velocity)
          </span>
          <span className="text-[11px] text-[#A0A0A0]">Click any stage count to review</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {workspace.teamPipeline.map((st) => (
            <div
              key={st.stageId}
              className="p-3.5 rounded-lg bg-[#0B0B0B] border border-[rgba(255,255,255,0.06)] hover:border-white/20 transition-all space-y-2 cursor-pointer group"
              onClick={() => {
                const rep = workspace.overdueBySalesperson[0];
                if (rep) setActiveOverdueRep(rep);
              }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-wider truncate">
                  {st.name}
                </span>
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: st.color }}
                />
              </div>

              <div className="text-xl font-bold text-white font-mono group-hover:text-[#E6C85C] transition-colors">
                {st.customerCount}
              </div>

              {/* Tasks overdue / due badge */}
              <div className="pt-1.5 border-t border-[rgba(255,255,255,0.04)] text-[11px]">
                {st.tasksOverdueCount && st.tasksOverdueCount > 0 ? (
                  <span className="text-red-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" />
                    {st.tasksOverdueCount} overdue
                  </span>
                ) : (
                  <span className="text-[#8C8C8C]">
                    {st.tasksDueCount} tasks due
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: Overdue Tasks Drill-Down (§14) ── */}
      <div className="p-4 rounded-xl bg-[#0F0D0D] border border-red-500/20 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              {workspace.totalOverdueTasks} Overdue Tasks Across Team
            </h2>
          </div>
          <span className="text-[11px] text-[#A0A0A0]">Click salesperson to open overdue queue</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {workspace.overdueBySalesperson.map((rep) => (
            <div
              key={rep.salespersonId}
              onClick={() => setActiveOverdueRep(rep)}
              className="p-3 bg-[#161212] hover:bg-[#1E1717] border border-red-500/30 rounded-lg cursor-pointer transition flex items-center justify-between group"
            >
              <div>
                <h4 className="text-xs font-semibold text-white group-hover:text-red-300 transition">
                  {rep.salespersonName}
                </h4>
                <p className="text-[11px] font-mono text-red-400 font-bold mt-0.5">
                  {rep.overdueCount} overdue tasks
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-[#8C8C8C] group-hover:translate-x-1 transition-transform" />
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 3: Manager Coaching View (§15) ── */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-[#D4AF37]" />
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Diagnostic Coaching Insights
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workspace.coachingInsights.map((coach) => (
            <div
              key={coach.id}
              className="p-4 rounded-xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.3)] space-y-2 relative"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-white">
                  {coach.salespersonName}
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#E6C85C]">
                  {coach.metricHighlight}
                </span>
              </div>

              <p className="text-xs text-white font-medium">
                "{coach.insight}"
              </p>

              <div className="pt-2 border-t border-white/[0.04] text-[11px] text-[#A0A0A0]">
                <span className="text-[#D4AF37] font-semibold">Recommended Coaching:</span>{' '}
                {coach.actionRecommendation}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 4: Salespeople Scorecard (§17) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Salespeople Performance Scorecard
          </h2>
          <span className="text-[11px] text-[#8C8C8C]">Activity, appointments & conversion benchmarks</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0E0E0E] text-[#8C8C8C] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">Salesperson</th>
                <th className="p-3">Active</th>
                <th className="p-3">Tasks Due</th>
                <th className="p-3">Overdue</th>
                <th className="p-3">Appts Today</th>
                <th className="p-3">Calls</th>
                <th className="p-3">Texts</th>
                <th className="p-3">Show Rate</th>
                <th className="p-3">Sold</th>
                <th className="p-3">Conv %</th>
                <th className="p-3">Completion</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {workspace.salespeople.map((rep) => (
                <tr
                  key={rep.id}
                  className="hover:bg-white/[0.02] transition cursor-pointer"
                  onClick={() => setActiveRepScorecard(rep)}
                >
                  <td className="p-3 font-semibold text-white">{rep.name}</td>
                  <td className="p-3 font-mono">{rep.activeLeads}</td>
                  <td className="p-3 font-mono">{rep.tasksDue}</td>
                  <td className="p-3 font-mono text-red-400 font-semibold">{rep.overdueTasks}</td>
                  <td className="p-3 font-mono text-cyan-400">{rep.appointmentsToday}</td>
                  <td className="p-3 font-mono text-[#A0A0A0]">{rep.callsMade}</td>
                  <td className="p-3 font-mono text-[#A0A0A0]">{rep.textsSent}</td>
                  <td className="p-3 font-mono">{rep.showRate}%</td>
                  <td className="p-3 font-mono font-semibold text-emerald-400">{rep.soldUnits}</td>
                  <td className="p-3 font-mono text-[#E6C85C] font-semibold">{rep.conversionRate}%</td>
                  <td className="p-3 font-mono">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] ${
                      rep.taskCompletionRate >= 85 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {rep.taskCompletionRate}%
                    </span>
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveRepScorecard(rep);
                      }}
                      className="text-xs text-[#D4AF37] hover:underline"
                    >
                      Detail →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Rep Overdue Tasks Modal ── */}
      {activeOverdueRep && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-red-500/30 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Overdue Tasks: {activeOverdueRep.salespersonName}
                </h3>
                <p className="text-xs text-red-400 font-medium">
                  {activeOverdueRep.overdueCount} activities overdue
                </p>
              </div>
              <button
                onClick={() => setActiveOverdueRep(null)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[340px] overflow-y-auto">
              {activeOverdueRep.tasks.map((t) => (
                <div
                  key={t.id}
                  className="p-3 bg-[#151212] border border-red-500/20 rounded-lg space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{t.title}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-red-500/20 text-red-300">
                      {t.daysOverdue}d overdue
                    </span>
                  </div>
                  <p className="text-xs text-[#8C8C8C]">
                    Customer: <span className="text-white">{t.customerName}</span> · {t.vehicle}
                  </p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setActiveOverdueRep(null)}
                className="btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Rep Scorecard Detail Modal ── */}
      {activeRepScorecard && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[rgba(212,175,55,0.3)] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">{activeRepScorecard.name}</h3>
                <p className="text-xs text-[#8C8C8C]">Individual Salesperson Diagnostic</p>
              </div>
              <button
                onClick={() => setActiveRepScorecard(null)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 bg-[#141414] rounded">
                <span className="text-[#8C8C8C] block text-[10px] uppercase">Active Leads</span>
                <span className="text-base font-bold text-white font-mono">{activeRepScorecard.activeLeads}</span>
              </div>
              <div className="p-2.5 bg-[#141414] rounded">
                <span className="text-[#8C8C8C] block text-[10px] uppercase">Task Completion</span>
                <span className="text-base font-bold text-white font-mono">{activeRepScorecard.taskCompletionRate}%</span>
              </div>
              <div className="p-2.5 bg-[#141414] rounded">
                <span className="text-[#8C8C8C] block text-[10px] uppercase">Show Rate</span>
                <span className="text-base font-bold text-white font-mono">{activeRepScorecard.showRate}%</span>
              </div>
              <div className="p-2.5 bg-[#141414] rounded">
                <span className="text-[#8C8C8C] block text-[10px] uppercase">Conversion</span>
                <span className="text-base font-bold text-[#E6C85C] font-mono">{activeRepScorecard.conversionRate}%</span>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.08] flex justify-end">
              <button
                onClick={() => setActiveRepScorecard(null)}
                className="btn-secondary btn-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
