import React, { useState, useEffect } from 'react';
import {
  Wallet, DollarSign, TrendingUp, Shield, Lock, Download,
  Percent, AlertCircle, ArrowUpRight, BarChart3, Clock
} from 'lucide-react';
import { fetchOwnerWorkspace } from '@/services/workspaceService';
import type { OwnerWorkspaceData, DateRangePreset } from '@crm/shared';

export default function FinancialReportsPage() {
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
    alert('Exporting Financial Profitability & F&I Ledger CSV...');
  };

  // Recent delivered vehicle deals ledger
  const deals = [
    {
      id: 'deal-1',
      date: 'Sep 8, 2026',
      customer: 'John Carter',
      vehicle: '2024 Mercedes-Benz S 580',
      stock: 'P24-101',
      salePrice: '$114,500',
      frontEndGross: '$5,800',
      backEndGross: '$2,400',
      totalGross: '$8,200',
      margin: '7.2%',
      salesperson: 'Sarah Parker',
    },
    {
      id: 'deal-2',
      date: 'Sep 7, 2026',
      customer: 'Marcus Bennett',
      vehicle: '2024 Porsche Cayenne Turbo',
      stock: 'P24-089',
      salePrice: '$132,000',
      frontEndGross: '$7,200',
      backEndGross: '$3,100',
      totalGross: '$10,300',
      margin: '7.8%',
      salesperson: 'Sarah Parker',
    },
    {
      id: 'deal-3',
      date: 'Sep 5, 2026',
      customer: 'Emily Davis',
      vehicle: '2023 BMW 330i M Sport',
      stock: 'P24-042',
      salePrice: '$43,500',
      frontEndGross: '$2,900',
      backEndGross: '$1,600',
      totalGross: '$4,500',
      margin: '10.3%',
      salesperson: 'Michael Brown',
    },
    {
      id: 'deal-4',
      date: 'Sep 4, 2026',
      customer: 'Robert Taylor',
      vehicle: '2023 Honda Accord Sport',
      stock: 'P24-033',
      salePrice: '$31,800',
      frontEndGross: '$2,100',
      backEndGross: '$1,200',
      totalGross: '$3,300',
      margin: '10.4%',
      salesperson: 'James Wilson',
    },
    {
      id: 'deal-5',
      date: 'Sep 2, 2026',
      customer: 'David Wilson',
      vehicle: '2024 Ford F-150 SuperCrew',
      stock: 'P24-112',
      salePrice: '$58,900',
      frontEndGross: '$3,600',
      backEndGross: '$2,200',
      totalGross: '$5,800',
      margin: '9.8%',
      salesperson: 'Michael Brown',
    },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ── Header ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Executive Financial & Profitability Reports
            </h1>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Gated executive financial statements: Front-end vehicle margins, F&I back-end capture, and holding cost analytics.
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

      {/* ── Financial Security Banner ── */}
      <div className="p-3 bg-[#111108] border border-[#D4AF37]/30 rounded-xl text-xs flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-white font-medium">Dealer Principal Access Only</span>
          <span className="text-[#8C8C8C] hidden sm:inline">— Financial tracking is encrypted and restricted from sales staff view.</span>
        </div>
        <span className="text-[10px] text-[#E6C85C] font-mono bg-white/[0.04] px-2 py-0.5 rounded">
          Permission Level: Executive
        </span>
      </div>

      {/* ── Key Profitability Metrics ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="p-4 rounded-xl bg-[#0F120D] border border-emerald-500/20 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
            Total Dealership Gross Profit
          </span>
          <div className="text-2xl font-bold text-emerald-300 font-mono">
            $117,760
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            <span className="text-emerald-400 font-semibold">+14.2%</span> vs last month
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Front-End Vehicle Gross
          </span>
          <div className="text-2xl font-bold text-white font-mono">
            $78,660
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Avg: <span className="text-white font-semibold">$3,420 / unit</span>
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Back-End F&I Products Gross
          </span>
          <div className="text-2xl font-bold text-[#E6C85C] font-mono">
            $39,100
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Avg: <span className="text-white font-semibold">$1,700 / unit</span> (F&I penetration 78%)
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#0C0C0C] border border-[rgba(255,255,255,0.06)] space-y-1">
          <span className="text-[10px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
            Net Dealership Margin
          </span>
          <div className="text-2xl font-bold text-cyan-400 font-mono">
            8.3%
          </div>
          <p className="text-[11px] text-[#A0A0A0]">
            Net profit: <span className="text-white font-semibold">$117,800</span>
          </p>
        </div>
      </div>

      {/* ── Floor Plan & Holding Cost Audit ── */}
      <div className="p-4 rounded-xl bg-[#0A0A0A] border border-[rgba(255,255,255,0.06)] space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold text-white uppercase tracking-wider">
              Inventory Holding Cost & Floor Plan Analysis
            </h2>
          </div>
          <span className="text-[11px] text-[#A0A0A0]">Daily carrying cost: $42 / unit</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-[#111111] rounded-lg border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-[#8C8C8C] block">MTD Holding Cost Paid</span>
            <span className="text-base font-bold font-mono text-white">$24,180</span>
            <p className="text-[10px] text-[#6E6E6E]">Interest, insurance & lot maintenance</p>
          </div>
          <div className="p-3 bg-[#111111] rounded-lg border border-white/[0.06] space-y-1">
            <span className="text-[10px] text-[#8C8C8C] block">Average Lot Turn Time</span>
            <span className="text-base font-bold font-mono text-emerald-400">24 Days</span>
            <p className="text-[10px] text-[#6E6E6E]">Healthy turn benchmark is &lt; 35 days</p>
          </div>
          <div className="p-3 bg-amber-950/20 rounded-lg border border-amber-500/30 space-y-1">
            <span className="text-[10px] text-amber-300 block font-semibold">Aged Units (&gt; 45 Days)</span>
            <span className="text-base font-bold font-mono text-amber-400">4 Vehicles</span>
            <p className="text-[10px] text-[#A0A0A0]">Recommend immediate price repricing</p>
          </div>
        </div>
      </div>

      {/* ── Delivered Deals Ledger ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Deal Profitability Ledger (Delivered Units)
          </h2>
          <span className="text-[11px] text-[#A0A0A0]">Front vs Back Gross per deal</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-[rgba(255,255,255,0.06)] bg-[#0A0A0A]">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/[0.06] bg-[#0E0E0E] text-[#8C8C8C] text-[10px] uppercase font-bold tracking-wider">
                <th className="p-3">Date & Customer</th>
                <th className="p-3">Delivered Vehicle</th>
                <th className="p-3">Sale Price</th>
                <th className="p-3">Front Gross</th>
                <th className="p-3">Back F&I Gross</th>
                <th className="p-3">Total Profit</th>
                <th className="p-3">Margin %</th>
                <th className="p-3 text-right">Rep</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.04]">
              {deals.map((deal) => (
                <tr key={deal.id} className="hover:bg-white/[0.02] transition">
                  <td className="p-3">
                    <div className="font-semibold text-white">{deal.customer}</div>
                    <div className="text-[10px] text-[#6E6E6E]">{deal.date}</div>
                  </td>
                  <td className="p-3">
                    <div className="text-white">{deal.vehicle}</div>
                    <div className="text-[10px] font-mono text-[#6E6E6E]">Stock #{deal.stock}</div>
                  </td>
                  <td className="p-3 font-mono text-white">{deal.salePrice}</td>
                  <td className="p-3 font-mono text-emerald-400">{deal.frontEndGross}</td>
                  <td className="p-3 font-mono text-[#E6C85C]">{deal.backEndGross}</td>
                  <td className="p-3 font-mono font-bold text-emerald-300">{deal.totalGross}</td>
                  <td className="p-3 font-mono">{deal.margin}</td>
                  <td className="p-3 text-right text-white/80">{deal.salesperson}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
