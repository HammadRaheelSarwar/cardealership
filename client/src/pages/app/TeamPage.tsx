import React, { useState } from 'react';
import {
  Users, UserPlus, Shield, Mail, CheckCircle2,
  MoreVertical, ShieldAlert, ArrowRight
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'salesperson';
  status: 'active' | 'invited';
  assignedLeads: number;
  joinedDate: string;
}

export default function TeamPage() {
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'salesperson' | 'manager'>('salesperson');

  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Alex Morgan',
      email: 'alex@premierautogroup.com',
      role: 'owner',
      status: 'active',
      assignedLeads: 0,
      joinedDate: 'Jan 12, 2026',
    },
    {
      id: '2',
      name: 'Shane Miller',
      email: 'shane@premierautogroup.com',
      role: 'manager',
      status: 'active',
      assignedLeads: 8,
      joinedDate: 'Jan 15, 2026',
    },
    {
      id: '3',
      name: 'Sarah Parker',
      email: 'sarah@premierautogroup.com',
      role: 'salesperson',
      status: 'active',
      assignedLeads: 14,
      joinedDate: 'Feb 1, 2026',
    },
    {
      id: '4',
      name: 'Michael Brown',
      email: 'michael@premierautogroup.com',
      role: 'salesperson',
      status: 'active',
      assignedLeads: 11,
      joinedDate: 'Feb 10, 2026',
    },
  ]);

  const handleSendInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail) return;

    setMembers((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        name: inviteEmail.split('@')[0],
        email: inviteEmail,
        role: inviteRole,
        status: 'invited',
        assignedLeads: 0,
        joinedDate: 'Pending Acceptance',
      },
    ]);

    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold">Dealership Team & Roles</h1>
          <p className="page-subtitle text-xs">
            Manage sales consultants, managers, and dealership administrative permissions.
          </p>
        </div>

        <button
          onClick={() => setIsInviteModalOpen(true)}
          className="btn btn-primary btn-sm text-xs gap-1.5 self-start sm:self-auto"
        >
          <UserPlus className="w-4 h-4" />
          <span>Invite Team Member</span>
        </button>
      </div>

      {/* Role Permissions Matrix Card (§49) */}
      <div className="crm-card p-5 bg-gradient-to-r from-blue-50/50 to-white">
        <h2 className="text-xs font-bold uppercase tracking-wider text-text-primary mb-2 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-primary" />
          Dealership Permission Tiers
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
          <div className="p-3 bg-white border border-border-light rounded-lg">
            <span className="font-bold text-text-primary block mb-1">Dealership Owner</span>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              Full dealership access, billing, subscription, integration configuration, team invitations, and audit logs.
            </p>
          </div>
          <div className="p-3 bg-white border border-border-light rounded-lg">
            <span className="font-bold text-text-primary block mb-1">Sales Manager</span>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              Access to all dealership leads, lead assignments, sales reports, team performance visibility, and automation rules.
            </p>
          </div>
          <div className="p-3 bg-white border border-border-light rounded-lg">
            <span className="font-bold text-text-primary block mb-1">Sales Consultant</span>
            <p className="text-text-secondary text-[11px] leading-relaxed">
              Access to assigned leads, customer communications (SMS/Email), personal task manager, and vehicle pipeline.
            </p>
          </div>
        </div>
      </div>

      {/* Team Members Table (§48) */}
      <div className="crm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary text-text-muted uppercase font-semibold border-b border-border-light">
              <tr>
                <th className="px-5 py-3.5">Name</th>
                <th className="px-5 py-3.5">Email</th>
                <th className="px-5 py-3.5">Dealership Role</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5">Assigned Leads</th>
                <th className="px-5 py-3.5">Member Since</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-bg-secondary/40 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-full bg-navy text-white flex items-center justify-center font-bold text-[11px]">
                        {m.name.split(' ').map((n) => n[0]).join('')}
                      </div>
                      <span className="font-bold text-text-primary">{m.name}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 text-text-secondary">{m.email}</td>

                  <td className="px-5 py-3.5">
                    {m.role === 'owner' && (
                      <span className="badge bg-purple-50 text-purple-700 border border-purple-200 font-bold uppercase text-[10px]">
                        Owner
                      </span>
                    )}
                    {m.role === 'manager' && (
                      <span className="badge bg-blue-50 text-blue-700 border border-blue-200 font-bold uppercase text-[10px]">
                        Manager
                      </span>
                    )}
                    {m.role === 'salesperson' && (
                      <span className="badge-neutral font-bold uppercase text-[10px]">
                        Salesperson
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5">
                    {m.status === 'active' ? (
                      <span className="badge-success text-[11px] font-medium">Active</span>
                    ) : (
                      <span className="badge-warning text-[11px] font-medium">Invited (Pending)</span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 font-bold text-text-primary">
                    {m.assignedLeads} leads
                  </td>

                  <td className="px-5 py-3.5 text-text-muted">{m.joinedDate}</td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={() => alert(`Edit user permissions for ${m.name}`)}
                      className="btn btn-ghost btn-sm text-text-secondary hover:text-text-primary text-xs"
                    >
                      Configure
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Invite Modal */}
      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-modal border border-border-light space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <h2 className="text-base font-bold text-text-primary">Invite Team Member</h2>
              <button
                onClick={() => setIsInviteModalOpen(false)}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendInvite} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-text-secondary uppercase mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="consultant@premierautogroup.com"
                  className="crm-input"
                />
              </div>

              <div>
                <label className="block font-semibold text-text-secondary uppercase mb-1">
                  Assigned Dealership Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e: any) => setInviteRole(e.target.value)}
                  className="crm-input"
                >
                  <option value="salesperson">Sales Consultant (Assigned Leads Only)</option>
                  <option value="manager">Sales Manager (All Leads & Reports)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light">
                <button
                  type="button"
                  onClick={() => setIsInviteModalOpen(false)}
                  className="btn btn-secondary btn-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm text-xs"
                >
                  Send Invitation Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
