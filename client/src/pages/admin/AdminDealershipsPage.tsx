import React, { useEffect, useState } from 'react';
import { Building2, Shield, CheckCircle2, AlertTriangle, Search } from 'lucide-react';
import api from '@/services/api';
import { PageSkeleton } from '@/components/common/PageSkeleton';

export default function AdminDealershipsPage() {
  const [dealerships, setDealerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function fetchDealerships() {
      try {
        setLoading(true);
        const res = await api.get('/admin/dealerships');
        setDealerships(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchDealerships();
  }, []);

  const toggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await api.patch(`/admin/dealerships/${id}/status`, { status: nextStatus });
      setDealerships((prev) =>
        prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
      );
    } catch (err) {
      alert('Failed to update dealership status');
    }
  };

  if (loading) return <PageSkeleton />;

  const filtered = dealerships.filter((d) =>
    d.name.toLowerCase().includes(search.toLowerCase()) || d.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold">Platform Dealerships Administration</h1>
          <p className="page-subtitle text-xs">Manage tenant dealerships, domain slugs, and subscription status</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="crm-card p-3 flex items-center gap-2">
        <Search className="w-4 h-4 text-text-muted" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter dealerships by name or slug..."
          className="crm-input text-xs flex-1 border-none focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="crm-card overflow-hidden">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-border-light bg-bg-secondary text-text-muted font-bold uppercase text-[10px]">
              <th className="p-3">Dealership Name</th>
              <th className="p-3">Slug</th>
              <th className="p-3">Timezone</th>
              <th className="p-3">Status</th>
              <th className="p-3">Created Date</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-light">
            {filtered.map((d) => (
              <tr key={d.id} className="hover:bg-bg-secondary/40 transition">
                <td className="p-3 font-bold text-text-primary flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-primary" />
                  <span>{d.name}</span>
                </td>
                <td className="p-3 text-text-secondary font-mono text-[11px]">{d.slug}</td>
                <td className="p-3 text-text-muted">{d.timezone || 'UTC'}</td>
                <td className="p-3">
                  {d.status === 'active' ? (
                    <span className="badge-success text-[10px]">ACTIVE</span>
                  ) : (
                    <span className="badge-error text-[10px]">SUSPENDED</span>
                  )}
                </td>
                <td className="p-3 text-text-muted">{new Date(d.created_at).toLocaleDateString()}</td>
                <td className="p-3 text-right">
                  <button
                    onClick={() => toggleStatus(d.id, d.status)}
                    className={`btn btn-sm text-[11px] ${d.status === 'active' ? 'btn-danger' : 'btn-success'}`}
                  >
                    {d.status === 'active' ? 'Suspend' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
