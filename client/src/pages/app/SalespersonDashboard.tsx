import { useLiveQuery } from '@/hooks/useLiveQuery';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Phone,
  MessageSquare,
  Mail,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  Filter,
  AlertCircle,
  X,
  ChevronRight,
  Check,
} from 'lucide-react';
import {
  fetchSalespersonWorkspace,
  completeTask,
} from '@/services/workspaceService';
import type {
  SalespersonWorkspaceData,
  DoNextTaskItem,
  TaskOutcome,
  LostReason,
} from '@crm/shared';

export default function SalespersonDashboard() {
  const navigate = useNavigate();

  // Selected stage filter from clicking stage numbers
  const [selectedStageFilter, setSelectedStageFilter] = useState<string | null>(
    null
  );

  // Stage Customer List Drawer
  const [stageCustomersModal, setStageCustomersModal] = useState<{
    stageName: string;
    customers: Array<{
      name: string;
      vehicle: string;
      phone: string;
      stage: string;
    }>;
  } | null>(null);

  // Task Completion Modal ("What happened?")
  const [completingTask, setCompletingTask] = useState<DoNextTaskItem | null>(
    null
  );
  const [outcome, setOutcome] = useState<TaskOutcome>('spoke_with_customer');
  const [nextTaskTitle, setNextTaskTitle] = useState('');
  const [lostReason, setLostReason] = useState<LostReason>('not_interested');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const workspaceQuery = useLiveQuery(['workspace', 'salesperson'], () =>
    fetchSalespersonWorkspace()
  );
  const workspace = workspaceQuery.data;
  const loading = workspaceQuery.isPending;
  const error = workspaceQuery.error?.message;
  const loadWorkspace = async () => {
    await workspaceQuery.refetch();
  };

  const handleTaskCompleteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!completingTask) return;

    try {
      setIsSubmitting(true);
      await completeTask(completingTask.id, {
        outcome,
        nextTask: nextTaskTitle
          ? {
              type: 'follow_up',
              title: nextTaskTitle,
              dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }
          : undefined,
        lostReason:
          outcome === 'not_interested' || outcome === 'purchased_elsewhere'
            ? lostReason
            : undefined,
      });

      await loadWorkspace();

      setCompletingTask(null);
      setNextTaskTitle('');
    } catch (err: any) {
      alert('Failed to complete task: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStageCustomerClick = (stage: any) => {
    navigate(`/leads?stageId=${stage.stageId}`);
  };

  if (loading) {
    return (
      <div className="space-y-6 max-w-6xl mx-auto animate-pulse">
        <div className="h-10 bg-[#141414] rounded w-1/3" />
        <div className="h-28 bg-[#141414] rounded" />
        <div className="h-44 bg-[#141414] rounded" />
      </div>
    );
  }

  if (error || !workspace) {
    return (
      <div className="p-6 max-w-xl mx-auto bg-red-950/20 border border-red-500/30 rounded-xl text-center space-y-3">
        <AlertCircle className="w-8 h-8 text-red-400 mx-auto" />
        <h3 className="text-sm font-semibold text-white">
          Error Loading Salesperson Workspace
        </h3>
        <p className="text-xs text-[#A0A0A0]">
          {error || 'Unable to retrieve workspace data.'}
        </p>
        <button onClick={loadWorkspace} className="btn-secondary btn-sm mt-2">
          Retry
        </button>
      </div>
    );
  }

  const filteredTasks = selectedStageFilter
    ? workspace.doNextTasks.filter((t) => t.stageSlug === selectedStageFilter)
    : workspace.doNextTasks;

  const isTaskZero = workspace.tasksRemainingToday === 0;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* ── Editorial Header (§5) ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">
            Good morning, {workspace.salespersonName.split(' ')[0]}.
          </h1>
          <p className="text-xs text-[#8C8C8C] mt-1 font-normal flex items-center gap-1.5">
            {isTaskZero ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                You're caught up for today. All due tasks at zero.
              </span>
            ) : (
              <>
                You have{' '}
                <span className="text-[#E6C85C] font-semibold">
                  {workspace.tasksRemainingToday} tasks
                </span>{' '}
                to complete today.
              </>
            )}
          </p>
        </div>

        {/* Task Zero Counter Pill (§28) */}
        <div className="flex items-center gap-2 px-3 py-1.5 bg-[#121212] border border-[rgba(212,175,55,0.3)] rounded-lg">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          <span className="text-xs font-semibold text-white">
            TODAY'S TASKS:
          </span>
          <span
            className={`font-mono text-xs font-bold px-1.5 py-0.5 rounded ${
              isTaskZero
                ? 'bg-emerald-500/20 text-emerald-400'
                : 'bg-[#D4AF37]/20 text-[#E6C85C]'
            }`}
          >
            {workspace.tasksRemainingToday} remaining
          </span>
        </div>
      </div>

      {/* ── Section 1: Active Pipeline (§2 & UX Refinement) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold text-[#6E6E6E] uppercase tracking-wider">
            Active Pipeline
          </span>
          {selectedStageFilter && (
            <button
              onClick={() => setSelectedStageFilter(null)}
              className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Clear stage filter
            </button>
          )}
        </div>

        {/* 5 Horizontal Active Stages */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {workspace.activePipeline.map((stage) => {
            const isSelected = selectedStageFilter === stage.slug;
            return (
              <div
                key={stage.stageId}
                className={`p-3.5 rounded-lg border transition-all duration-150 ${
                  isSelected
                    ? 'bg-[#151515] border-[#D4AF37] ring-1 ring-[#D4AF37]/30'
                    : 'bg-[#0B0B0B] border-[rgba(255,255,255,0.06)] hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#8C8C8C] uppercase tracking-wider truncate">
                    {stage.name}
                  </span>
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: stage.color }}
                  />
                </div>

                {/* Clickable Customer Count */}
                <div
                  onClick={() => handleStageCustomerClick(stage)}
                  className="mt-2.5 cursor-pointer group"
                  title="Click to view customers in this stage"
                >
                  <div className="text-xl font-bold text-white font-mono group-hover:text-[#E6C85C] transition-colors">
                    {stage.customerCount}
                  </div>
                  <span className="text-[10px] text-[#6E6E6E] group-hover:underline">
                    customers →
                  </span>
                </div>

                {/* Clickable Tasks Due Count */}
                <div
                  onClick={() =>
                    setSelectedStageFilter(isSelected ? null : stage.slug)
                  }
                  className={`mt-2 pt-2 border-t border-[rgba(255,255,255,0.04)] flex items-center justify-between cursor-pointer group ${
                    stage.tasksDueCount > 0
                      ? 'text-[#E6C85C]'
                      : 'text-[#6E6E6E]'
                  }`}
                  title="Click to filter Do Next tasks for this stage"
                >
                  <span className="text-[11px] font-medium group-hover:underline">
                    {stage.tasksDueCount} tasks due
                  </span>
                  <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Separated Results Bar (§ UX Feedback) */}
        <div className="flex items-center justify-between p-3 bg-[#0A0A0A] border border-[rgba(255,255,255,0.04)] rounded-lg text-xs">
          <div className="flex items-center gap-2 text-[#8C8C8C]">
            <span className="text-[10px] font-bold text-[#555555] uppercase tracking-wider">
              Results:
            </span>
            <span className="text-white font-medium">
              Sold:{' '}
              <span className="font-mono text-emerald-400 font-semibold">
                {workspace.results.soldThisMonth}
              </span>{' '}
              units this month ($
              {(workspace.results.soldRevenueThisMonth / 1000).toFixed(0)}k)
            </span>
          </div>
          <div className="text-[#6E6E6E]">
            Lost:{' '}
            <span className="font-mono">{workspace.results.lostThisMonth}</span>
          </div>
        </div>
      </div>

      {/* ── Section 2: NEXT UP (Next Best Task §29) ── */}
      {workspace.nextBestTask && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-[#17140B] to-[#0E0E0E] border border-[rgba(212,175,55,0.4)] relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  Next Up
                </span>
                <span className="text-white/20">•</span>
                <span className="text-xs text-[#B8B8B8]">
                  {workspace.nextBestTask.reason}
                </span>
              </div>
              <h3 className="text-base font-semibold text-white">
                {workspace.nextBestTask.title} —{' '}
                {workspace.nextBestTask.vehicle}
              </h3>
              <p className="text-xs text-[#8C8C8C]">
                Customer:{' '}
                <span className="text-white">
                  {workspace.nextBestTask.customerName}
                </span>{' '}
                · Inquiry: {workspace.nextBestTask.inquiryTimeAgo}
              </p>
            </div>

            <button
              onClick={() => {
                const target =
                  workspace.doNextTasks.find(
                    (t) => t.id === workspace.nextBestTask?.id
                  ) || workspace.doNextTasks[0];
                if (target) setCompletingTask(target);
              }}
              className="btn-primary btn-sm px-4 py-2 self-start sm:self-auto gap-1.5 font-semibold"
            >
              <span>Start Action</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* ── Section 3: DO NEXT (§6) ── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-[#6E6E6E] uppercase tracking-wider">
            Do Next ({filteredTasks.length})
          </h2>
          <span className="text-[11px] text-[#8C8C8C]">
            Sorted by priority & urgency
          </span>
        </div>

        {filteredTasks.length === 0 ? (
          <div className="py-12 text-center rounded-xl bg-[#0B0B0B] border border-[rgba(255,255,255,0.06)] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
            <p className="text-sm font-semibold text-white">
              No tasks due in this view
            </p>
            <p className="text-xs text-[#8C8C8C]">
              {selectedStageFilter
                ? 'All tasks for this stage are completed.'
                : "You're caught up for today."}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {filteredTasks.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-lg bg-[#0C0C0C] hover:bg-[#121212] border border-[rgba(255,255,255,0.06)] hover:border-white/15 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                {/* Left Task Information */}
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded bg-[#161616] border border-white/10 flex items-center justify-center shrink-0 mt-0.5 text-[#D4AF37]">
                    {t.actionType === 'call' ? (
                      <Phone className="w-4 h-4" />
                    ) : t.actionType === 'text' ? (
                      <MessageSquare className="w-4 h-4" />
                    ) : t.actionType === 'email' ? (
                      <Mail className="w-4 h-4" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                  </div>

                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-[#E6C85C]">
                        {t.dueTime}
                      </span>
                      <span className="text-white/20">•</span>
                      <span className="text-xs font-semibold text-white group-hover:text-[#E6C85C] transition-colors">
                        {t.title}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-white/[0.04] text-[#A0A0A0]">
                        {t.stageName}
                      </span>
                    </div>

                    <p className="text-xs text-[#8C8C8C]">
                      {t.vehicle} · Last communication: {t.lastContactText}
                    </p>
                  </div>
                </div>

                {/* Right Action Trigger */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => navigate(`/leads/${t.leadId || '1'}`)}
                    className="text-xs text-[#8C8C8C] hover:text-white px-2.5 py-1.5 transition"
                  >
                    View Lead
                  </button>
                  <button
                    onClick={() => setCompletingTask(t)}
                    className="btn-primary btn-sm gap-1 text-xs"
                  >
                    <span>Start</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Task Completion Modal ("What happened?" §8) ── */}
      {completingTask && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[rgba(212,175,55,0.3)] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Complete Task
                </h3>
                <p className="text-xs text-[#8C8C8C]">
                  {completingTask.title} · {completingTask.customerName}
                </p>
              </div>
              <button
                onClick={() => setCompletingTask(null)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Customer Summary */}
            <div className="p-3 bg-[#161616] rounded-lg text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-[#8C8C8C]">Vehicle:</span>
                <span className="text-white font-medium">
                  {completingTask.vehicle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8C8C]">Current Stage:</span>
                <span className="text-[#E6C85C]">
                  {completingTask.stageName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8C8C8C]">Last Note:</span>
                <span className="text-white truncate max-w-[200px]">
                  {completingTask.lastMessageText}
                </span>
              </div>
            </div>

            {/* Question: What happened? */}
            <form onSubmit={handleTaskCompleteSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider mb-2">
                  What happened?
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  {[
                    { id: 'spoke_with_customer', label: 'Spoke With Customer' },
                    {
                      id: 'appointment_set',
                      label: 'Appointment Set (Auto-advance stage)',
                    },
                    { id: 'no_answer', label: 'No Answer' },
                    { id: 'follow_up_needed', label: 'Follow-Up Needed' },
                    { id: 'moved_to_next_stage', label: 'Move to Next Stage' },
                    {
                      id: 'not_interested',
                      label: 'Customer Not Interested (Mark Lost)',
                    },
                    {
                      id: 'purchased_elsewhere',
                      label: 'Customer Purchased Elsewhere',
                    },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                        outcome === opt.id
                          ? 'bg-[#1A1A1A] border-[#D4AF37] text-white'
                          : 'bg-[#121212] border-white/[0.06] text-[#A0A0A0] hover:border-white/20'
                      }`}
                    >
                      <input
                        type="radio"
                        name="taskOutcome"
                        value={opt.id}
                        checked={outcome === opt.id}
                        onChange={() => setOutcome(opt.id as TaskOutcome)}
                        className="accent-[#D4AF37]"
                      />
                      <span>{opt.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Lost Reason if customer exited */}
              {(outcome === 'not_interested' ||
                outcome === 'purchased_elsewhere') && (
                <div className="space-y-1.5 p-3 bg-red-950/20 border border-red-500/30 rounded-lg">
                  <label className="block text-[10px] font-bold text-red-300 uppercase tracking-wider">
                    Select Lost Reason:
                  </label>
                  <select
                    value={lostReason}
                    onChange={(e) =>
                      setLostReason(e.target.value as LostReason)
                    }
                    className="w-full bg-[#111111] border border-red-500/30 rounded p-2 text-xs text-white"
                  >
                    <option value="not_interested">Not Interested</option>
                    <option value="purchased_elsewhere">
                      Purchased Elsewhere
                    </option>
                    <option value="price">Price / Payment</option>
                    <option value="financing">Financing Declined</option>
                    <option value="vehicle_unavailable">
                      Vehicle Unavailable
                    </option>
                    <option value="no_response">No Response</option>
                  </select>
                </div>
              )}

              {/* Optional Next Action Scheduling */}
              <div>
                <label className="block text-[11px] font-bold text-[#8C8C8C] uppercase tracking-wider mb-1">
                  Recommended Next Action (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Call back at 2:00 PM re: financing approval"
                  value={nextTaskTitle}
                  onChange={(e) => setNextTaskTitle(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded-md p-2 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setCompletingTask(null)}
                  className="btn-secondary btn-sm"
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary btn-sm font-semibold gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Saving...' : 'Record Outcome'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Stage Customers Drawer / Modal ── */}
      {stageCustomersModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-white/10 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">
                  Customers in {stageCustomersModal.stageName}
                </h3>
                <p className="text-xs text-[#8C8C8C]">Assigned opportunities</p>
              </div>
              <button
                onClick={() => setStageCustomersModal(null)}
                className="text-[#8C8C8C] hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {stageCustomersModal.customers.map((c, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setStageCustomersModal(null);
                    navigate('/leads/1');
                  }}
                  className="p-3 bg-[#141414] hover:bg-[#1A1A1A] border border-white/[0.06] rounded-lg flex items-center justify-between cursor-pointer transition"
                >
                  <div>
                    <h4 className="text-xs font-semibold text-white">
                      {c.name}
                    </h4>
                    <p className="text-[11px] text-[#8C8C8C]">{c.vehicle}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-[#D4AF37]">
                      {c.phone}
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-[#6E6E6E]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
