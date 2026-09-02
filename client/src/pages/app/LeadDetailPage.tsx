import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft, Phone, MessageSquare, Mail, Calendar, Sparkles,
  Car, Copy, Send, CheckCircle2
} from 'lucide-react';
import api from '@/services/api';

export default function LeadDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [composerTab, setComposerTab] = useState<'sms' | 'email' | 'note'>('sms');
  const [messageContent, setMessageContent] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [copiedVin, setCopiedVin] = useState(false);

  const { data: lead } = useQuery({
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
            make: 'Mercedes-Benz',
            model: 'S-Class',
            trim: 'S 580 4MATIC',
            price: 114500,
            vin: 'WDD2231761A092819',
            stockNumber: 'P24-101',
            mileage: '3,200 mi',
          },
          stage: { name: 'Follow-Up' },
          temperature: 'hot',
          assignedUser: { firstName: 'Shane', lastName: 'Miller' },
          nextAction: 'Follow up tomorrow at 10:00 AM re: financing paperwork',
          aiInsight: 'Customer asked about 60-month financing terms twice. Consider offering the promotional 4.9% rate with trade appraisal.',
        };
      }
    },
  });

  const [timeline, setTimeline] = useState([
    { id: 1, time: '10:04 AM', event: 'Lead created via Website Financing Form', type: 'system' },
    { id: 2, time: '10:07 AM', event: 'SMS sent to customer', sender: 'Shane Miller', content: 'Hi John, thanks for your inquiry on the 2024 Mercedes-Benz S-Class! Are you looking to finance or lease?', type: 'outbound' },
    { id: 3, time: '10:15 AM', event: 'SMS received from customer', sender: 'John Carter', content: 'Is this vehicle still available? Also do you have flexible financing options for 60 months?', type: 'inbound' },
    { id: 4, time: '10:18 AM', event: 'Email sent', sender: 'Shane Miller', content: 'Prepared preliminary 60-month financing breakdown and lot inspection history.', type: 'outbound' },
  ]);

  const handleSend = () => {
    if (!messageContent.trim()) return;
    setTimeline(prev => [
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
    make: 'Mercedes-Benz',
    model: 'S-Class',
    trim: 'S 580 4MATIC',
    price: 114500,
    vin: 'WDD2231761A092819',
    stockNumber: 'P24-101',
    mileage: '3,200 mi',
  };

  const stage = lead?.pipelineStageId || lead?.stage || { name: 'Follow-Up' };
  const assigned = lead?.assignedUserId || lead?.assignedUser || { firstName: 'Shane', lastName: 'Miller' };

  return (
    <div className="max-w-6xl mx-auto text-white space-y-6 pb-16">
      {/* ── Top Navigation Breadcrumb ── */}
      <button
        onClick={() => navigate('/leads')}
        className="text-xs text-[#8C8C8C] hover:text-white flex items-center gap-1.5 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Back to Leads</span>
      </button>

      {/* ── Editorial Header (No nested card frame) ── */}
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
                {stage.name || 'Contacted'} · Hot Lead
              </span>
              <span className="text-white/20">•</span>
              <span>Assigned to {assigned.firstName} {assigned.lastName}</span>
            </div>
          </div>

          {/* Quick Contact Actions (Restrained buttons) */}
          <div className="flex items-center gap-2">
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
              className="btn-primary btn-sm ml-1"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Schedule</span>
            </button>
          </div>
        </div>
      </div>

      {/* ── Workspace 65 / 35 Split Layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        
        {/* ── LEFT 65% (8 cols): Conversation Timeline & Composer ── */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-[rgba(255,255,255,0.06)] pb-3">
            <h2 className="text-xs font-semibold text-[#8C8C8C] uppercase tracking-wider">
              Conversation & Activity
            </h2>
            <span className="text-xs text-[#6E6E6E]">Today</span>
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
                  <div className={`p-3 rounded-md border text-xs max-w-xl ${
                    item.type === 'inbound'
                      ? 'bg-[#141414] border-white/10 text-white'
                      : item.type === 'outbound'
                      ? 'bg-[#0E0E0E] border-white/[0.06] text-[#D0D0D0]'
                      : 'bg-transparent border-transparent text-[#6E6E6E]'
                  }`}>
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
                className="crm-input"
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setMessageContent(
                        'Hi John, promotional financing on the 2024 S-Class is currently 4.9% APR for 60 months. Would you like to stop by for a test drive this afternoon?'
                      )
                    }
                    className="text-[11px] text-[#D4AF37] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Insert financing quote</span>
                  </button>
                </div>

                <button
                  onClick={handleSend}
                  className="btn-primary btn-sm gap-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Send</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT 35% (4 cols): Grouped Customer Context & Vehicle Dossier ── */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Section 1: Contact Dossier */}
          <div className="space-y-2 border-b border-[rgba(255,255,255,0.06)] pb-5">
            <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block">
              Contact Information
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

          {/* Section 2: Vehicle Interest Dossier */}
          <div className="space-y-3 border-b border-[rgba(255,255,255,0.06)] pb-5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block">
                Vehicle Interest
              </span>
              <button
                onClick={() => navigate('/vehicles/1')}
                className="text-[11px] text-[#D4AF37] hover:underline"
              >
                Lot Details →
              </button>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-baseline">
                <span className="font-semibold text-white text-sm">
                  {veh.year} {veh.make} {veh.model}
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

          {/* Section 3: Next Step */}
          <div className="space-y-2 border-b border-[rgba(255,255,255,0.06)] pb-5">
            <span className="text-[10px] font-semibold text-[#6E6E6E] uppercase tracking-wider block">
              Next Step
            </span>
            <p className="text-xs text-white leading-relaxed">
              {lead?.nextAction}
            </p>
          </div>

          {/* Section 4: AI Contextual Insight (Naturally Embedded) */}
          <div className="p-3 bg-[#0F0F0F] border-l-2 border-[#D4AF37] rounded-r-md space-y-1.5">
            <div className="flex items-center gap-1.5 text-[10px] font-semibold text-[#D4AF37] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              <span>Deal Intelligence</span>
            </div>
            <p className="text-xs text-[#B4B4B4] leading-relaxed">
              {lead?.aiInsight}
            </p>
            <button
              onClick={() =>
                setMessageContent(
                  'Hi John, following up on your financing inquiry. We have pre-approved promotional 4.9% APR for 60 months ready for your review.'
                )
              }
              className="text-[11px] text-white hover:text-[#D4AF37] font-semibold pt-1 block"
            >
              Generate financing email →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
