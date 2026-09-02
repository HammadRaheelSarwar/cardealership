import React, { useState } from 'react';
import {
  Zap, Plus, Play, Pause, ShieldCheck, ArrowDown,
  MessageSquare, Mail, Phone, Clock, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function AutomationPage() {
  const [automations, setAutomations] = useState([
    {
      id: '1',
      name: 'New Web Lead Instant Follow-Up Sequence',
      description: 'Automatically texts customer within 2 mins, verifies reply, and creates call task if no response after 24h.',
      status: 'active' as 'active' | 'paused',
      runs: 142,
      conversions: '34%',
      steps: [
        { type: 'trigger', label: 'Trigger: New Website Lead Created', icon: Zap, color: '#2563EB' },
        { type: 'action', label: 'Action: Send Instant Welcome SMS', icon: MessageSquare, color: '#2563EB' },
        { type: 'delay', label: 'Delay: Wait 15 Minutes for Customer Reply', icon: Clock, color: '#64748B' },
        { type: 'condition', label: 'Condition: Did Customer Reply? (Yes → Stop Sequence, No → Proceed)', icon: AlertCircle, color: '#F59E0B' },
        { type: 'action', label: 'Action: Send Availability & Financing Email', icon: Mail, color: '#7C3AED' },
        { type: 'delay', label: 'Delay: Wait 1 Day', icon: Clock, color: '#64748B' },
        { type: 'action', label: 'Action: Create Phone Call Task for Assigned Salesperson', icon: Phone, color: '#16A34A' },
      ],
    },
  ]);

  const toggleStatus = (id: string) => {
    setAutomations((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: a.status === 'active' ? 'paused' : 'active' } : a))
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold">Follow-Up Automation Sequences</h1>
          <p className="page-subtitle text-xs">
            Automate multi-step SMS, email, and task sequences to ensure no customer is left behind.
          </p>
        </div>

        <button
          onClick={() => alert('Visual sequence builder modal')}
          className="btn btn-primary btn-sm text-xs gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Sequence</span>
        </button>
      </div>

      {/* Safety Compliance Alert Banner (§34) */}
      <div className="p-3.5 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between gap-4 text-xs text-green-900 shadow-sm">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-4 h-4 text-success shrink-0" />
          <span>
            <strong>Automatic Compliance Protection Active:</strong> Sequences immediately abort if customer opts-out, requests Do Not Contact, replies, or deal moves to Sold/Lost.
          </span>
        </div>
        <span className="badge-success text-[10px] font-bold shrink-0">100% TCPA Compliant</span>
      </div>

      {/* Automations List */}
      <div className="space-y-6">
        {automations.map((auto) => (
          <div key={auto.id} className="crm-card p-6 space-y-6">
            {/* Top Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border-light">
              <div>
                <div className="flex items-center gap-2.5">
                  <h2 className="font-bold text-base text-text-primary">{auto.name}</h2>
                  <span
                    className={`badge text-[11px] font-bold ${
                      auto.status === 'active' ? 'badge-success' : 'badge-neutral'
                    }`}
                  >
                    {auto.status.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-text-secondary mt-1 max-w-xl leading-relaxed">
                  {auto.description}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right text-xs">
                  <div className="font-bold text-text-primary">{auto.runs} Runs</div>
                  <div className="text-success font-semibold text-[11px]">{auto.conversions} Appt Rate</div>
                </div>

                <button
                  onClick={() => toggleStatus(auto.id)}
                  className={`btn btn-sm text-xs gap-1.5 ${
                    auto.status === 'active' ? 'btn-secondary text-danger' : 'btn-primary'
                  }`}
                >
                  {auto.status === 'active' ? (
                    <>
                      <Pause className="w-3.5 h-3.5" />
                      <span>Pause</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5" />
                      <span>Activate</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Visual Canvas Nodes Stream (§30, §35) */}
            <div className="space-y-3 max-w-xl mx-auto py-2">
              {auto.steps.map((st, i) => {
                const Icon = st.icon;
                return (
                  <React.Fragment key={i}>
                    <div className="flex items-center gap-3 p-3 bg-bg-secondary/70 border border-border-light rounded-xl shadow-xs">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0"
                        style={{ backgroundColor: st.color }}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-text-primary block">
                          {st.label}
                        </span>
                      </div>
                    </div>

                    {i !== auto.steps.length - 1 && (
                      <div className="flex justify-center py-0.5">
                        <ArrowDown className="w-4 h-4 text-text-muted animate-bounce" />
                      </div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
