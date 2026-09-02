import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  User, Phone, Mail, MapPin, Tag, ShieldCheck, ShieldAlert,
  MessageSquare, Calendar, CheckSquare, Car, ArrowLeft, Plus
} from 'lucide-react';
import api from '@/services/api';
import { PageSkeleton } from '@/components/common/PageSkeleton';

interface CustomerDetail {
  customer: any;
  leads: any[];
  messages: any[];
  tasks: any[];
  appointments: any[];
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<CustomerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCustomer() {
      try {
        setLoading(true);
        const res = await api.get(`/customers/${id}`);
        setData(res.data.data);
      } catch (err: any) {
        setError(err.response?.data?.message || 'Failed to load customer profile');
      } finally {
        setLoading(false);
      }
    }
    if (id) fetchCustomer();
  }, [id]);

  if (loading) return <PageSkeleton />;
  if (error || !data) {
    return (
      <div className="p-6 text-center space-y-4">
        <p className="text-error font-medium">{error || 'Customer not found'}</p>
        <Link to="/customers" className="btn btn-secondary text-xs inline-flex items-center gap-1.5">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Customers
        </Link>
      </div>
    );
  }

  const { customer, leads, messages, tasks, appointments } = data;

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/customers" className="p-2 rounded-lg border border-border-light hover:bg-bg-secondary text-text-muted hover:text-text-primary">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="page-title text-2xl font-bold">{customer.first_name} {customer.last_name}</h1>
            <p className="page-subtitle text-xs">Customer Profile & Historical Interactions</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {customer.do_not_contact ? (
            <span className="badge-error text-xs font-bold flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5" /> Do Not Contact (DNC)
            </span>
          ) : (
            <span className="badge-success text-xs font-bold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5" /> TCPA Compliant
            </span>
          )}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Contact Details */}
        <div className="space-y-6">
          <div className="crm-card p-5 space-y-4">
            <h2 className="section-heading text-sm font-bold border-b border-border-light pb-2">Contact Details</h2>

            <div className="space-y-3 text-xs">
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Phone className="w-4 h-4 text-text-muted shrink-0" />
                <span className="font-semibold text-text-primary">{customer.phone || 'No phone provided'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <Mail className="w-4 h-4 text-text-muted shrink-0" />
                <span className="font-semibold text-text-primary">{customer.email || 'No email provided'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <MapPin className="w-4 h-4 text-text-muted shrink-0" />
                <span>{customer.location || 'Location not specified'}</span>
              </div>
              <div className="flex items-center gap-2.5 text-text-secondary">
                <User className="w-4 h-4 text-text-muted shrink-0" />
                <span>Assigned: {customer.assigned_user ? `${customer.assigned_user.first_name} ${customer.assigned_user.last_name}` : 'Unassigned'}</span>
              </div>
            </div>

            {/* Communication Consent */}
            <div className="pt-3 border-t border-border-light space-y-2">
              <span className="text-[11px] font-bold text-text-muted uppercase">Communication Consent</span>
              <div className="grid grid-cols-3 gap-2 text-[11px]">
                <div className={`p-2 rounded text-center font-medium ${customer.sms_consent ? 'bg-green-50 text-success' : 'bg-red-50 text-error'}`}>
                  SMS: {customer.sms_consent ? 'YES' : 'NO'}
                </div>
                <div className={`p-2 rounded text-center font-medium ${customer.email_consent ? 'bg-green-50 text-success' : 'bg-red-50 text-error'}`}>
                  Email: {customer.email_consent ? 'YES' : 'NO'}
                </div>
                <div className={`p-2 rounded text-center font-medium ${customer.phone_consent ? 'bg-green-50 text-success' : 'bg-red-50 text-error'}`}>
                  Phone: {customer.phone_consent ? 'YES' : 'NO'}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle & Right Column: Associated Leads, Messages & Activity */}
        <div className="lg:col-span-2 space-y-6">
          {/* Associated Leads */}
          <div className="crm-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="section-heading text-sm font-bold flex items-center gap-2">
                <Car className="w-4 h-4 text-primary" />
                <span>Active Leads & Vehicle Inquiries ({leads.length})</span>
              </h2>
            </div>

            {leads.length === 0 ? (
              <p className="text-xs text-text-muted py-3">No active lead opportunities associated with this customer.</p>
            ) : (
              <div className="space-y-2">
                {leads.map((l) => (
                  <div key={l.id} className="p-3 bg-bg-secondary border border-border-light rounded-lg flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-text-primary block">Lead Opportunity</span>
                      <span className="text-[11px] text-text-muted">Status: {l.status?.toUpperCase()} • Priority: {l.priority}</span>
                    </div>
                    <Link to={`/leads/${l.id}`} className="btn btn-secondary btn-sm text-[11px]">View Opportunity</Link>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Communications */}
          <div className="crm-card p-5 space-y-3">
            <h2 className="section-heading text-sm font-bold flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-ai-purple" />
              <span>Conversation History ({messages.length})</span>
            </h2>

            {messages.length === 0 ? (
              <p className="text-xs text-text-muted py-3">No messages logged yet.</p>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {messages.map((m) => (
                  <div key={m.id} className="p-3 bg-white border border-border-light rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className={`font-semibold uppercase ${m.direction === 'inbound' ? 'text-primary' : 'text-text-muted'}`}>
                        {m.channel} • {m.direction}
                      </span>
                      <span className="text-text-muted">{new Date(m.created_at).toLocaleString()}</span>
                    </div>
                    <p className="text-text-primary">{m.content}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
