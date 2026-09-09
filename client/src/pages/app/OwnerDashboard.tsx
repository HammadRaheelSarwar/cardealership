import { useLiveQuery } from '@/hooks/useLiveQuery';
import React, { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  Users,
  Award,
  Shield,
  AlertCircle,
  BarChart3,
  ArrowDownRight,
  ArrowUpRight,
  HelpCircle,
  CheckCircle,
} from 'lucide-react';
import { fetchOwnerWorkspace } from '@/services/workspaceService';
import type { OwnerWorkspaceData, DateRangePreset } from '@crm/shared';

export default function OwnerDashboard() {
  const [range, setRange] = useState<DateRangePreset>('mtd');

  const workspaceQuery = useLiveQuery(['workspace', 'owner', range], () =>
    fetchOwnerWorkspace(range)
  );
  const workspace = workspaceQuery.data;
  const loading = workspaceQuery.isPending;
  const error = workspaceQuery.error?.message;
  const loadWorkspace = async (_range?: DateRangePreset) => {
    await workspaceQuery.refetch();
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-10 bg-[#141414] rounded w-1/3" />
        <div className="grid grid-cols-4 gap-4 h-24 bg-[#141414] rounded" />
        <div className="h-56 bg-[#141414] rounded" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-red-950/20 border border-red-500/30 rounded-xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-sm font-semibold text-white">
          Error Loading Owner Workspace
        </h3>
        <p className="text-xs text-[#A0A0A0]">
          {error || 'Unable to retrieve dealership overview.'}
        </p>
        <button
          onClick={() => loadWorkspace(range)}
          className="btn-secondary btn-sm mt-2"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Executive Header (§19) ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Dealership Performance Overview
          </h1>
          <p className="text-xs text-[#8C8C8C] mt-0.5">
            Enterprise Health & Executive Diagnostics ·{' '}
            {workspace.dealershipName}
          </p>
        </div>

        {/* Date Range Selector (§8) */}
        <div className="flex items-center gap-1 bg-[#111111] p-1 rounded-lg border border-white/[0.06] text-xs">
          {(['today', '7d', '30d', 'mtd'] as DateRangePreset[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`px-2.5 py-1 rounded font-medium transition ${
                range === r
                  ? 'bg-[#222222] text-[#E6C85C] shadow-sm'
                  : 'text-[#8C8C8C] hover:text-white'
              }`}
            >
              {r === 'today'
                ? 'Today'
                : r === '7d'
                  ? '7 Days'
                  : r === '30d'
                    ? '30 Days'
                    : 'Month to Date'}
            </button>
          ))}
        </div>
      </div>

      {/* ── Section 1: Executive KPI Cards (§19) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Active Opportunities
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {workspace.totalActiveOpportunities}
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Working deals:{' '}
            <span className="text-white font-semibold">
              {workspace.workingDealsCount}
            </span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Showroom Visits
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {workspace.showsCount}
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Show rate:{' '}
            <span className="text-cyan-400 font-semibold">
              {workspace.showRate}%
            </span>{' '}
            ({workspace.appointmentsCount} booked)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Sales Volume
          </span>
          <div className="text-2xl font-bold text-[#E6C85C] font-mono">
            ${(workspace.salesVolume / 1000).toFixed(0)}k
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Units sold:{' '}
            <span className="text-emerald-400 font-semibold">
              {workspace.unitsSold}
            </span>{' '}
            · Conv: {workspace.overallConversionRate}%
          </p>
        </div>

        {/* Financial Visibility Permission Guard (§6) */}
        {workspace.financialsVisible ? (
          <div className="p-4 rounded-xl bg-[#0F120D] border border-emerald-500/20 space-y-1">
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
              Dealership Gross Profit
            </span>
            <div className="text-2xl font-bold text-emerald-300 font-mono">
              ${workspace.grossProfit?.toLocaleString()}
            </div>
            <p className="text-[11px] text-[#A0A0A0]">
              Net:{' '}
              <span className="text-white font-semibold">
                ${workspace.netProfit?.toLocaleString()}
              </span>
            </p>
          </div>
        ) : (
          <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
            <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
              Overall Conversion
            </span>
            <div className="text-2xl font-bold text-white font-mono">
              {workspace.overallConversionRate}%
            </div>
            <p className="text-[11px] text-[#A0A0A0]">
              Lead-to-contract efficiency
            </p>
          </div>
        )}
      </div>

      {/* ── Section 2: Multi-Manager Team Comparison (§20) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Multi-Manager / Team Comparison
          </h2>
          <span className="text-[11px] text-[#8C8C8C]">
            Team accountability breakdown
          </span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0E0E0E] text-[#8C8C8C] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">Manager & Team</th>
                <th className="p-3">Pipeline</th>
                <th className="p-3">Appts Booked</th>
                <th className="p-3">Shows</th>
                <th className="p-3">Sold Units</th>
                <th className="p-3">Conversion</th>
                {workspace.financialsVisible && (
                  <th className="p-3 text-right">Gross Profit</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {workspace.managerComparisons.map((m) => (
                <tr
                  key={m.managerId}
                  className="hover:bg-white/[0.02] transition"
                >
                  <td className="p-3">
                    <div className="font-semibold text-white">
                      {m.managerName}
                    </div>
                    <div className="text-[10px] text-[#6E6E6E]">
                      {m.teamName}
                    </div>
                  </td>
                  <td className="p-3 font-mono text-white">
                    {m.pipelineCount}
                  </td>
                  <td className="p-3 font-mono">{m.appointmentsCount}</td>
                  <td className="p-3 font-mono">{m.showsCount}</td>
                  <td className="p-3 font-mono font-semibold text-emerald-400">
                    {m.soldUnits}
                  </td>
                  <td className="p-3 font-mono font-semibold text-[#E6C85C]">
                    {m.conversionRate}%
                  </td>
                  {workspace.financialsVisible && (
                    <td className="p-3 font-mono text-right font-semibold text-emerald-400">
                      ${m.grossProfit?.toLocaleString()}
                    </td>
                  )}
                </tr>
              ))}

              {/* Dealership Total Row */}
              <tr className="bg-[#111111] font-bold border-t border-white/10">
                <td className="p-3 text-[#D4AF37] uppercase text-[10px] tracking-wider">
                  Total Dealership
                </td>
                <td className="p-3 font-mono text-white">
                  {workspace.managerComparisons.reduce(
                    (a, b) => a + b.pipelineCount,
                    0
                  )}
                </td>
                <td className="p-3 font-mono">
                  {workspace.managerComparisons.reduce(
                    (a, b) => a + b.appointmentsCount,
                    0
                  )}
                </td>
                <td className="p-3 font-mono">
                  {workspace.managerComparisons.reduce(
                    (a, b) => a + b.showsCount,
                    0
                  )}
                </td>
                <td className="p-3 font-mono text-emerald-400">
                  {workspace.unitsSold}
                </td>
                <td className="p-3 font-mono text-[#E6C85C]">
                  {workspace.overallConversionRate}%
                </td>
                {workspace.financialsVisible && (
                  <td className="p-3 font-mono text-right text-emerald-400">
                    ${workspace.grossProfit?.toLocaleString()}
                  </td>
                )}
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 3: Pipeline Conversion Funnel & Drop-Off (§22) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Pipeline Conversion & Drop-Off Analysis
          </h2>
          <span className="text-[11px] text-[#A0A0A0]">
            Pinpoint where opportunities exit
          </span>
        </div>

        <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
            {workspace.pipelineFunnel.map((step, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg border text-xs space-y-1.5 ${
                  step.isHighestDropOff
                    ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30'
                    : 'bg-[#111111] border-white/[0.06]'
                }`}
              >
                <div className="text-[10px] text-[#8C8C8C] truncate">
                  {step.fromStage} → {step.toStage}
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-base font-bold text-white font-mono">
                    {step.conversionRate}%
                  </span>
                  <span
                    className={`text-[11px] font-mono ${
                      step.isHighestDropOff
                        ? 'text-amber-400 font-bold'
                        : 'text-[#6E6E6E]'
                    }`}
                  >
                    -{step.dropOffRate}% drop
                  </span>
                </div>

                {step.isHighestDropOff && (
                  <span className="text-[9px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1 py-0.5 rounded block text-center">
                    Largest Drop-off
                  </span>
                )}
              </div>
            ))}
          </div>

          <div className="p-3 bg-[#121212] border border-amber-500/20 rounded-lg text-xs flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 shrink-0" />
            <span className="text-[#D0D0D0]">
              {workspace.pipelineFunnel.find((step) => step.isHighestDropOff)
                ? `Largest recorded drop-off: ${workspace.pipelineFunnel.find((step) => step.isHighestDropOff)!.fromStage} to ${workspace.pipelineFunnel.find((step) => step.isHighestDropOff)!.toStage}. Review follow-ups at this stage.`
                : 'No conversion drop-off recorded for this period.'}
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 4: Lost Reasons Breakdown (§32) ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
          Lost Reasons Distribution
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {workspace.lostReasons.map((lr) => (
            <div
              key={lr.reason}
              className="p-3 rounded-lg bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1"
            >
              <span className="text-[10px] font-medium text-[#8C8C8C] block truncate">
                {lr.reason}
              </span>
              <div className="text-lg font-bold text-white font-mono">
                {lr.percentage}%
              </div>
              <span className="text-[10px] text-[#6E6E6E] font-mono">
                {lr.count} leads lost
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
