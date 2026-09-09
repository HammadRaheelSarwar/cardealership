import React, { useState, useEffect } from 'react';
import {
  BarChart3, TrendingUp, Download, Calendar, Users, Award, CheckCircle2,
  AlertTriangle, Phone, MessageSquare, Mail, Filter
} from 'lucide-react';
import { fetchManagerWorkspace } from '@/services/workspaceService';
import type { ManagerWorkspaceData, DateRangePreset } from '@crm/shared';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<DateRangePreset>('mtd');
  const [workspace, setWorkspace] = useState<ManagerWorkspaceData | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchManagerWorkspace(dateRange);
        setWorkspace(data);
      } catch (err) {
        console.error(err);
      }
    }
    load();
  }, [dateRange]);

  const handleExportCsv = () => {
    alert('Exporting full sales and activity reporting CSV...');
  };

  const salespeople = workspace?.salespeople || [
    {
      id: 'rep-sarah',
      name: 'Sarah Parker',
      activeLeads: 34,
      tasksDue: 6,
      overdueTasks: 6,
      appointmentsToday: 2,
      callsMade: 38,
      textsSent: 45,
      emailsSent: 24,
      showRate: 58,
      soldUnits: 3,
      conversionRate: 8.8,
      taskCompletionRate: 94,
    },
    {
      id: 'rep-michael',
      name: 'Michael Brown',
      activeLeads: 28,
      tasksDue: 5,
      overdueTasks: 5,
      appointmentsToday: 1,
      callsMade: 14,
      textsSent: 18,
      emailsSent: 8,
      showRate: 52,
      soldUnits: 2,
      conversionRate: 7.1,
      taskCompletionRate: 62,
    },
    {
      id: 'rep-james',
      name: 'James Wilson',
      activeLeads: 18,
      tasksDue: 3,
      overdueTasks: 3,
      appointmentsToday: 1,
      callsMade: 22,
      textsSent: 26,
      emailsSent: 15,
      showRate: 64,
      soldUnits: 2,
      conversionRate: 11.1,
      taskCompletionRate: 88,
    },
  ];

  const totalCalls = salespeople.reduce((a, b) => a + b.callsMade, 0);
  const totalTexts = salespeople.reduce((a, b) => a + b.textsSent, 0);
  const totalEmails = salespeople.reduce((a, b) => a + b.emailsSent, 0);
  const totalSold = salespeople.reduce((a, b) => a + b.soldUnits, 0);
  const avgShowRate = Math.round(salespeople.reduce((a, b) => a + b.showRate, 0) / salespeople.length);

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ── Header (§16) ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Manager Performance & Activity Reports
            </h1>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Section 16 Metrics: Tasks completed, missed activities, communication volumes, appointments set, show rate, and salesperson conversion.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Date range filter */}
          <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-lg border border-white/[0.06] text-xs">
            {(['today', '7d', '30d', 'mtd'] as DateRangePreset[]).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-2.5 py-1 rounded font-medium transition ${
                  dateRange === r ? 'bg-[#222222] text-[#E6C85C] shadow-sm' : 'text-[#8C8C8C] hover:text-white'
                }`}
              >
                {r === 'today' ? 'Today' : r === '7d' ? '7 Days' : r === '30d' ? '30 Days' : 'Month to Date'}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCsv}
            className="btn-secondary btn-sm text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* ── Section 1: Aggregate Team Activity Roll-Up (§16) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Calls Made
          </span>
          <div className="text-2xl font-bold text-white font-mono">{totalCalls}</div>
          <p className="text-[11px] text-[#A0A0A0]">Outbound dials</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Texts Sent
          </span>
          <div className="text-2xl font-bold text-white font-mono">{totalTexts}</div>
          <p className="text-[11px] text-[#A0A0A0]">Direct SMS inquiries</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Emails Sent
          </span>
          <div className="text-2xl font-bold text-white font-mono">{totalEmails}</div>
          <p className="text-[11px] text-[#A0A0A0]">Quote & vehicle emails</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Show Rate
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">{avgShowRate}%</div>
          <p className="text-[11px] text-[#A0A0A0]">Appointment adherence</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F120D] border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Units Delivered
          </span>
          <div className="text-2xl font-bold text-emerald-300 font-mono">{totalSold}</div>
          <p className="text-[11px] text-[#A0A0A0]">Team closed deals</p>
        </div>
      </div>

      {/* ── Section 2: Tasks Completed & Missed by Salesperson Table (§16) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Salesperson Activity Audit & Completion Rates
          </h2>
          <span className="text-[11px] text-[#A0A0A0]">Accountability breakdown across assigned team</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0E0E0E] text-[#8C8C8C] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">Salesperson</th>
                <th className="p-3">Active Pipeline</th>
                <th className="p-3">Tasks Completed</th>
                <th className="p-3">Tasks Missed (Overdue)</th>
                <th className="p-3">Calls</th>
                <th className="p-3">Texts</th>
                <th className="p-3">Emails</th>
                <th className="p-3">Show Rate</th>
                <th className="p-3">Units Sold</th>
                <th className="p-3">Closing %</th>
                <th className="p-3 text-right">Follow-Up Completion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {salespeople.map((rep) => (
                <tr key={rep.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-semibold text-white">{rep.name}</td>
                  <td className="p-3 font-mono">{rep.activeLeads}</td>
                  <td className="p-3 font-mono text-emerald-400 font-semibold">{rep.taskCompletionRate}%</td>
                  <td className="p-3 font-mono text-red-400 font-semibold">{rep.overdueTasks}</td>
                  <td className="p-3 font-mono text-[#A0A0A0]">{rep.callsMade}</td>
                  <td className="p-3 font-mono text-[#A0A0A0]">{rep.textsSent}</td>
                  <td className="p-3 font-mono text-[#A0A0A0]">{rep.emailsSent}</td>
                  <td className="p-3 font-mono text-cyan-400 font-semibold">{rep.showRate}%</td>
                  <td className="p-3 font-mono font-semibold text-emerald-400">{rep.soldUnits}</td>
                  <td className="p-3 font-mono text-[#E6C85C] font-semibold">{rep.conversionRate}%</td>
                  <td className="p-3 text-right font-mono">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${
                      rep.taskCompletionRate >= 85
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : 'bg-red-500/10 text-red-400 font-semibold'
                    }`}>
                      {rep.taskCompletionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 3: Stage-by-Stage Conversion Funnel (§22) ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
          Stage-to-Stage Conversion Benchmarks
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {[
            { step: 'New → Contacted', rate: '81%', note: 'Initial Response' },
            { step: 'Contacted → Appt', rate: '42%', note: 'Phone Pitch' },
            { step: 'Appt → Show', rate: '68%', note: 'Showroom Visit' },
            { step: 'Show → Working Deal', rate: '54%', note: 'Numbers Presented' },
            { step: 'Working Deal → Sold', rate: '47%', note: 'Finance & Delivery' },
          ].map((s) => (
            <div
              key={s.step}
              className="p-3 rounded-lg bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1"
            >
              <span className="text-[10px] text-[#8C8C8C] block truncate">{s.step}</span>
              <div className="text-xl font-bold text-white font-mono">{s.rate}</div>
              <span className="text-[10px] text-[#6E6E6E]">{s.note}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
