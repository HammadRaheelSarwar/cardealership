import React, { useState, useEffect } from 'react';
import {
  TrendingUp, AlertTriangle, ArrowRight, Filter, Download,
  Layers, Users, HelpCircle, CheckCircle2, ChevronRight, Zap
} from 'lucide-react';
import { fetchOwnerWorkspace } from '@/services/workspaceService';
import type { OwnerWorkspaceData, DateRangePreset } from '@crm/shared';

export default function ConversionFunnelPage() {
  const [range, setRange] = useState<DateRangePreset>('mtd');
  const [workspace, setWorkspace] = useState<OwnerWorkspaceData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchOwnerWorkspace(range);
        setWorkspace(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [range]);

  const handleExportCsv = () => {
    alert('Exporting full conversion funnel & drop-off metrics to CSV...');
  };

  // Funnel Stage Progression Data
  const funnelStages = [
    {
      stage: '1. Inbound Leads',
      count: 120,
      value: '$7,420,000',
      conversionRate: 100,
      dropOff: 0,
      avgDays: '0.2 days',
      leakageReason: 'N/A',
      color: 'bg-blue-500',
    },
    {
      stage: '2. Contacted',
      count: 98,
      value: '$6,120,000',
      conversionRate: 81.7,
      dropOff: 18.3,
      avgDays: '1.8 days',
      leakageReason: '22 unreached / bad phone numbers',
      color: 'bg-indigo-500',
    },
    {
      stage: '3. Appointment Set',
      count: 41,
      value: '$2,680,000',
      conversionRate: 41.8,
      dropOff: 58.2, // CRITICAL DROP-OFF
      isHighestDropOff: true,
      avgDays: '2.4 days',
      leakageReason: '57 reached but stalled before showroom booking',
      color: 'bg-amber-500',
    },
    {
      stage: '4. Showroom / Test Drive',
      count: 28,
      value: '$1,890,000',
      conversionRate: 68.3,
      dropOff: 31.7,
      avgDays: '1.2 days',
      leakageReason: '13 appointment no-shows or reschedules',
      color: 'bg-cyan-500',
    },
    {
      stage: '5. Working Deal',
      count: 15,
      value: '$1,040,000',
      conversionRate: 53.6,
      dropOff: 46.4,
      avgDays: '4.1 days',
      leakageReason: '13 walked on pricing, trade-in, or payment terms',
      color: 'bg-purple-500',
    },
    {
      stage: '6. Units Delivered (Sold)',
      count: 7,
      value: '$512,000',
      conversionRate: 46.7,
      dropOff: 53.3,
      avgDays: '8.5 days total',
      leakageReason: '8 lost to lender decline or competitive buyout',
      color: 'bg-emerald-500',
    },
  ];

  // Lead Source Channel Performance
  const sourceChannels = [
    {
      source: 'Dealership Website (Direct/SEO)',
      leads: 42,
      appts: 18,
      showRate: 72,
      sold: 5,
      closeRate: 11.9,
      cac: '$0',
      roi: 'High ROI',
    },
    {
      source: 'CarGurus Premium',
      leads: 34,
      appts: 11,
      showRate: 55,
      sold: 3,
      closeRate: 8.8,
      cac: '$240',
      roi: 'Moderate',
    },
    {
      source: 'Autotrader Marketplace',
      leads: 22,
      appts: 6,
      showRate: 50,
      sold: 2,
      closeRate: 9.1,
      cac: '$310',
      roi: 'Review Spend',
    },
    {
      source: 'Walk-In Showroom Visits',
      leads: 14,
      appts: 14,
      showRate: 100,
      sold: 4,
      closeRate: 28.6,
      cac: '$0',
      roi: 'Highest',
    },
    {
      source: 'Client Referrals & Repeat',
      leads: 8,
      appts: 7,
      showRate: 88,
      sold: 3,
      closeRate: 37.5,
      cac: '$0',
      roi: 'Max Margin',
    },
  ];

  // Lost Deal Reasons
  const lostReasons = workspace?.lostReasons || [
    { reason: 'Price / Monthly Payment Gap', count: 24, percentage: 32 },
    { reason: 'Bought at Competing Dealership', count: 18, percentage: 24 },
    { reason: 'Financing / Credit Declined', count: 14, percentage: 18 },
    { reason: 'Vehicle / Trim Desired Sold Out', count: 11, percentage: 15 },
    { reason: 'Ghosted / No Reply After 5 Touches', count: 8, percentage: 11 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Conversion Funnel & Drop-Off Diagnostics
            </h1>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            End-to-end deal velocity analysis: identify lead leakage, stage bottlenecks, and marketing channel conversion ROI.
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

      {/* ── Section 1: Executive Funnel Headline ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Total Inbound Pipeline
          </span>
          <div className="text-2xl font-bold text-white font-mono">120</div>
          <p className="text-[11px] text-[#A0A0A0]">
            Gross value: <span className="text-white font-semibold">$7.42M</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Appointment Show Rate
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">68.3%</div>
          <p className="text-[11px] text-[#A0A0A0]">28 of 41 appointments shown</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Showroom-to-Close Rate
          </span>
          <div className="text-2xl font-bold text-[#E6C85C] font-mono">25.0%</div>
          <p className="text-[11px] text-[#A0A0A0]">7 sold of 28 visited customers</p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F120D] border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Overall Lead-to-Close
          </span>
          <div className="text-2xl font-bold text-emerald-300 font-mono">5.8%</div>
          <p className="text-[11px] text-[#A0A0A0]">
            Dealership benchmark: <span className="text-white font-semibold">5.0% - 7.5%</span>
          </p>
        </div>
      </div>

      {/* ── Section 2: Macro Funnel Drop-Off Flow ── */}
      <div className="p-5 rounded-xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Dealership Stage-to-Stage Leakage Breakdown
            </h2>
            <p className="text-[11px] text-[#8C8C8C] mt-0.5">
              Identifies the precise step where prospect volume declines
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span className="text-amber-300 font-medium">Largest Drop-off Flagged</span>
          </div>
        </div>

        {/* Funnel Step Cards */}
        <div className="space-y-3">
          {funnelStages.map((stg, i) => (
            <div
              key={stg.stage}
              className={`p-3.5 rounded-xl border transition ${
                stg.isHighestDropOff
                  ? 'bg-amber-950/20 border-amber-500/40 ring-1 ring-amber-500/30'
                  : 'bg-[#0E0E0E] border-white/[0.06]'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md bg-[#181818] border border-white/10 flex items-center justify-center text-xs font-bold text-white">
                    {i + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white">{stg.stage}</span>
                    <span className="text-[10px] text-[#8C8C8C] ml-2">Pipeline: {stg.value}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs font-mono">
                  <div className="text-right">
                    <span className="text-sm font-bold text-white">{stg.count} leads</span>
                    <div className="text-[10px] text-[#8C8C8C]">{stg.avgDays} avg duration</div>
                  </div>

                  {i > 0 && (
                    <div className="text-right min-w-[80px]">
                      <span className="text-xs font-semibold text-white">
                        {stg.conversionRate}% pass
                      </span>
                      <div className={`text-[10px] font-bold ${
                        stg.isHighestDropOff ? 'text-amber-400' : 'text-red-400'
                      }`}>
                        -{stg.dropOff}% drop
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Progress bar visualizer */}
              <div className="w-full h-1.5 bg-[#1C1C1C] rounded-full mt-2.5 overflow-hidden">
                <div
                  className={`h-full ${stg.color} transition-all duration-500`}
                  style={{ width: `${(stg.count / 120) * 100}%` }}
                />
              </div>

              {/* Leakage reason footnote */}
              {i > 0 && (
                <div className="flex items-center gap-2 mt-2 text-[11px] text-[#8C8C8C]">
                  <span className="text-white/30">•</span>
                  <span>Primary Exit Reason: <strong className="text-white/80 font-normal">{stg.leakageReason}</strong></span>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Executive Action Banner */}
        <div className="p-3.5 bg-[#121008] border border-amber-500/30 rounded-xl text-xs flex items-start gap-2.5">
          <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-amber-300">Executive Bottleneck Action Plan:</span>
            <p className="text-[#C8C8C8] leading-relaxed">
              <strong>58.2% drop-off between Contacted and Appointment Set</strong> is your dealership's single greatest leakage point.
              Sales reps are sending price sheets over email rather than scheduling showroom appointments. Instruct Sales Manager <strong>Shane Miller</strong> to mandate phone test-drive booking scripts.
            </p>
          </div>
        </div>
      </div>

      {/* ── Section 3: Lead Source Channel Efficiency ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Lead Source Channel Conversion & ROI
          </h2>
          <span className="text-[11px] text-[#A0A0A0]">Comparing inbound ad spend channels</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0E0E0E] text-[#8C8C8C] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">Source Channel</th>
                <th className="p-3">Inbound Leads</th>
                <th className="p-3">Appts Booked</th>
                <th className="p-3">Show Rate</th>
                <th className="p-3">Units Sold</th>
                <th className="p-3">Lead-to-Close %</th>
                <th className="p-3">Est. CAC</th>
                <th className="p-3 text-right">Rating</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {sourceChannels.map((sc) => (
                <tr key={sc.source} className="hover:bg-white/[0.02] transition">
                  <td className="p-3 font-semibold text-white">{sc.source}</td>
                  <td className="p-3 font-mono text-white">{sc.leads}</td>
                  <td className="p-3 font-mono">{sc.appts}</td>
                  <td className="p-3 font-mono font-semibold text-cyan-400">{sc.showRate}%</td>
                  <td className="p-3 font-mono font-semibold text-emerald-400">{sc.sold}</td>
                  <td className="p-3 font-mono font-semibold text-[#E6C85C]">{sc.closeRate}%</td>
                  <td className="p-3 font-mono text-[#A0A0A0]">{sc.cac}</td>
                  <td className="p-3 text-right">
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-white/[0.05] text-white">
                      {sc.roi}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Section 4: Lost Deal Root Causes ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
          Lost Deal Root Cause Distribution (75 Total Lost Deals)
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {lostReasons.map((lr) => (
            <div
              key={lr.reason}
              className="p-3.5 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1.5"
            >
              <span className="text-[10px] font-medium text-[#8C8C8C] block line-clamp-2">
                {lr.reason}
              </span>
              <div className="text-xl font-bold text-white font-mono">
                {lr.percentage}%
              </div>
              <span className="text-[10px] text-[#6E6E6E] font-mono block">
                {lr.count} prospects lost
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
