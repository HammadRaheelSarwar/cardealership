import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Phone, MessageSquare, Mail, Calendar, Sparkles,
  Car, Copy, Send, CheckCircle2, Check, X, DollarSign, XCircle, AlertTriangle
} from 'lucide-react';
import api from '@/services/api';
import { completeTask, markLeadSold, markLeadLost } from '@/services/workspaceService';
import type { TaskOutcome, LostReason } from '@crm/shared';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [composerTab, setComposerTab] = useState<'sms' | 'email' | 'note'>('sms');
  const [messageContent, setMessageContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [copiedVin, setCopiedVin] = useState(false);

  // Modals state
  const [showTaskCompleteModal, setShowTaskCompleteModal] = useState(false);
  const [showLostModal, setShowLostModal] = useState(false);
  const [showSoldModal, setShowSoldModal] = useState(false);

  // Task complete state
  const [outcome, setOutcome] = useState<TaskOutcome>('spoke_with_customer');
  const [nextActionNote, setNextActionNote] = useState('');
  const [lostReasonChoice, setLostReasonChoice] = useState<LostReason>('not_interested');

  // Sold modal state
  const [soldValue, setSoldValue] = useState('34900');
  const [soldGross, setSoldGross] = useState('2800');

  const { data: lead, refetch } = useQuery({
    queryKey: ['lead', id],
    queryFn: async () => {
      try {
        const res = await api.get(`/leads/${id}`);
        return res.data.data.lead;
      } catch (err) {
        return {
          _id: id || '1',
          customer: {
            firstName: 'John',
            lastName: 'Carter',
            phone: '+1 (555) 301-4492',
            email: 'john.carter@gmail.com',
            location: 'Austin, TX',
            preferredContactMethod: 'SMS',
          },
          vehicle: {
            year: 2024,
            make: 'Toyota',
            model: 'Camry',
            trim: 'XSE V6',
            price: 36120,
            vin: '4T1B11HK5RU109281',
            stockNumber: 'P24-101',
            mileage: '12 mi',
          },
          stage: { name: 'Contacted', slug: 'contacted' },
          status: 'open',
          temperature: 'hot',
          assignedUser: { firstName: 'Sarah', lastName: 'Parker' },
          nextAction: 'Call customer today at 11:00 AM re: vehicle test drive',
          lastContact: 'Yesterday 4:15 PM',
          lastMessage: 'Can I come see it tomorrow?',
        };
      }
    },
  });

interface TimelineItem {
  id: number;
  time: string;
  event: string;
  type: string;
  sender?: string;
  content?: string;
}

  const [currentStageName, setCurrentStageName] = useState('Contacted');
  const [currentNextAction, setCurrentNextAction] = useState(
    'Call customer today at 11:00 AM re: vehicle test drive'
  );

  const [timeline, setTimeline] = useState<TimelineItem[]>([
    { id: 1, time: '10:04 AM', event: 'Lead created via Website Form', type: 'system' },
    {
      id: 2,
      time: '10:07 AM',
      event: 'SMS sent to customer',
      sender: 'Sarah Parker',
      content: 'Hi John, thanks for your inquiry on the 2024 Toyota Camry XSE! When would you like to take it for a spin?',
      type: 'outbound',
    },
    {
      id: 3,
      time: '10:15 AM',
      event: 'SMS received from customer',
      sender: 'John Carter',
      content: 'Can I come see it tomorrow afternoon around 2 PM?',
      type: 'inbound',
    },
  ]);

  const handleSend = () => {
    if (!messageContent.trim()) return;
    setTimeline((prev) => [
      ...prev,
      {
        id: Date.now(),
        time: 'Just now',
        event: `${composerTab.toUpperCase()} sent`,
        sender: 'You',
        content: messageContent,
        type: 'outbound',
      },
    ]);
    setMessageContent('');
  };

  const copyVin = () => {
    if (lead?.vehicle?.vin) {
      navigator.clipboard.writeText(lead.vehicle.vin);
      setCopiedVin(true);
      setTimeout(() => setCopiedVin(false), 2000);
    }
  };

  const handleTaskComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await completeTask('task-1', {
        outcome,
        nextTask: nextActionNote
          ? {
              type: 'follow_up',
              title: nextActionNote,
              dueAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            }
          : undefined,
        lostReason: outcome === 'not_interested' || outcome === 'purchased_elsewhere' ? lostReasonChoice : undefined,
      });

      if (outcome === 'appointment_set') {
        setCurrentStageName('Appointment Set');
        setCurrentNextAction('Confirm appointment 2 hours before scheduled test drive');
      } else if (outcome === 'moved_to_next_stage') {
        setCurrentStageName('Appointment Set');
      } else if (outcome === 'not_interested' || outcome === 'purchased_elsewhere') {
        setCurrentStageName('Lost');
        setCurrentNextAction('Deal exited: Customer not interested');
      }

      setTimeline((prev) => [
        ...prev,
        {
          id: Date.now(),
          time: 'Just now',
          event: `Task completed: ${outcome.replace(/_/g, ' ')}`,
          sender: 'Sarah Parker',
          content: nextActionNote ? `Next step scheduled: ${nextActionNote}` : undefined,
          type: 'system',
        },
      ]);

      setShowTaskCompleteModal(false);
      setNextActionNote('');
    } catch (err: any) {
      alert('Error completing task: ' + err.message);
    }
  };

  const handleMarkSold = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await markLeadSold(id || '1', {
        saleValue: Number(soldValue) || 34900,
        grossProfit: Number(soldGross) || 2800,
      });
      setCurrentStageName('Sold');
      setCurrentNextAction('Deal Completed — Vehicle Sold.');
      setTimeline((prev) => [
        ...prev,
        {
          id: Date.now(),
          time: 'Just now',
          event: `Vehicle Sold for $${Number(soldValue).toLocaleString()}`,
          sender: 'Sarah Parker',
          content: `Gross profit recorded: $${Number(soldGross).toLocaleString()}. Follow-ups cleared.`,
          type: 'system',
        },
      ]);
      setShowSoldModal(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const handleMarkLost = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await markLeadLost(id || '1', {
        lostReason: lostReasonChoice,
      });
      setCurrentStageName('Lost');
      setCurrentNextAction(`Deal closed: ${lostReasonChoice.replace(/_/g, ' ')}`);
      setTimeline((prev) => [
        ...prev,
        {
          id: Date.now(),
          time: 'Just now',
          event: `Lead marked Lost: ${lostReasonChoice.replace(/_/g, ' ')}`,
          sender: 'Sarah Parker',
          type: 'system',
        },
      ]);
      setShowLostModal(false);
    } catch (err: any) {
      alert('Error: ' + err.message);
    }
  };

  const cust = lead?.customerId || lead?.customer || {
    firstName: 'John',
    lastName: 'Carter',
    phone: '+1 (555) 301-4492',
    email: 'john.carter@gmail.com',
    location: 'Austin, TX',
    preferredContactMethod: 'SMS',
  };

  const veh = lead?.vehicleId || lead?.vehicle || {
    year: 2024,
    make: 'Toyota',
    model: 'Camry',
    trim: 'XSE',
    price: 36120,
    vin: '4T1B11HK5RU109281',
    stockNumber: 'P24-101',
    mileage: '12 mi',
  };

  const assigned = lead?.assignedUserId || lead?.assignedUser || { firstName: 'Sarah', lastName: 'Parker' };

  return (
    <div className="max-w-6xl mx-auto text-white space-y-6 pb-16">
      {/* ── Top Navigation Breadcrumb ── */}
      <button
        onClick={() => navigate(-1)}
        className="text-xs text-[#8C8C8C] hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back</span>
      </button>

      {/* ── Editorial Header (§31) ── */}
      <div className="border-b border-[rgba(255,255,255,0.06)] pb-5">
        <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-semibold text-white tracking-tight">
              {cust.firstName} {cust.lastName}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-[#8C8C8C]">
              <span className="text-white font-medium">
                {veh.year} {veh.make} {veh.model} {veh.trim}
              </span>
              <span className="text-white/20">•</span>
              <span className="inline-flex items-center gap-1 text-[#E6C85C]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                ● {currentStageName}
              </span>
              <span className="text-white/20">•</span>
              <span>Assigned to {assigned.firstName} {assigned.lastName}</span>
            </div>
          </div>

          {/* Quick Actions (Call, Text, Email, Appt, Mark Lost, Mark Sold) */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setComposerTab('sms')}
              className="btn-secondary btn-sm"
            >
              <MessageSquare className="w-3.5 h-3.5 text-[#8C8C8C]" />
              <span>Text</span>
            </button>
            <button
              onClick={() => setComposerTab('email')}
              className="btn-secondary btn-sm"
            >
              <Mail className="w-3.5 h-3.5 text-[#8C8C8C]" />
              <span>Email</span>
            </button>
            <a
              href={`tel:${cust.phone}`}
              className="btn-secondary btn-sm"
            >
              <Phone className="w-3.5 h-3.5 text-[#8C8C8C]" />
              <span>Call</span>
            </a>
            <button
              onClick={() => navigate('/appointments')}
              className="btn-secondary btn-sm"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Appt</span>
            </button>

            <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />

            {/* Sold & Lost Action Buttons (§32, §33) */}
            <button
              onClick={() => setShowSoldModal(true)}
              className="btn-primary btn-sm text-xs font-semibold gap-1 bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Mark Sold</span>
            </button>
            <button
              onClick={() => setShowLostModal(true)}
              className="btn-secondary btn-sm text-xs text-red-400 hover:text-red-300 hover:bg-red-500/10 border-red-500/30"
            >
              <XCircle className="w-3.5 h-3.5" />
              <span>Mark Lost</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Task-First NEXT TASK Banner (§7, §31) ── */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-[#141208] to-[#0D0D0D] border border-[rgba(212,175,55,0.35)] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-wider flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              Current Task Due
            </span>
            <span className="text-white/20">•</span>
            <span className="text-xs text-[#A0A0A0]">Today</span>
          </div>
          <h3 className="text-sm font-semibold text-white">
            {currentNextAction}
          </h3>
          <p className="text-xs text-[#8C8C8C]">
            Vehicle: <span className="text-white">{veh.year} {veh.make} {veh.model}</span> · Last contact: Yesterday 4:15 PM
          </p>
        </div>

        <button
          onClick={() => setShowTaskCompleteModal(true)}
          className="btn-primary btn-sm px-4 py-2 self-start sm:self-auto gap-1.5 font-semibold"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Complete Task</span>
        </button>
      </div>

      {/* ── Workspace 65 / 35 Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ── LEFT 65% (8 cols): Conversation Timeline & Composer ── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
            <h2 className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wider">
              Communication Timeline
            </h2>
            <span className="text-xs text-[#6E6E6E]">Timestamped log</span>
          </div>

          {/* Chronological Stream */}
          <div className="space-y-4">
            {timeline.map((item) => (
              <div key={item.id} className="text-xs space-y-1">
                <div className="flex items-baseline gap-2 text-[#6E6E6E]">
                  <span className="font-mono text-[11px] text-[#8C8C8C]">{item.time}</span>
                  <span className="text-white font-medium">{item.event}</span>
                  {item.sender && <span>by {item.sender}</span>}
                </div>

                {item.content && (
                  <div
                    className={`p-3 rounded-md border text-xs max-w-xl ${
                      item.type === 'inbound'
                        ? 'bg-[#141414] border-white/10 text-white'
                        : item.type === 'outbound'
                        ? 'bg-[#0E0E0E] border-white/[0.06] text-[#D0D0D0]'
                        : 'bg-[#111111] border-white/[0.04] text-[#8C8C8C]'
                    }`}
                  >
                    {item.content}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Minimalist Message Composer */}
          <div className="pt-4 border-t border-[rgba(255,255,255,0.06)] space-y-3">
            <div className="flex items-center gap-4 text-xs font-semibold text-[#6E6E6E]">
              <button
                onClick={() => setComposerTab('sms')}
                className={`pb-1 border-b-2 transition-colors ${
                  composerTab === 'sms' ? 'border-[#D4AF37] text-white' : 'border-transparent hover:text-white'
                }`}
              >
                Send SMS
              </button>
              <button
                onClick={() => setComposerTab('email')}
                className={`pb-1 border-b-2 transition-colors ${
                  composerTab === 'email' ? 'border-[#D4AF37] text-white' : 'border-transparent hover:text-white'
                }`}
              >
                Send Email
              </button>
              <button
                onClick={() => setComposerTab('note')}
                className={`pb-1 border-b-2 transition-colors ${
                  composerTab === 'note' ? 'border-[#D4AF37] text-white' : 'border-transparent hover:text-white'
                }`}
              >
                Internal Note
              </button>
            </div>

            {composerTab === 'email' && (
              <input
                type="text"
                placeholder="Email Subject..."
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-md p-2.5 text-xs text-white"
              />
            )}

            <div className="space-y-2">
              <textarea
                rows={3}
                placeholder={
                  composerTab === 'sms'
                    ? 'Write SMS message...'
                    : composerTab === 'email'
                    ? 'Write email to customer...'
                    : 'Log internal team note...'
                }
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                className="w-full bg-[#111111] border border-white/10 rounded-md p-3 text-xs text-white placeholder-[#555555] focus:outline-none focus:border-[#D4AF37]"
              />

              <div className="flex items-center justify-between">
                <button
                  onClick={() =>
                    setMessageContent(
                      'Hi John, the 2024 Camry XSE is ready for your test drive tomorrow at 2:00 PM. Should I pull it up front for you?'
                    )
                  }
                  className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Insert appointment confirmation</span>
                </button>

                <button onClick={handleSend} className="btn-primary btn-sm gap-1">
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT 35% (4 cols): Customer Dossier & Vehicle Context ── */}
        <div className="lg:col-span-4 space-y-6">
          {/* Customer Information */}
          <div className="space-y-2 border-b border-[rgba(255,255,255,0.06)] pb-5">
            <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block">
              Customer Details
            </span>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between py-0.5">
                <span className="text-[#8C8C8C]">Phone</span>
                <a href={`tel:${cust.phone}`} className="text-white hover:text-[#D4AF37] font-mono">
                  {cust.phone}
                </a>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#8C8C8C]">Email</span>
                <span className="text-white truncate max-w-[170px]">{cust.email}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#8C8C8C]">Location</span>
                <span className="text-white">{cust.location}</span>
              </div>
              <div className="flex justify-between py-0.5">
                <span className="text-[#8C8C8C]">Preferred</span>
                <span className="text-white">{cust.preferredContactMethod}</span>
              </div>
            </div>
          </div>

          {/* Vehicle Interest Dossier */}
          <div className="space-y-3 border-b border-[rgba(255,255,255,0.06)] pb-5">
            <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block">
              Vehicle Interest
            </span>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-white text-sm">
                  {veh.year} {veh.make} {veh.model} {veh.trim}
                </span>
                <span className="text-sm font-bold text-[#E6C85C] font-mono">
                  ${veh.price?.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between py-1 bg-white/[0.02] px-2 rounded">
                <span className="text-[#8C8C8C] text-[11px]">VIN: {veh.vin}</span>
                <button
                  onClick={copyVin}
                  className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1"
                >
                  {copiedVin ? (
                    <>
                      <CheckCircle2 className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex justify-between text-[11px] text-[#6E6E6E]">
                <span>Stock: #{veh.stockNumber}</span>
                <span>Odometer: {veh.mileage}</span>
              </div>
            </div>
          </div>

          {/* Assigned & Stage Status */}
          <div className="space-y-2 text-xs">
            <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block">
              Pipeline Status
            </span>
            <div className="flex justify-between">
              <span className="text-[#8C8C8C]">Assigned Rep:</span>
              <span className="text-white font-medium">{assigned.firstName} {assigned.lastName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8C8C8C]">Current Stage:</span>
              <span className="text-[#E6C85C] font-semibold">{currentStageName}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Task Complete Modal ("What happened?" §8) ── */}
      {showTaskCompleteModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-[rgba(212,175,55,0.3)] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-white">Task Completion</h3>
                <p className="text-xs text-[#8C8C8C]">What happened with {cust.firstName} {cust.lastName}?</p>
              </div>
              <button
                onClick={() => setShowTaskCompleteModal(false)}
                className="text-[#8C8C8C] hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTaskComplete} className="space-y-3">
              <div className="space-y-1.5">
                {[
                  { id: 'spoke_with_customer', label: 'Spoke With Customer' },
                  { id: 'appointment_set', label: 'Appointment Set (Auto-advance stage)' },
                  { id: 'no_answer', label: 'No Answer' },
                  { id: 'follow_up_needed', label: 'Follow-Up Needed' },
                  { id: 'moved_to_next_stage', label: 'Move to Next Stage' },
                  { id: 'not_interested', label: 'Customer Not Interested (Mark Lost)' },
                  { id: 'purchased_elsewhere', label: 'Customer Purchased Elsewhere' },
                ].map((opt) => (
                  <label
                    key={opt.id}
                    className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs cursor-pointer transition ${
                      outcome === opt.id
                        ? 'bg-[#181818] border-[#D4AF37] text-white'
                        : 'bg-[#111111] border-white/[0.06] text-[#A0A0A0] hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="leadTaskOutcome"
                      value={opt.id}
                      checked={outcome === opt.id}
                      onChange={() => setOutcome(opt.id as TaskOutcome)}
                      className="accent-[#D4AF37]"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8C8C] uppercase tracking-wider mb-1">
                  Next Action Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Confirm test drive appointment at 1:00 PM"
                  value={nextActionNote}
                  onChange={(e) => setNextActionNote(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded p-2 text-xs text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowTaskCompleteModal(false)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary btn-sm font-semibold">
                  Save Outcome
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Mark Sold Modal (§33) ── */}
      {showSoldModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-emerald-500/30 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-emerald-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4" />
                  Mark Deal as Sold
                </h3>
                <p className="text-xs text-[#8C8C8C]">Closing deal for {cust.firstName} {cust.lastName}</p>
              </div>
              <button onClick={() => setShowSoldModal(false)} className="text-[#8C8C8C] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkSold} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8C8C] uppercase mb-1">Vehicle</label>
                <input
                  type="text"
                  disabled
                  value={`${veh.year} ${veh.make} ${veh.model}`}
                  className="w-full bg-[#141414] border border-white/10 rounded p-2 text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8C8C] uppercase mb-1">Final Sale Value ($)</label>
                <input
                  type="number"
                  value={soldValue}
                  onChange={(e) => setSoldValue(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded p-2 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-[#8C8C8C] uppercase mb-1">Gross Profit ($)</label>
                <input
                  type="number"
                  value={soldGross}
                  onChange={(e) => setSoldGross(e.target.value)}
                  className="w-full bg-[#111111] border border-white/10 rounded p-2 text-emerald-400 font-mono"
                />
              </div>

              <p className="text-[11px] text-[#A0A0A0]">
                Marking sold will automatically cancel remaining future sales tasks.
              </p>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowSoldModal(false)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary btn-sm bg-emerald-600 hover:bg-emerald-500 font-semibold"
                >
                  Confirm Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Mark Lost Modal (§32) ── */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#0F0F0F] border border-red-500/30 rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-red-400 flex items-center gap-1.5">
                  <XCircle className="w-4 h-4" />
                  Mark Deal as Lost
                </h3>
                <p className="text-xs text-[#8C8C8C]">Capture reason for executive reporting</p>
              </div>
              <button onClick={() => setShowLostModal(false)} className="text-[#8C8C8C] hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleMarkLost} className="space-y-3 text-xs">
              <div>
                <label className="block text-[10px] font-bold text-[#8C8C8C] uppercase mb-1.5">
                  Reason Customer Did Not Purchase
                </label>
                <select
                  value={lostReasonChoice}
                  onChange={(e) => setLostReasonChoice(e.target.value as LostReason)}
                  className="w-full bg-[#111111] border border-white/10 rounded p-2.5 text-white"
                >
                  <option value="purchased_elsewhere">Purchased Elsewhere</option>
                  <option value="price">Price / Monthly Payment</option>
                  <option value="financing">Financing Declined</option>
                  <option value="vehicle_unavailable">Vehicle Unavailable / Sold</option>
                  <option value="not_interested">Not Interested</option>
                  <option value="no_response">No Response / Unreachable</option>
                  <option value="duplicate">Duplicate Lead</option>
                  <option value="other">Other Reason</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-white/[0.08]">
                <button
                  type="button"
                  onClick={() => setShowLostModal(false)}
                  className="btn-secondary btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-secondary btn-sm text-red-400 border-red-500/30 hover:bg-red-500/10 font-semibold"
                >
                  Confirm Lost
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
