import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Clock, ArrowRight, Car, CheckCircle2, ChevronRight, AlertCircle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';

export default function DashboardPage() {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  const { data } = useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get('/dashboard');
      return res.data.data;
    },
    initialData: {
      kpis: {
        newLeads: { value: 28, trend: '+12.5%', label: 'vs last week' },
        followUpsDue: { value: 7, trend: '3 overdue', label: 'Needs attention' },
        appointmentsToday: { value: 5, trend: 'Today', label: '2 test drives booked' },
        soldThisMonth: { value: 3, revenue: 129400, trend: '+8.4%', label: 'vs last month' },
      },
      pipelineSummary: [
        { name: 'New', count: 28, totalValue: 980000, pct: 38 },
        { name: 'Contacted', count: 19, totalValue: 645000, pct: 26 },
        { name: 'Follow-Up', count: 12, totalValue: 420000, pct: 16 },
        { name: 'Appointment', count: 9, totalValue: 315000, pct: 12 },
        { name: 'Sold', count: 3, totalValue: 129400, pct: 8 },
      ],
      recentLeads: [
        {
          _id: '1',
          customer: { firstName: 'John', lastName: 'Carter', phone: '+1 (555) 301-4492' },
          vehicle: { year: 2024, make: 'Mercedes-Benz', model: 'S-Class', trim: 'S 580' },
          source: { name: 'Website' },
          assignedUser: { firstName: 'Shane', lastName: 'Miller' },
          stage: { name: 'Follow-Up' },
          temperature: 'hot',
          lastActivity: '12m ago',
          nextAction: 'Call re: financing quote',
        },
        {
          _id: '2',
          customer: { firstName: 'Sarah', lastName: 'Jenkins', phone: '+1 (555) 849-1029' },
          vehicle: { year: 2024, make: 'Range Rover', model: 'Velar', trim: 'P400 AWD' },
          source: { name: 'Showroom Walk-in' },
          assignedUser: { firstName: 'Alex', lastName: 'Vance' },
          stage: { name: 'Appointment' },
          temperature: 'hot',
          lastActivity: '1h ago',
          nextAction: 'Test drive scheduled 2:00 PM',
        },
        {
          _id: '3',
          customer: { firstName: 'David', lastName: 'Wilson', phone: '+1 (555) 771-3320' },
          vehicle: { year: 2024, make: 'Toyota', model: 'Camry', trim: 'XSE' },
          source: { name: 'Phone Inbound' },
          assignedUser: { firstName: 'Michael', lastName: 'Brown' },
          stage: { name: 'Contacted' },
          temperature: 'warm',
          lastActivity: '3h ago',
          nextAction: 'Send trade appraisal link',
        },
      ],
      teamPerformance: [
        { name: 'Sarah Parker', assignedLeads: 14, contacted: 13, appointments: 5, sold: 2, avgSpeed: '12m', winRate: '21%' },
        { name: 'Shane Miller', assignedLeads: 8, contacted: 8, appointments: 4, sold: 1, avgSpeed: '9m', winRate: '25%' },
        { name: 'Michael Brown', assignedLeads: 11, contacted: 10, appointments: 3, sold: 1, avgSpeed: '18m', winRate: '15%' },
      ],
    },
  });

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto text-white pb-12">
      {/* ── 1. Editorial Header (Restrained & Human) ── */}
      <div className="pt-2 flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
            Good morning, {user?.firstName || 'Alex'}.
          </h1>
          <p className="text-xs text-[#8C8C8C] mt-1 font-normal">
            Saturday, August 29 • You have 7 follow-ups and 5 appointments today.
          </p>
        </div>

        <button
          onClick={() => navigate('/tasks')}
          className="text-xs font-semibold text-[#D4AF37] hover:text-[#E6C85C] flex items-center gap-1 transition-colors self-start sm:self-auto"
        >
          <span>Review today’s activity</span>
          <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
        </button>
      </div>

      {/* ── 2. Asymmetrical KPI Row (Vertical Dividers, No 4 Equal Boxes) ── */}
      <div className="bg-[#0B0B0B] border border-[rgba(255,255,255,0.06)] rounded-lg p-5">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          
          {/* Primary Dominant Metric (Left 5 cols) */}
          <div className="md:col-span-5 pr-4">
            <span className="text-[11px] font-semibold text-[#6E6E6E] uppercase tracking-wider block">
              Active Pipeline Inquiries
            </span>
            <div className="flex items-baseline gap-3 mt-1.5">
              <span className="text-4xl font-semibold text-white font-mono tracking-tight">
                28
              </span>
              <span className="text-xs font-semibold text-[#E6C85C] bg-[rgba(212,175,55,0.1)] px-2 py-0.5 rounded">
                +12.5% this week
              </span>
            </div>
            <p className="text-xs text-[#8C8C8C] mt-1">
              New customer prospects engaging with dealership lot inventory.
            </p>
          </div>

          {/* Vertical Divider (Hidden on mobile) */}
          <div className="hidden md:block w-[1px] h-14 bg-white/[0.08]" />

          {/* Secondary Stacked Metrics (Right 6 cols) */}
          <div className="md:col-span-6 grid grid-cols-3 gap-4">
            <div>
              <span className="text-[11px] font-medium text-[#8C8C8C] block">Follow-ups</span>
              <div className="text-2xl font-semibold text-white font-mono mt-1">7</div>
              <span className="text-[11px] text-[#F87171] block mt-0.5">3 overdue</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-[#8C8C8C] block">Appointments</span>
              <div className="text-2xl font-semibold text-white font-mono mt-1">5</div>
              <span className="text-[11px] text-[#8C8C8C] block mt-0.5">2 test drives</span>
            </div>

            <div>
              <span className="text-[11px] font-medium text-[#8C8C8C] block">Sold This Mo.</span>
              <div className="text-2xl font-semibold text-white font-mono mt-1">3</div>
              <span className="text-[11px] text-[#22C55E] block mt-0.5">$129k vol</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── 3. Subtle Needs-Attention Bar (No Sci-Fi Glow) ── */}
      <div className="py-2.5 px-4 bg-[#0E0E0E] border-l-2 border-[#D4AF37] border-y border-r border-[rgba(255,255,255,0.05)] rounded-r-md flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-[#D4AF37] shrink-0" />
          <span className="text-[#B4B4B4]">
            <strong className="text-white font-semibold">Action Required:</strong> 6 leads haven’t been contacted in 12+ hours.
          </span>
        </div>
        <button
          onClick={() => navigate('/leads?temperature=hot')}
          className="text-xs font-semibold text-[#D4AF37] hover:underline shrink-0"
        >
          View Inactive Leads →
        </button>
      </div>

      {/* ── 4. Split Section: Clean Horizontal Pipeline (65%) & Today's Schedule (35%) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left 65% (8 cols): Single Horizontal Pipeline Visualization */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Sales Pipeline
            </h2>
            <button
              onClick={() => navigate('/pipeline')}
              className="text-xs text-[#8C8C8C] hover:text-white transition-colors"
            >
              Open Board →
            </button>
          </div>

          <div className="bg-[#0B0B0B] border border-[rgba(255,255,255,0.06)] rounded-lg p-5 space-y-5">
            {/* Single Horizontal Multi-Stage Strip */}
            <div className="grid grid-cols-5 gap-3 text-left">
              {data?.pipelineSummary?.map((st: any) => (
                <div key={st.name} className="space-y-1">
                  <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block">
                    {st.name}
                  </span>
                  <div className="text-lg font-semibold text-white font-mono">
                    {st.count}
                  </div>
                  <div className="text-[11px] text-[#8C8C8C] font-mono">
                    ${(st.totalValue / 1000).toFixed(0)}k
                  </div>
                </div>
              ))}
            </div>

            {/* Continuous Progress Indicator Rule */}
            <div className="w-full h-1.5 bg-[#141414] rounded-full overflow-hidden flex gap-[2px]">
              <div className="h-full bg-blue-500 rounded-l" style={{ width: '38%' }} />
              <div className="h-full bg-purple-500" style={{ width: '26%' }} />
              <div className="h-full bg-[#D4AF37]" style={{ width: '16%' }} />
              <div className="h-full bg-cyan-500" style={{ width: '12%' }} />
              <div className="h-full bg-green-500 rounded-r" style={{ width: '8%' }} />
            </div>

            <div className="flex items-center justify-between text-[11px] text-[#6E6E6E] pt-1">
              <span>Total Lot Pipeline: <strong className="text-white font-mono">$2,479,400</strong></span>
              <span>71 Active Inquiries Tracked</span>
            </div>
          </div>
        </div>

        {/* Right 35% (4 cols): Today's Schedule Timeline List */}
        <div className="lg:col-span-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Today’s Schedule
            </h2>
            <button
              onClick={() => navigate('/tasks')}
              className="text-xs text-[#8C8C8C] hover:text-white transition-colors"
            >
              All Tasks
            </button>
          </div>

          <div className="bg-[#0B0B0B] border border-[rgba(255,255,255,0.06)] rounded-lg p-4 divide-y divide-[rgba(255,255,255,0.05)]">
            {[
              { time: '10:30', title: 'Call John Carter', vehicle: '2024 Mercedes S-Class', leadId: '1' },
              { time: '11:15', title: 'Follow up with Sarah', vehicle: '2024 Range Rover Velar', leadId: '2' },
              { time: '14:30', title: 'Test drive — Michael Brown', vehicle: '2024 Ford F-150', leadId: '3' },
            ].map((item, idx) => (
              <div
                key={idx}
                onClick={() => navigate(`/leads/${item.leadId}`)}
                className="py-3 first:pt-1 last:pb-1 flex items-baseline justify-between group cursor-pointer"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-semibold text-[#D4AF37]">{item.time}</span>
                    <span className="text-xs font-medium text-white group-hover:text-[#E6C85C] transition-colors">
                      {item.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#6E6E6E] pl-10 font-normal">
                    {item.vehicle}
                  </p>
                </div>
                <span className="text-[11px] text-[#6E6E6E] group-hover:text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  Open →
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── 5. Full-Width Professional CRM Recent Leads Table ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
              Recent Leads & Inquiries
            </h2>
            <p className="text-xs text-[#8C8C8C] mt-0.5 font-normal">
              Active customer conversations across lot inventory.
            </p>
          </div>
          <button
            onClick={() => navigate('/leads')}
            className="btn-secondary btn-sm"
          >
            View All 28 Leads
          </button>
        </div>

        <div className="border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden bg-[#0A0A0A]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F0F0F] text-[#6E6E6E] uppercase font-semibold text-[10px] tracking-wider border-b border-[rgba(255,255,255,0.06)]">
              <tr>
                <th className="px-4 py-2.5">Customer</th>
                <th className="px-4 py-2.5">Vehicle Interest</th>
                <th className="px-4 py-2.5">Stage</th>
                <th className="px-4 py-2.5">Source</th>
                <th className="px-4 py-2.5">Salesperson</th>
                <th className="px-4 py-2.5">Last Activity</th>
                <th className="px-4 py-2.5 text-right">Next Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {data?.recentLeads?.map((lead: any) => {
                const cust = lead.customer || {};
                const veh = lead.vehicle || {};
                const stage = lead.stage || {};
                const user = lead.assignedUser || {};
                const src = lead.source || {};

                return (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="hover:bg-white/[0.02] cursor-pointer transition-colors h-[42px]"
                  >
                    <td className="px-4 py-2.5 font-medium text-white">
                      {cust.firstName} {cust.lastName}
                      <span className="text-[11px] text-[#6E6E6E] ml-2 font-normal">{cust.phone}</span>
                    </td>
                    <td className="px-4 py-2.5 text-[#B4B4B4]">
                      {veh.year} {veh.make} {veh.model} {veh.trim}
                    </td>
                    <td className="px-4 py-2.5">
                      <span className="inline-flex items-center gap-1 text-[11px] text-[#E6C85C]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                        {stage.name || 'Follow-Up'}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-[#6E6E6E]">
                      {src.name || 'Website'}
                    </td>
                    <td className="px-4 py-2.5 text-[#B4B4B4]">
                      {user.firstName} {user.lastName}
                    </td>
                    <td className="px-4 py-2.5 text-[#6E6E6E] font-mono">
                      {lead.lastActivity || '15m ago'}
                    </td>
                    <td className="px-4 py-2.5 text-right text-white font-medium">
                      {lead.nextAction}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── 6. Compact Sales Team Performance Data ── */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">
            Team Performance
          </h2>
          <button
            onClick={() => navigate('/team')}
            className="text-xs text-[#8C8C8C] hover:text-white transition-colors"
          >
            Manage Team →
          </button>
        </div>

        <div className="border border-[rgba(255,255,255,0.06)] rounded-lg overflow-hidden bg-[#0A0A0A]">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#0F0F0F] text-[#6E6E6E] uppercase font-semibold text-[10px] tracking-wider border-b border-[rgba(255,255,255,0.06)]">
              <tr>
                <th className="px-4 py-2.5">Sales Representative</th>
                <th className="px-4 py-2.5">Assigned Leads</th>
                <th className="px-4 py-2.5">Contacted</th>
                <th className="px-4 py-2.5">Appointments</th>
                <th className="px-4 py-2.5">Units Sold</th>
                <th className="px-4 py-2.5">Avg Response Time</th>
                <th className="px-4 py-2.5 text-right">Close Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[rgba(255,255,255,0.04)]">
              {data?.teamPerformance?.map((rep: any) => (
                <tr key={rep.name} className="h-[38px] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-2 font-medium text-white">{rep.name}</td>
                  <td className="px-4 py-2 text-[#B4B4B4] font-mono">{rep.assignedLeads}</td>
                  <td className="px-4 py-2 text-[#B4B4B4] font-mono">{rep.contacted}</td>
                  <td className="px-4 py-2 text-[#B4B4B4] font-mono">{rep.appointments}</td>
                  <td className="px-4 py-2 text-white font-mono font-semibold">{rep.sold}</td>
                  <td className="px-4 py-2 text-[#22C55E] font-mono">{rep.avgSpeed}</td>
                  <td className="px-4 py-2 text-right text-[#E6C85C] font-mono font-semibold">{rep.winRate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
