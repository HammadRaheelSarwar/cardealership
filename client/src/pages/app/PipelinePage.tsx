import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Search, ArrowRight, Car, Clock, ChevronRight
} from 'lucide-react';

interface PipelineLead {
  id: string;
  customerName: string;
  vehicle: string;
  value: number;
  source: string;
  salesperson: string;
  temperature: 'hot' | 'warm' | 'cold';
  stage: string;
  nextFollowUp: string;
}

const STAGES = [
  { name: 'New', count: 28, value: 980000 },
  { name: 'Contacted', count: 19, value: 645000 },
  { name: 'Follow-Up', count: 12, value: 420000 },
  { name: 'Appointment', count: 9, value: 315000 },
  { name: 'Negotiation', count: 5, value: 195000 },
  { name: 'Sold', count: 3, value: 129400 },
];

export default function PipelinePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemperature, setSelectedTemperature] = useState<string>('all');

  const [leads, setLeads] = useState<PipelineLead[]>([
    {
      id: '1',
      customerName: 'John Carter',
      vehicle: '2024 Mercedes-Benz S 580',
      value: 114500,
      source: 'Website',
      salesperson: 'Shane Miller',
      temperature: 'hot',
      stage: 'Follow-Up',
      nextFollowUp: 'Today 2:00 PM',
    },
    {
      id: '2',
      customerName: 'Sarah Jenkins',
      vehicle: '2024 Range Rover Velar',
      value: 79200,
      source: 'Showroom Walk-in',
      salesperson: 'Alex Vance',
      temperature: 'hot',
      stage: 'Appointment',
      nextFollowUp: 'Saturday 2:00 PM',
    },
    {
      id: '3',
      customerName: 'David Wilson',
      vehicle: '2024 Toyota Camry XSE',
      value: 34900,
      source: 'Phone Inbound',
      salesperson: 'Michael Brown',
      temperature: 'warm',
      stage: 'Contacted',
      nextFollowUp: 'Friday 4:00 PM',
    },
    {
      id: '4',
      customerName: 'Lisa Hernandez',
      vehicle: '2024 Honda CR-V Touring',
      value: 38500,
      source: 'AutoTrader',
      salesperson: 'Shane Miller',
      temperature: 'warm',
      stage: 'New',
      nextFollowUp: 'Immediate Call',
    },
    {
      id: '5',
      customerName: 'Robert Johnson',
      vehicle: '2024 Ford F-150 Lariat',
      value: 62400,
      source: 'Website',
      salesperson: 'Sarah Parker',
      temperature: 'hot',
      stage: 'Negotiation',
      nextFollowUp: 'Appraise trade',
    },
    {
      id: '6',
      customerName: 'Jessica Taylor',
      vehicle: '2024 Porsche Macan GTS',
      value: 86500,
      source: 'Referral',
      salesperson: 'Shane Miller',
      temperature: 'hot',
      stage: 'Sold',
      nextFollowUp: 'Delivery Complete',
    },
  ]);

  const filteredLeads = leads.filter((l) => {
    const matchesSearch =
      l.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      l.vehicle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTemp = selectedTemperature === 'all' || l.temperature === selectedTemperature;
    return matchesSearch && matchesTemp;
  });

  return (
    <div className="space-y-6 text-white max-w-7xl mx-auto pb-12">
      {/* ── Editorial Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[rgba(255,255,255,0.06)] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Sales Pipeline
          </h1>
          <p className="text-xs text-[#8C8C8C] mt-0.5 font-normal">
            Track deal progression and forecasted gross revenue across inventory stages.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#555555]" />
            <input
              type="text"
              placeholder="Filter deals or vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#0F0F0F] border border-white/10 rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#D4AF37]"
            />
          </div>

          <button
            onClick={() => navigate('/leads')}
            className="btn-primary btn-sm gap-1"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Deal</span>
          </button>
        </div>
      </div>

      {/* ── Single Clean Horizontal Visualization (§12) ── */}
      <div className="bg-[#0B0B0B] border border-[rgba(255,255,255,0.06)] rounded-lg p-4 space-y-3">
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
          {STAGES.map((st) => (
            <div key={st.name} className="space-y-0.5">
              <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block">
                {st.name}
              </span>
              <div className="text-base font-semibold text-white font-mono">
                {st.count} <span className="text-xs text-[#8C8C8C] font-normal">deals</span>
              </div>
              <div className="text-[11px] text-[#A0A0A0] font-mono">
                ${(st.value / 1000).toFixed(0)}k
              </div>
            </div>
          ))}
        </div>

        {/* Continuous progress rule */}
        <div className="w-full h-1 bg-[#141414] rounded-full overflow-hidden flex gap-[2px]">
          <div className="h-full bg-blue-500 rounded-l" style={{ width: '38%' }} />
          <div className="h-full bg-purple-500" style={{ width: '26%' }} />
          <div className="h-full bg-[#D4AF37]" style={{ width: '16%' }} />
          <div className="h-full bg-cyan-500" style={{ width: '12%' }} />
          <div className="h-full bg-orange-500" style={{ width: '5%' }} />
          <div className="h-full bg-green-500 rounded-r" style={{ width: '3%' }} />
        </div>
      </div>

      {/* ── Restrained Kanban Board (Horizontal Scrolling Flexbox) ── */}
      <div className="flex items-start gap-3 overflow-x-auto pb-6 pt-1">
        {STAGES.map((stage) => {
          const stageLeads = filteredLeads.filter((l) => l.stage === stage.name);
          return (
            <div
              key={stage.name}
              className="bg-[#090909] border border-[rgba(255,255,255,0.06)] rounded-lg p-3 w-[220px] shrink-0 space-y-2.5"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-2 border-b border-[rgba(255,255,255,0.04)] px-1">
                <span className="text-xs font-semibold text-white">{stage.name}</span>
                <span className="text-[10px] font-mono text-[#6E6E6E] bg-white/[0.04] px-1.5 py-0.5 rounded">
                  {stageLeads.length}
                </span>
              </div>

              {/* Lead Cards (Compact, No bulky borders) */}
              <div className="space-y-2">
                {stageLeads.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-[#555555]">
                    No active deals
                  </div>
                ) : (
                  stageLeads.map((l) => (
                    <div
                      key={l.id}
                      onClick={() => navigate(`/leads/${l.id}`)}
                      className="p-2.5 rounded bg-[#111111] hover:bg-[#161616] border border-[rgba(255,255,255,0.06)] transition-colors cursor-pointer space-y-1.5"
                    >
                      <div className="flex items-baseline justify-between">
                        <span className="text-xs font-semibold text-white truncate max-w-[120px]">
                          {l.customerName}
                        </span>
                        <span className="text-[11px] font-mono font-semibold text-[#E6C85C]">
                          ${(l.value / 1000).toFixed(0)}k
                        </span>
                      </div>

                      <p className="text-[11px] text-[#8C8C8C] leading-snug line-clamp-1">
                        {l.vehicle}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-[#6E6E6E] pt-1 border-t border-[rgba(255,255,255,0.04)]">
                        <span>{l.salesperson.split(' ')[0]}</span>
                        <span className="text-[#A0A0A0]">{l.nextFollowUp}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
