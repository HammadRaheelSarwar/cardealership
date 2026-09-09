import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Sparkles, AlertTriangle, CheckCircle2, Phone, MessageSquare,
  Mail, Calendar, ArrowRight, UserCheck, ShieldAlert, Clock, ChevronRight
} from 'lucide-react';
import { fetchManagerWorkspace } from '@/services/workspaceService';
import type { ManagerWorkspaceData, CoachingInsight, SalespersonPerformanceMetric } from '@crm/shared';

export default function ActivityCoachingPage() {
  const [workspace, setWorkspace] = useState<ManagerWorkspaceData | null>(null);
  const [selectedRep, setSelectedRep] = useState<SalespersonPerformanceMetric | null>(null);
  const [coachingNotes, setCoachingNotes] = useState<Record<string, string>>({
    'rep-sarah': 'Focus on asking for the showroom visit on the 2nd phone call instead of emailing price quotes.',
    'rep-michael': 'Clear 12 overdue tasks before starting outbound prospecting.',
  });
  const [activeNoteText, setActiveNoteText] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await fetchManagerWorkspace('mtd');
        setWorkspace(data);
        if (data.salespeople.length > 0) {
          setSelectedRep(data.salespeople[0]);
          setActiveNoteText(coachingNotes[data.salespeople[0].id] || '');
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadData();
  }, []);

  const handleSelectRep = (rep: SalespersonPerformanceMetric) => {
    setSelectedRep(rep);
    setActiveNoteText(coachingNotes[rep.id] || '');
  };

  const handleSaveCoachingNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRep) return;
    setCoachingNotes((prev) => ({ ...prev, [selectedRep.id]: activeNoteText }));
    alert(`Coaching directive saved for ${selectedRep.name}`);
  };

  if (!workspace) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-10 bg-[#141414] rounded w-1/3" />
        <div className="h-44 bg-[#141414] rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16">
      {/* ── Page Header ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#D4AF37]" />
            <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
              Activity & Coaching Intelligence
            </h1>
          </div>
          <p className="text-xs text-[#8C8C8C] mt-1">
            Diagnostic coaching view: identify behavioral bottlenecks, activity discipline, and phone-to-showroom conversion gaps.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#141208] border border-[#D4AF37]/30 rounded-lg text-xs">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-[#E6C85C] font-semibold">Manager Objective:</span>
          <span className="text-white">Coach to behavior, not just quota</span>
        </div>
      </div>

      {/* ── Section 1: Active Coaching Directives & Diagnostics (§15) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#6E6E6E] uppercase tracking-wider">
            Diagnostic Coaching Issues Identified ({workspace.coachingInsights.length})
          </span>
          <span className="text-[11px] text-[#A0A0A0]">Derived from real-time activity and stage conversions</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {workspace.coachingInsights.map((insight) => (
            <div
              key={insight.id}
              className="p-4 rounded-xl bg-[#0D0D0D] border border-[rgba(212,175,55,0.3)] space-y-3 relative group"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#181818] border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#E6C85C]">
                    {insight.salespersonName.charAt(0)}
                  </div>
                  <span className="text-xs font-bold text-white">{insight.salespersonName}</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/[0.04] text-[#E6C85C]">
                  {insight.metricHighlight}
                </span>
              </div>

              <div className="p-2.5 rounded bg-[#141414] border border-white/[0.04]">
                <span className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-wider block mb-1">
                  Manager Diagnostic Insight:
                </span>
                <p className="text-xs font-semibold text-white">"{insight.insight}"</p>
              </div>

              <div className="text-[11px] text-[#A0A0A0] space-y-1">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider block">
                  Prescribed Coaching Action:
                </span>
                <p className="leading-relaxed">{insight.actionRecommendation}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Section 2: 1-on-1 Salesperson Activity Deep-Dive & Action Plan ── */}
      <div className="space-y-3">
        <span className="text-[11px] font-bold text-[#6E6E6E] uppercase tracking-wider block">
          Individual Salesperson Activity Breakdown & 1-on-1 Directives
        </span>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Rep Selection List */}
          <div className="lg:col-span-4 space-y-2">
            {workspace.salespeople.map((rep) => {
              const isSelected = selectedRep?.id === rep.id;
              return (
                <div
                  key={rep.id}
                  onClick={() => handleSelectRep(rep)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-[#161616] border-[#D4AF37] ring-1 ring-[#D4AF37]/30'
                      : 'bg-[#0B0B0B] border-[rgba(255,255,255,0.06)] hover:border-white/15'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-white">{rep.name}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      rep.taskCompletionRate >= 85 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                    }`}>
                      {rep.taskCompletionRate}% completion
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 mt-2 pt-2 border-t border-white/[0.04] text-[11px]">
                    <div>
                      <span className="text-[10px] text-[#6E6E6E] block">Overdue</span>
                      <span className="font-mono text-red-400 font-semibold">{rep.overdueTasks}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6E6E6E] block">Appts Today</span>
                      <span className="font-mono text-cyan-400">{rep.appointmentsToday}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-[#6E6E6E] block">Conv %</span>
                      <span className="font-mono text-[#E6C85C]">{rep.conversionRate}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Detailed Rep Coaching Workspace */}
          {selectedRep && (
            <div className="lg:col-span-8 p-5 rounded-xl bg-[#0B0B0B] border border-[rgba(255,255,255,0.06)] space-y-5">
              <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
                <div>
                  <h3 className="text-base font-semibold text-white">{selectedRep.name} — Activity Audit</h3>
                  <p className="text-xs text-[#8C8C8C]">Daily execution volume and show rate efficiency</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-mono text-[#8C8C8C] uppercase block">Show Rate</span>
                  <span className="text-base font-mono font-bold text-[#E6C85C]">{selectedRep.showRate}%</span>
                </div>
              </div>

              {/* Activity Volume Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#121212] border border-white/[0.04] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#8C8C8C] text-[11px]">
                    <Phone className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>Calls Logged</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">{selectedRep.callsMade}</div>
                  <p className="text-[10px] text-[#6E6E6E]">Outbound dials</p>
                </div>

                <div className="p-3 rounded-lg bg-[#121212] border border-white/[0.04] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#8C8C8C] text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
                    <span>SMS Sent</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">{selectedRep.textsSent}</div>
                  <p className="text-[10px] text-[#6E6E6E]">Direct texts</p>
                </div>

                <div className="p-3 rounded-lg bg-[#121212] border border-white/[0.04] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#8C8C8C] text-[11px]">
                    <Mail className="w-3.5 h-3.5 text-purple-400" />
                    <span>Emails Sent</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-white">{selectedRep.emailsSent}</div>
                  <p className="text-[10px] text-[#6E6E6E]">Quotes & window stickers</p>
                </div>

                <div className="p-3 rounded-lg bg-[#121212] border border-white/[0.04] space-y-1">
                  <div className="flex items-center gap-1.5 text-[#8C8C8C] text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                    <span>Tasks Overdue</span>
                  </div>
                  <div className="text-xl font-mono font-bold text-red-400">{selectedRep.overdueTasks}</div>
                  <p className="text-[10px] text-[#6E6E6E]">Requires clearing</p>
                </div>
              </div>

              {/* 1-on-1 Coaching Directive Form */}
              <form onSubmit={handleSaveCoachingNote} className="space-y-3 pt-2">
                <label className="block text-xs font-bold text-[#D4AF37] uppercase tracking-wider">
                  Manager 1-on-1 Coaching Directive for {selectedRep.name}
                </label>
                <textarea
                  rows={3}
                  value={activeNoteText}
                  onChange={(e) => setActiveNoteText(e.target.value)}
                  placeholder="Set weekly behavior focus (e.g. Stop quoting monthly payments over SMS before securing showroom appointment)..."
                  className="w-full bg-[#141414] border border-white/10 rounded-lg p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#D4AF37]"
                />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#6E6E6E]">
                    Directives appear in salesperson daily priority briefing.
                  </span>
                  <button type="submit" className="btn-primary btn-sm font-semibold">
                    Save Directive
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
