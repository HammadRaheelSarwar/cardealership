import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Users, Plus, Search, Filter, ArrowUpDown, ChevronRight,
  Car, Clock, Phone, Mail, Sparkles, AlertCircle
} from 'lucide-react';
import api from '@/services/api';
import axios from 'axios';

function normalizeLead(lead: any) {
  const customer = lead.customer || lead.customerId;
  const assignedUser = lead.assigned_user || lead.assignedUser || lead.assignedUserId;

  return {
    ...lead,
    _id: lead._id || lead.id,
    customer: customer
      ? {
          ...customer,
          firstName: customer.firstName ?? customer.first_name,
          lastName: customer.lastName ?? customer.last_name,
        }
      : undefined,
    vehicle: lead.vehicle || lead.vehicleId,
    stage: lead.stage || lead.pipelineStageId,
    source: lead.source || lead.sourceId,
    assignedUser: assignedUser
      ? {
          ...assignedUser,
          firstName: assignedUser.firstName ?? assignedUser.first_name,
          lastName: assignedUser.lastName ?? assignedUser.last_name,
        }
      : undefined,
    nextFollowUpAt: lead.nextFollowUpAt ?? lead.next_follow_up_at,
    createdAt: lead.createdAt ?? lead.created_at,
  };
}

export default function LeadsPage() {
  const navigate = useNavigate();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStage, setSelectedStage] = useState('all');
  const [selectedTemperature, setSelectedTemperature] = useState('all');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // New Lead Form State
  const [newLead, setNewLead] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    vehicle: '2024 Toyota Camry XSE',
    source: 'Website',
    temperature: 'hot' as 'hot' | 'warm' | 'cold',
    priority: 'high' as 'high' | 'medium' | 'low',
    notes: '',
  });

  // Query leads
  const { data: leadsData, refetch } = useQuery({
    queryKey: ['leads', selectedStage, selectedTemperature],
    queryFn: async () => {
      try {
        const res = await api.get('/leads');
        return Array.isArray(res.data.data) ? res.data.data.map(normalizeLead) : [];
      } catch {
        // Fallback demo leads
        return [
          {
            _id: '1',
            customer: { firstName: 'John', lastName: 'Carter', phone: '+1 (555) 301-4492', email: 'john.carter@gmail.com' },
            vehicle: { year: 2024, make: 'Toyota', model: 'Camry', trim: 'XSE', price: 34900 },
            source: { name: 'Website' },
            stage: { name: 'Follow-Up', color: '#F59E0B' },
            temperature: 'hot',
            priority: 'high',
            assignedUser: { firstName: 'Shane', lastName: 'Miller' },
            nextFollowUpAt: 'Tomorrow 10 AM',
            createdAt: 'Today 10:04 AM',
          },
          {
            _id: '2',
            customer: { firstName: 'Emily', lastName: 'Davis', phone: '+1 (555) 482-9912', email: 'emily.davis@outlook.com' },
            vehicle: { year: 2023, make: 'BMW', model: '330i', trim: 'M Sport', price: 41500 },
            source: { name: 'Facebook' },
            stage: { name: 'Appointment', color: '#0891B2' },
            temperature: 'hot',
            priority: 'high',
            assignedUser: { firstName: 'Sarah', lastName: 'Parker' },
            nextFollowUpAt: 'Today 2 PM',
            createdAt: 'Today 9:15 AM',
          },
          {
            _id: '3',
            customer: { firstName: 'David', lastName: 'Wilson', phone: '+1 (555) 771-3320', email: 'david.wilson@yahoo.com' },
            vehicle: { year: 2024, make: 'Ford', model: 'F-150', trim: 'XLT', price: 52900 },
            source: { name: 'Phone' },
            stage: { name: 'Contacted', color: '#7C3AED' },
            temperature: 'warm',
            priority: 'medium',
            assignedUser: { firstName: 'Michael', lastName: 'Brown' },
            nextFollowUpAt: 'In 2 days',
            createdAt: 'Yesterday',
          },
          {
            _id: '4',
            customer: { firstName: 'Jessica', lastName: 'Anderson', phone: '+1 (555) 604-1294', email: 'jess.anderson@gmail.com' },
            vehicle: { year: 2024, make: 'Hyundai', model: 'Tucson', trim: 'Limited', price: 36200 },
            source: { name: 'AutoTrader' },
            stage: { name: 'New', color: '#2563EB' },
            temperature: 'cold',
            priority: 'low',
            assignedUser: { firstName: 'Sarah', lastName: 'Parker' },
            nextFollowUpAt: 'Pending call',
            createdAt: '2 days ago',
          },
        ];
      }
    },
  });

  const handleCreateLead = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setIsSaving(true);
    try {
      const response = await api.post('/leads', {
        newCustomer: {
          firstName: newLead.firstName,
          lastName: newLead.lastName,
          phone: newLead.phone,
          email: newLead.email,
        },
        temperature: newLead.temperature,
        priority: newLead.priority,
        notes: newLead.notes,
      });
      await refetch();
      setIsCreateModalOpen(false);

      const createdLeadId = response.data?.data?.lead?.id || response.data?.data?.lead?._id;
      if (createdLeadId) navigate(`/leads/${createdLeadId}`);
    } catch (error: unknown) {
      setCreateError(
        axios.isAxiosError(error)
          ? error.response?.data?.message || 'Unable to save the lead. Please try again.'
          : 'Unable to save the lead. Please try again.'
      );
    } finally {
      setIsSaving(false);
    }
  };

  const leads = Array.isArray(leadsData) ? leadsData : [];

  const filteredLeads = leads.filter((l: any) => {
    const cust = l.customer || l.customerId || {};
    const veh = l.vehicle || l.vehicleId || {};
    const name = `${cust.firstName} ${cust.lastName}`.toLowerCase();
    const car = `${veh.year} ${veh.make} ${veh.model}`.toLowerCase();
    const s = searchTerm.toLowerCase();

    const matchesSearch = name.includes(s) || car.includes(s);
    const matchesTemp = selectedTemperature === 'all' || l.temperature === selectedTemperature;
    const matchesStage = selectedStage === 'all' || (l.stage?.name || l.pipelineStageId?.name) === selectedStage;

    return matchesSearch && matchesTemp && matchesStage;
  });

  return (
    <div className="space-y-4 animate-fade-in max-w-7xl mx-auto">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold">Dealership Leads</h1>
          <p className="page-subtitle text-xs">
            Manage inquiries, assign salespeople, and track customer response times.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary btn-sm text-xs gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Lead</span>
        </button>
      </div>

      {/* ── Filters & Search Bar (§18) ── */}
      <div className="bg-white border border-border-light rounded-xl p-3 flex flex-col md:flex-row items-center justify-between gap-3 shadow-sm">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone, vehicle..."
            className="crm-input pl-9 py-1.5 text-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto text-xs">
          {/* Stage filter */}
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value)}
            className="crm-input py-1.5 text-xs w-36"
          >
            <option value="all">All Stages</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Follow-Up">Follow-Up</option>
            <option value="Appointment">Appointment</option>
            <option value="Negotiation">Negotiation</option>
            <option value="Sold">Sold</option>
          </select>

          {/* Temperature filter */}
          <select
            value={selectedTemperature}
            onChange={(e) => setSelectedTemperature(e.target.value)}
            className="crm-input py-1.5 text-xs w-36"
          >
            <option value="all">All Temperatures</option>
            <option value="hot">🔥 Hot Leads</option>
            <option value="warm">⚡ Warm Leads</option>
            <option value="cold">❄️ Cold Leads</option>
          </select>
        </div>
      </div>

      {/* ── Leads Table (§18) ── */}
      <div className="crm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary text-text-muted uppercase font-semibold border-b border-border-light">
              <tr>
                <th className="px-5 py-3.5">Customer</th>
                <th className="px-5 py-3.5">Vehicle Interest</th>
                <th className="px-5 py-3.5">Source</th>
                <th className="px-5 py-3.5">Stage</th>
                <th className="px-5 py-3.5">Salesperson</th>
                <th className="px-5 py-3.5">Temperature</th>
                <th className="px-5 py-3.5">Next Follow-Up</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filteredLeads.map((lead: any) => {
                const cust = lead.customer || lead.customerId || {};
                const veh = lead.vehicle || lead.vehicleId || {};
                const stage = lead.stage || lead.pipelineStageId || {};
                const user = lead.assignedUser || lead.assignedUserId || {};
                const src = lead.source || lead.sourceId || {};

                return (
                  <tr
                    key={lead._id}
                    onClick={() => navigate(`/leads/${lead._id}`)}
                    className="hover:bg-bg-secondary/60 cursor-pointer transition"
                  >
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-text-primary">
                        {cust.firstName} {cust.lastName}
                      </div>
                      <div className="text-[11px] text-text-muted">{cust.phone}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="font-medium text-text-primary">
                        {veh.year} {veh.make} {veh.model} {veh.trim}
                      </div>
                      <div className="text-[11px] text-success font-semibold">
                        ${(veh.price || 0).toLocaleString()}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 text-text-secondary">
                      {src.name || 'Website'}
                    </td>

                    <td className="px-5 py-3.5">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold text-white"
                        style={{ backgroundColor: stage.color || '#2563EB' }}
                      >
                        {stage.name || 'New'}
                      </span>
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-navy text-white flex items-center justify-center font-bold text-[10px]">
                          {user.firstName?.[0] || 'S'}
                        </div>
                        <span className="font-medium text-text-primary">
                          {user.firstName} {user.lastName}
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      {lead.temperature === 'hot' && <span className="badge-hot">🔥 Hot</span>}
                      {lead.temperature === 'warm' && <span className="badge-warm">⚡ Warm</span>}
                      {lead.temperature === 'cold' && <span className="badge-cold">❄️ Cold</span>}
                    </td>

                    <td className="px-5 py-3.5 text-amber-700 font-medium">
                      {lead.nextFollowUpAt || 'Not scheduled'}
                    </td>

                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/leads/${lead._id}`);
                        }}
                        className="btn btn-ghost btn-sm text-primary font-semibold hover:bg-primary/10"
                      >
                        Open Workspace →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Fast New Lead Drawer/Modal (§96, §97) ── */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-modal border border-border-light space-y-4 animate-scale-in">
            <div className="flex items-center justify-between pb-3 border-b border-border-light">
              <h2 className="text-base font-bold text-text-primary">Capture New Dealership Lead</h2>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-xs text-text-muted hover:text-text-primary"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateLead} className="space-y-3 text-xs">
              {createError && (
                <div className="p-3 bg-red-50 border border-red-200 text-error rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{createError}</span>
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-secondary uppercase mb-1">First Name</label>
                  <input
                    type="text"
                    required
                    value={newLead.firstName}
                    onChange={(e) => setNewLead({ ...newLead, firstName: e.target.value })}
                    className="crm-input"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-secondary uppercase mb-1">Last Name</label>
                  <input
                    type="text"
                    required
                    value={newLead.lastName}
                    onChange={(e) => setNewLead({ ...newLead, lastName: e.target.value })}
                    className="crm-input"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-secondary uppercase mb-1">Phone (SMS)</label>
                  <input
                    type="tel"
                    required
                    value={newLead.phone}
                    onChange={(e) => setNewLead({ ...newLead, phone: e.target.value })}
                    className="crm-input"
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-text-secondary uppercase mb-1">Email</label>
                  <input
                    type="email"
                    value={newLead.email}
                    onChange={(e) => setNewLead({ ...newLead, email: e.target.value })}
                    className="crm-input"
                    placeholder="customer@email.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-text-secondary uppercase mb-1">Temperature</label>
                  <select
                    value={newLead.temperature}
                    onChange={(e: any) => setNewLead({ ...newLead, temperature: e.target.value })}
                    className="crm-input"
                  >
                    <option value="hot">🔥 Hot Lead</option>
                    <option value="warm">⚡ Warm Lead</option>
                    <option value="cold">❄️ Cold Lead</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-text-secondary uppercase mb-1">Priority</label>
                  <select
                    value={newLead.priority}
                    onChange={(e: any) => setNewLead({ ...newLead, priority: e.target.value })}
                    className="crm-input"
                  >
                    <option value="high">High Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="low">Low Priority</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-text-secondary uppercase mb-1">Notes / Inquired Vehicle</label>
                <textarea
                  rows={2}
                  value={newLead.notes}
                  onChange={(e) => setNewLead({ ...newLead, notes: e.target.value })}
                  placeholder="Customer visited lot looking for 2024 Camry or midsize sedan..."
                  className="crm-input resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-border-light">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  disabled={isSaving}
                  className="btn btn-secondary btn-sm text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="btn btn-primary btn-sm text-xs"
                >
                  {isSaving ? 'Saving Lead...' : 'Save Lead & Open Workspace'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
