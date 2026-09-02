import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import {
  TrendingUp, Download
} from 'lucide-react';
import api from '@/services/api';
import { PageSkeleton } from '@/components/common/PageSkeleton';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState<'7d' | '30d' | '90d'>('30d');
  const [summary, setSummary] = useState<any>(null);
  const [sources, setSources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchReports() {
      try {
        setLoading(true);
        const [sumRes, srcRes] = await Promise.all([
          api.get('/reports/summary'),
          api.get('/reports/source-performance'),
        ]);
        setSummary(sumRes.data.data);
        setSources(srcRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, [dateRange]);

  if (loading) return <PageSkeleton />;

  const channelData = (sources || []).map((s) => ({
    name: s.source_name || 'Direct',
    leads: s.total_leads || 0,
    closed: s.won_deals || 0,
  }));

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold">Dealership Sales & Conversion Reports</h1>
          <p className="page-subtitle text-xs">
            Monitor response speeds, lead source ROI, salesperson closing rates, and lost deal analytics.
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="bg-white border border-border-light rounded-lg p-1 text-xs flex">
            {(['7d', '30d', '90d'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setDateRange(r)}
                className={`px-3 py-1 rounded font-semibold transition ${
                  dateRange === r ? 'bg-primary text-white' : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {r === '7d' ? 'Last 7 Days' : r === '30d' ? 'Last 30 Days' : 'Quarter to Date'}
              </button>
            ))}
          </div>

          <button
            onClick={() => alert('Report CSV exported')}
            className="btn btn-secondary btn-sm text-xs gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="metric-card">
          <span className="text-xs text-text-muted uppercase font-semibold">Total Inbound Leads</span>
          <div className="text-3xl font-bold text-text-primary mt-1">{summary?.totalLeads || 0}</div>
          <span className="text-xs font-semibold text-success flex items-center mt-0.5">
            <TrendingUp className="w-3 h-3 mr-1" /> Real-time DB Count
          </span>
        </div>

        <div className="metric-card">
          <span className="text-xs text-text-muted uppercase font-semibold">Conversion Rate</span>
          <div className="text-3xl font-bold text-text-primary mt-1">{summary?.conversionRate || '0.0%'}</div>
          <span className="text-xs font-semibold text-success flex items-center mt-0.5">
            <TrendingUp className="w-3 h-3 mr-1" /> Won vs Total Opportunities
          </span>
        </div>

        <div className="metric-card">
          <span className="text-xs text-text-muted uppercase font-semibold">Total Appointments</span>
          <div className="text-3xl font-bold text-text-primary mt-1">{summary?.totalAppointments || 0}</div>
          <span className="text-xs font-semibold text-text-muted mt-0.5">Scheduled & Showroom</span>
        </div>

        <div className="metric-card">
          <span className="text-xs text-text-muted uppercase font-semibold">Deals Closed (Won)</span>
          <div className="text-3xl font-bold text-success mt-1">{summary?.wonLeads || 0}</div>
          <span className="text-xs font-semibold text-text-muted mt-0.5">Delivered Units</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Volume by Channel */}
        <div className="crm-card p-5 space-y-4 lg:col-span-2">
          <div>
            <h2 className="section-heading text-base">Inbound Leads by Source Channel</h2>
            <p className="text-xs text-text-secondary mt-0.5">Total inquiries vs. closed vehicle deliveries</p>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={channelData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="name" stroke="#94A3B8" />
                <YAxis stroke="#94A3B8" />
                <Tooltip />
                <Bar dataKey="leads" fill="#2563EB" name="Total Inquiries" radius={[4, 4, 0, 0]} />
                <Bar dataKey="closed" fill="#16A34A" name="Deals Closed" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
