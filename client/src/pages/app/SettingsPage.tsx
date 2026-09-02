import React, { useState } from 'react';
import {
  Building2, GitMerge, Share2, MessageSquare, Shield,
  Save, CheckCircle2, Lock, AlertCircle, Clock
} from 'lucide-react';
import { useActiveDealership } from '@/store/authStore';

export default function SettingsPage() {
  const activeMembership = useActiveDealership();
  const [activeTab, setActiveTab] = useState<'profile' | 'pipeline' | 'sources' | 'compliance' | 'security'>('profile');
  const [isSaved, setIsSaved] = useState(false);

  // Profile Form
  const [dealershipName, setDealershipName] = useState('Premier Auto Group');
  const [phone, setPhone] = useState('+1 (555) 100-2000');
  const [email, setEmail] = useState('sales@premierautogroup.com');
  const [website, setWebsite] = useState('https://premierautogroup.example.com');
  const [timezone, setTimezone] = useState('America/New_York');

  // Pipeline Stages state (§53)
  const [stages, setStages] = useState([
    { id: '1', name: 'New', color: '#2563EB', isSystem: false },
    { id: '2', name: 'Contacted', color: '#7C3AED', isSystem: false },
    { id: '3', name: 'Follow-Up', color: '#F59E0B', isSystem: false },
    { id: '4', name: 'Appointment', color: '#0891B2', isSystem: false },
    { id: '5', name: 'Negotiation', color: '#EA580C', isSystem: false },
    { id: '6', name: 'Sold', color: '#16A34A', isSystem: true },
    { id: '7', name: 'Lost', color: '#DC2626', isSystem: true },
  ]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2500);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="page-title text-2xl font-bold">Dealership Settings</h1>
        <p className="page-subtitle text-xs">
          Configure store profile, custom sales pipeline stages, communication compliance, and security.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-white border border-border-light rounded-xl p-1 text-xs shadow-sm overflow-x-auto">
        {[
          { id: 'profile', label: 'Dealership Profile', icon: Building2 },
          { id: 'pipeline', label: 'Pipeline Stages', icon: GitMerge },
          { id: 'sources', label: 'Lead Sources', icon: Share2 },
          { id: 'compliance', label: 'SMS & Compliance', icon: MessageSquare },
          { id: 'security', label: 'Tenant Security', icon: Shield },
        ].map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id as any)}
            className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-2 whitespace-nowrap transition ${
              activeTab === id
                ? 'bg-primary text-white shadow-xs'
                : 'text-text-secondary hover:text-text-primary hover:bg-bg-secondary'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{label}</span>
          </button>
        ))}
      </div>

      {isSaved && (
        <div className="p-3 bg-green-50 border border-green-200 text-success rounded-xl flex items-center gap-2 text-xs animate-fade-in">
          <CheckCircle2 className="w-4 h-4" />
          <span>Dealership configuration changes saved successfully!</span>
        </div>
      )}

      {/* ── TAB 1: Profile ── */}
      {activeTab === 'profile' && (
        <form onSubmit={handleSave} className="crm-card p-6 space-y-4 text-xs animate-fade-in">
          <div className="border-b border-border-light pb-3">
            <h2 className="font-bold text-sm text-text-primary">Dealership Information</h2>
            <p className="text-text-muted text-[11px]">Primary operating identity for outbound messaging & customer documents</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">Dealership Name</label>
              <input
                type="text"
                required
                value={dealershipName}
                onChange={(e) => setDealershipName(e.target.value)}
                className="crm-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">Operating Timezone</label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="crm-input"
              >
                <option value="America/New_York">Eastern Time (US & Canada)</option>
                <option value="America/Chicago">Central Time (US & Canada)</option>
                <option value="America/Denver">Mountain Time (US & Canada)</option>
                <option value="America/Los_Angeles">Pacific Time (US & Canada)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">Store Phone</label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="crm-input"
              />
            </div>
            <div>
              <label className="block font-semibold text-text-secondary uppercase mb-1">Store Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="crm-input"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block font-semibold text-text-secondary uppercase mb-1">Store Website</label>
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className="crm-input"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-border-light">
            <button type="submit" className="btn btn-primary btn-sm gap-1.5 text-xs">
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      )}

      {/* ── TAB 2: Pipeline Stages (§53) ── */}
      {activeTab === 'pipeline' && (
        <div className="crm-card p-6 space-y-4 text-xs animate-fade-in">
          <div className="flex items-center justify-between border-b border-border-light pb-3">
            <div>
              <h2 className="font-bold text-sm text-text-primary">Pipeline Stages Configuration</h2>
              <p className="text-text-muted text-[11px]">Reorder and customize deal stages. Sold and Lost are protected system states.</p>
            </div>
            <button
              onClick={() => alert('Create stage modal')}
              className="btn btn-secondary btn-sm text-xs"
            >
              + Add Custom Stage
            </button>
          </div>

          <div className="space-y-2">
            {stages.map((st, i) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-3 bg-bg-secondary border border-border-light rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: st.color }} />
                  <span className="font-bold text-text-primary text-xs">{st.name}</span>
                  {st.isSystem && (
                    <span className="badge-purple text-[10px] font-semibold">Protected System State</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={st.color}
                    onChange={(e) => {
                      const newColor = e.target.value;
                      setStages((prev) => prev.map((s) => (s.id === st.id ? { ...s, color: newColor } : s)));
                    }}
                    className="w-7 h-7 rounded border border-border-light cursor-pointer"
                  />
                  <span className="text-text-muted text-[11px]">Step {i + 1}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── TAB 4: SMS & Compliance (§34, §80) ── */}
      {activeTab === 'compliance' && (
        <div className="crm-card p-6 space-y-4 text-xs animate-fade-in">
          <div className="border-b border-border-light pb-3">
            <h2 className="font-bold text-sm text-text-primary">SMS & TCPA Communication Compliance</h2>
            <p className="text-text-muted text-[11px]">Ensure all automated dealership outreach complies with federal carrier guidelines</p>
          </div>

          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-2 text-primary">
            <span className="font-bold block">Carrier Opt-Out Keywords Enforced</span>
            <p className="text-[11px] leading-relaxed">
              If any customer replies with <strong>STOP, CANCEL, UNSUBSCRIBE, QUIT, or END</strong>, the CRM immediately sets <code>doNotContact = true</code>, terminates all active automation sequences, and notifies the assigned sales consultant.
            </p>
          </div>

          <div>
            <label className="block font-semibold text-text-secondary uppercase mb-1">Standard First SMS Disclosure</label>
            <textarea
              rows={2}
              readOnly
              value="Reply STOP to unsubscribe. Msg & data rates may apply. Dealership hours: Mon-Sat 9AM-8PM."
              className="crm-input resize-none bg-gray-50 text-text-secondary"
            />
          </div>
        </div>
      )}

      {/* ── TAB 5: Security (§75, §76) ── */}
      {activeTab === 'security' && (
        <div className="crm-card p-6 space-y-4 text-xs animate-fade-in">
          <div className="border-b border-border-light pb-3">
            <h2 className="font-bold text-sm text-text-primary">Multi-Tenant Security Architecture</h2>
            <p className="text-text-muted text-[11px]">Active encryption and tenant isolation controls</p>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-bg-secondary rounded-lg border border-border-light flex items-center justify-between">
              <div>
                <span className="font-bold text-text-primary block">Refresh Token Rotation</span>
                <span className="text-[11px] text-text-muted">Short-lived access tokens with automatic family revocation on reuse detection</span>
              </div>
              <span className="badge-success font-bold text-[10px]">ACTIVE</span>
            </div>

            <div className="p-3 bg-bg-secondary rounded-lg border border-border-light flex items-center justify-between">
              <div>
                <span className="font-bold text-text-primary block">Database Row-Level Tenant Isolation</span>
                <span className="text-[11px] text-text-muted">All collections enforce database-verified dealershipId filtering</span>
              </div>
              <span className="badge-success font-bold text-[10px]">ENFORCED</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
