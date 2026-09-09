import React, { useState, useEffect } from 'react';
import {
  DollarSign, TrendingUp, Award, Car, Calendar,
  Download, Filter, ChevronRight, CheckCircle2, ArrowUpRight
} from 'lucide-react';
import { fetchOwnerWorkspace } from '@/services/workspaceService';
import type { OwnerWorkspaceData, DateRangePreset } from '@crm/shared';

export default function SalesVolumePage() {
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
    alert('Exporting Sales Volume & Delivery Ledger CSV...');
  };

  // Sales Leaderboard
  const leaderboard = [
    {
      rank: 1,
      name: 'Sarah Parker',
      role: 'Senior Sales Executive',
      unitsSold: 9,
      revenue: '$585,000',
      avgGross: '$3,820',
      totalGross: '$34,380',
      conversionRate: '8.8%',
      pacing: '112% of quota',
    },
    {
      rank: 2,
      name: 'Michael Brown',
      role: 'Sales Representative',
      unitsSold: 8,
      revenue: '$496,000',
      avgGross: '$3,150',
      totalGross: '$25,200',
      conversionRate: '7.1%',
      pacing: '100% of quota',
    },
    {
      rank: 3,
      name: 'James Wilson',
      role: 'Sales Representative',
      unitsSold: 6,
      revenue: '$339,000',
      avgGross: '$3,410',
      totalGross: '$20,460',
      conversionRate: '11.1%',
      pacing: '85% of quota',
    },
  ];

  // Vehicle Category Breakdown
  const categories = [
    { name: 'Luxury Full-Size SUVs', units: 11, volume: '$742,000', avgPrice: '$67,450', percent: 48 },
    { name: 'Sport Sedans & Coupes', units: 7, volume: '$438,000', avgPrice: '$62,570', percent: 30 },
    { name: 'Electric & Hybrid Vehicles', units: 5, volume: '$240,000', avgPrice: '$48,000', percent: 22 },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Sales Volume & Dealership Delivery Ledger
            </h1>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Enterprise gross revenue tracking, unit volume pacing, inventory category mix, and rep closing rankings.
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

      {/* ── Top Level Pacing & Volume Cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Total Units Delivered
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            {workspace?.unitsSold || 23} units
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Target: <span className="text-white font-semibold">30 units</span> (76.7% achieved)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Gross Sales Revenue
          </span>
          <div className="text-2xl font-bold text-[#E6C85C] font-mono">
            $1,420,000
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Avg selling price: <span className="text-white font-semibold">$61,739</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0F120D] border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Total Gross Profit
          </span>
          <div className="text-2xl font-bold text-emerald-300 font-mono">
            ${workspace?.grossProfit?.toLocaleString() || '117,760'}
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Avg front + back gross: <span className="text-emerald-400 font-semibold">$5,120 / unit</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Turnover Velocity
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            24 days
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Avg lot duration to sale
          </p>
        </div>
      </div>

      {/* ── Monthly Quota Pacing Bar ── */}
      <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-white">Dealership Monthly Quota Pacing</span>
          <span className="font-mono text-[#E6C85C]">23 / 30 Units (6 days remaining)</span>
        </div>
        <div className="w-full h-2.5 bg-[#161616] rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#D4AF37] to-[#E6C85C] rounded-full" style={{ width: '76.7%' }} />
        </div>
        <p className="text-[11px] text-[#8C8C8C]">
          On track to deliver 28-31 units by end of month based on currently working deals.
        </p>
      </div>

      {/* ── Sales Leaderboard ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Salesperson Delivery Leaderboard
          </h2>
          <span className="text-[11px] text-[#A0A0A0]">Ranked by units delivered & gross generated</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0E0E0E] text-[#8C8C8C] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">Rank & Salesperson</th>
                <th className="p-3">Units Sold</th>
                <th className="p-3">Gross Revenue</th>
                <th className="p-3">Avg Gross / Unit</th>
                <th className="p-3">Total Gross</th>
                <th className="p-3">Conversion</th>
                <th className="p-3 text-right">Quota Pacing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {leaderboard.map((rep) => (
                <tr key={rep.name} className="hover:bg-white/[0.02] transition">
                  <td className="p-3">
                    <div className="flex items-center gap-2">
                      <span className="w-5 h-5 rounded-full bg-white/[0.06] text-white flex items-center justify-center font-mono font-bold text-[10px]">
                        #{rep.rank}
                      </span>
                      <div>
                        <div className="font-semibold text-white">{rep.name}</div>
                        <div className="text-[10px] text-[#6E6E6E]">{rep.role}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-3 font-mono font-bold text-white">{rep.unitsSold}</td>
                  <td className="p-3 font-mono text-[#E6C85C]">{rep.revenue}</td>
                  <td className="p-3 font-mono text-emerald-400">{rep.avgGross}</td>
                  <td className="p-3 font-mono font-bold text-emerald-400">{rep.totalGross}</td>
                  <td className="p-3 font-mono">{rep.conversionRate}</td>
                  <td className="p-3 text-right font-semibold text-emerald-400">{rep.pacing}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Vehicle Category Mix ── */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
          Sales Volume by Vehicle Category
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {categories.map((cat) => (
            <div
              key={cat.name}
              className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">{cat.name}</span>
                <span className="text-xs font-mono font-bold text-[#E6C85C]">{cat.percent}%</span>
              </div>
              <div className="text-xl font-bold text-white font-mono">
                {cat.units} Units
              </div>
              <div className="text-xs text-[#8C8C8C] flex justify-between font-mono">
                <span>Total: {cat.volume}</span>
                <span>Avg: {cat.avgPrice}</span>
              </div>
              <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#D4AF37]" style={{ width: `${cat.percent}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
