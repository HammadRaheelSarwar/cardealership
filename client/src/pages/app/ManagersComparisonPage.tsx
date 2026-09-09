import React, { useState, useEffect } from 'react';
import {
  Users2, Award, TrendingUp, AlertTriangle, Shield,
  CheckCircle2, Download, Filter, ChevronRight, BarChart3
} from 'lucide-react';
import { fetchOwnerWorkspace } from '@/services/workspaceService';
import type { OwnerWorkspaceData, DateRangePreset } from '@crm/shared';

export default function ManagersComparisonPage() {
  const [range, setRange] = useState<DateRangePreset>('mtd');
  const [workspace, setWorkspace] = useState<OwnerWorkspaceData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchOwnerWorkspace(range);
        setWorkspace(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [range]);

  const handleExportCsv = () => {
    alert('Exporting Multi-Manager Team Comparison Ledger CSV...');
  };

  const teams = [
    {
      managerId: 'mgr-shane',
      managerName: 'Shane Miller',
      teamName: 'Downtown Sales Team',
      repsCount: 3,
      pipelineCount: 80,
      appointmentsCount: 25,
      showsCount: 14,
      showRate: 56,
      soldUnits: 7,
      conversionRate: 8.8,
      overdueTasksCount: 14,
      grossProfit: 35840,
      topRep: 'Sarah Parker (9 units)',
      coachingStatus: 'Review phone scripts',
    },
    {
      managerId: 'mgr-david',
      managerName: 'David Vance',
      teamName: 'Westside Sales Team',
      repsCount: 3,
      pipelineCount: 68,
      appointmentsCount: 21,
      showsCount: 12,
      showRate: 57,
      soldUnits: 6,
      conversionRate: 8.8,
      overdueTasksCount: 4,
      grossProfit: 30720,
      topRep: 'Elena Rostova (7 units)',
      coachingStatus: 'Excellent follow-up pace',
    },
    {
      managerId: 'mgr-marcus',
      managerName: 'Marcus Reed',
      teamName: 'Uptown Luxury Team',
      repsCount: 2,
      pipelineCount: 54,
      appointmentsCount: 18,
      showsCount: 11,
      showRate: 61,
      soldUnits: 5,
      conversionRate: 9.3,
      overdueTasksCount: 2,
      grossProfit: 25600,
      topRep: 'Christian Cole (5 units)',
      coachingStatus: 'Strong margin discipline',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Users2 className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Managers & Sales Teams Comparison
            </h1>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Multi-store and team accountability: Compare sales managers on pipeline velocity, show rate, task discipline, and gross contribution.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
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

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#141414] hover:bg-[#1f1f1f] border border-white/10 rounded-lg text-xs font-semibold text-white transition shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Top Level Manager Team Comparison Table ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Sales Manager Scorecards & Accountability
          </h2>
          <span className="text-[11px] text-[#A0A0A0]">3 Active Dealership Teams</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0E0E0E] text-[#8C8C8C] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">Manager & Team</th>
                <th className="p-3">Reps</th>
                <th className="p-3">Team Pipeline</th>
                <th className="p-3">Appts</th>
                <th className="p-3">Show Rate</th>
                <th className="p-3">Sold Units</th>
                <th className="p-3">Overdue Tasks</th>
                <th className="p-3">Closing %</th>
                <th className="p-3 text-right">Team Gross</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {teams.map((t) => (
                <tr key={t.managerId} className="hover:bg-white/[0.02] transition">
                  <td className="p-3">
                    <div className="font-semibold text-white">{t.managerName}</div>
                    <div className="text-[10px] text-[#6E6E6E]">{t.teamName}</div>
                  </td>
                  <td className="p-3 font-mono text-[#A0A0A0]">{t.repsCount} reps</td>
                  <td className="p-3 font-mono text-white font-bold">{t.pipelineCount}</td>
                  <td className="p-3 font-mono">{t.appointmentsCount}</td>
                  <td className="p-3 font-mono font-semibold text-cyan-400">{t.showRate}%</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{t.soldUnits}</td>
                  <td className="p-3 font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      t.overdueTasksCount > 5 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/15 text-emerald-300'
                    }`}>
                      {t.overdueTasksCount} overdue
                    </span>
                  </td>
                  <td className="p-3 font-mono font-semibold text-[#E6C85C]">{t.conversionRate}%</td>
                  <td className="p-3 font-mono text-right font-bold text-emerald-400">
                    ${t.grossProfit.toLocaleString()}
                  </td>
                </tr>
              ))}

              {/* Total Summary Row */}
              <tr className="bg-[#111111] font-bold border-t border-white/10">
                <td className="p-3 text-[#D4AF37] uppercase text-[10px] tracking-wider">
                  Total Dealership
                </td>
                <td className="p-3 font-mono text-[#A0A0A0]">8 reps</td>
                <td className="p-3 font-mono text-white">202</td>
                <td className="p-3 font-mono">64</td>
                <td className="p-3 font-mono text-cyan-400">58%</td>
                <td className="p-3 font-mono text-emerald-400">18 units</td>
                <td className="p-3 font-mono text-red-400">20 overdue</td>
                <td className="p-3 font-mono text-[#E6C85C]">8.9%</td>
                <td className="p-3 font-mono text-right text-emerald-400">$92,160</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Team Drilldown Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {teams.map((t) => (
          <div
            key={t.managerId}
            className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-3"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-bold text-white">{t.teamName}</h3>
                <p className="text-[10px] text-[#8C8C8C]">Lead: {t.managerName}</p>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#E6C85C]">
                {t.soldUnits} units
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#8C8C8C]">
                <span>Top Performer:</span>
                <strong className="text-white font-normal">{t.topRep}</strong>
              </div>
              <div className="flex justify-between text-[#8C8C8C]">
                <span>Task Discipline:</span>
                <span className={t.overdueTasksCount > 5 ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                  {t.overdueTasksCount} overdue tasks
                </span>
              </div>
              <div className="flex justify-between text-[#8C8C8C]">
                <span>Gross Revenue:</span>
                <strong className="text-emerald-400 font-bold">${t.grossProfit.toLocaleString()}</strong>
              </div>
            </div>

            <div className="pt-2 border-t border-white/[0.06] text-[11px] text-[#8C8C8C]">
              Coaching Note: <span className="text-white/90">{t.coachingStatus}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
