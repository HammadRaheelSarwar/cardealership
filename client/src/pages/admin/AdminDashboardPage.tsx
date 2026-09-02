import React from 'react';
import {
  Building2, Users, DollarSign, MessageSquare, ShieldAlert,
  TrendingUp, CheckCircle2, ChevronRight, Activity, ArrowUpRight
} from 'lucide-react';

export default function AdminDashboardPage() {
  const platformKpis = [
    { label: 'Active Dealerships', value: '48', trend: '+4 this month', icon: Building2, color: 'text-primary' },
    { label: 'Platform Users', value: '284', trend: '+28 new users', icon: Users, color: 'text-purple-600' },
    { label: 'Messages Sent (SMS/Email)', value: '184,200', trend: '99.8% delivered', icon: MessageSquare, color: 'text-cyan-600' },
    { label: 'Monthly Recurring Revenue', value: '$24,800', trend: '+14% MoM', icon: DollarSign, color: 'text-success' },
  ];

  const dealerships = [
    { id: '1', name: 'Premier Auto Group', slug: 'premier-auto-group', owner: 'Alex Morgan', status: 'active', plan: 'Growth ($399/mo)', users: 4, leads: 142 },
    { id: '2', name: 'Apex Motor Cars', slug: 'apex-motors', owner: 'Marcus Vance', status: 'active', plan: 'Multi-Store ($799/mo)', users: 12, leads: 480 },
    { id: '3', name: 'Lone Star Pre-Owned', slug: 'lone-star-auto', owner: 'Travis Bell', status: 'trial', plan: 'Starter ($199/mo)', users: 2, leads: 28 },
    { id: '4', name: 'Metro Automotive Sales', slug: 'metro-auto', owner: 'Elena Rostova', status: 'active', plan: 'Growth ($399/mo)', users: 6, leads: 215 },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Super Admin Top Alert Banner */}
      <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl flex items-center justify-between text-xs text-ai-purple">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-ai-purple" />
          <span>
            <strong>SaaS Super Admin Portal Active:</strong> Global platform oversight, multi-tenant billing, carrier routing, and server health.
          </span>
        </div>
        <span className="badge-purple font-bold text-[10px]">Platform Role: superAdmin</span>
      </div>

      {/* Header */}
      <div>
        <h1 className="page-title text-2xl font-bold">Platform Overview & SaaS Metrics</h1>
        <p className="page-subtitle text-xs">
          High-level metrics across all independent automobile dealerships on DealerOS.
        </p>
      </div>

      {/* KPI Cards (§54) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {platformKpis.map((k, i) => {
          const Icon = k.icon;
          return (
            <div key={i} className="metric-card">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-muted uppercase">{k.label}</span>
                <Icon className={`w-4 h-4 ${k.color}`} />
              </div>
              <div className="text-3xl font-bold text-text-primary tracking-tight mt-1">
                {k.value}
              </div>
              <span className="text-xs text-success font-semibold flex items-center gap-1 mt-0.5">
                <TrendingUp className="w-3 h-3" />
                {k.trend}
              </span>
            </div>
          );
        })}
      </div>

      {/* Dealerships Table */}
      <div className="crm-card overflow-hidden">
        <div className="p-5 border-b border-border-light flex items-center justify-between">
          <div>
            <h2 className="section-heading text-base">Registered Dealership Accounts</h2>
            <p className="text-xs text-text-secondary mt-0.5">Active subscriptions and lead volume by tenant</p>
          </div>
          <button
            onClick={() => alert('New dealership onboarding link generated')}
            className="btn btn-primary btn-sm text-xs"
          >
            Provision Dealership
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary text-text-muted uppercase font-semibold border-b border-border-light">
              <tr>
                <th className="px-5 py-3.5">Dealership Name</th>
                <th className="px-5 py-3.5">Tenant Slug</th>
                <th className="px-5 py-3.5">Account Owner</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Subscription Tier</th>
                <th className="px-5 py-3.5">Active Users</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {dealerships.map((d) => (
                <tr key={d.id} className="hover:bg-bg-secondary/40 transition">
                  <td className="px-5 py-3.5 font-bold text-text-primary">
                    {d.name}
                  </td>
                  <td className="px-5 py-3.5 font-mono text-[11px] text-text-muted">
                    /{d.slug}
                  </td>
                  <td className="px-5 py-3.5 text-text-secondary font-medium">
                    {d.owner}
                  </td>
                  <td className="px-5 py-3.5">
                    {d.status === 'active' ? (
                      <span className="badge-success text-[10px] font-bold">Active</span>
                    ) : (
                      <span className="badge-warning text-[10px] font-bold">14-Day Trial</span>
                    )}
                  </td>
                  <td className="px-5 py-3.5 font-medium text-text-primary">
                    {d.plan}
                  </td>
                  <td className="px-5 py-3.5 font-semibold text-text-secondary">
                    {d.users} seats
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => alert(`Super admin inspect tenant: ${d.slug}`)}
                      className="btn btn-ghost btn-sm text-primary font-semibold text-xs"
                    >
                      Manage Tenant →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
