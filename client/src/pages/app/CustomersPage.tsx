import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UserCircle, Plus, Search, Phone, Mail, MapPin,
  Car, ShieldCheck, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function CustomersPage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const customers = [
    {
      id: '1',
      firstName: 'John',
      lastName: 'Carter',
      phone: '+1 (555) 301-4492',
      email: 'john.carter@gmail.com',
      location: 'Austin, TX',
      activeLeads: 1,
      vehicleInterest: '2024 Toyota Camry XSE',
      assignedTo: 'Shane Miller',
      preferredMethod: 'SMS',
      doNotContact: false,
    },
    {
      id: '2',
      firstName: 'Emily',
      lastName: 'Davis',
      phone: '+1 (555) 482-9912',
      email: 'emily.davis@outlook.com',
      location: 'Round Rock, TX',
      activeLeads: 1,
      vehicleInterest: '2023 BMW 330i M Sport',
      assignedTo: 'Sarah Parker',
      preferredMethod: 'Email',
      doNotContact: false,
    },
    {
      id: '3',
      firstName: 'David',
      lastName: 'Wilson',
      phone: '+1 (555) 771-3320',
      email: 'david.wilson@yahoo.com',
      location: 'Cedar Park, TX',
      activeLeads: 1,
      vehicleInterest: '2024 Ford F-150 SuperCrew',
      assignedTo: 'Michael Brown',
      preferredMethod: 'Phone',
      doNotContact: false,
    },
    {
      id: '4',
      firstName: 'Jessica',
      lastName: 'Anderson',
      phone: '+1 (555) 604-1294',
      email: 'jess.anderson@gmail.com',
      location: 'Georgetown, TX',
      activeLeads: 0,
      vehicleInterest: '2024 Hyundai Tucson',
      assignedTo: 'Sarah Parker',
      preferredMethod: 'SMS',
      doNotContact: false,
    },
  ];

  const filtered = customers.filter((c) => {
    const s = searchTerm.toLowerCase();
    return (
      `${c.firstName} ${c.lastName}`.toLowerCase().includes(s) ||
      c.phone.includes(s) ||
      c.email.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-4 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold">Dealership Customer Directory</h1>
          <p className="page-subtitle text-xs">
            Complete database of automotive buyers, buying history, active opportunities, and communication consent.
          </p>
        </div>

        <button
          onClick={() => alert('New customer modal')}
          className="btn btn-primary btn-sm text-xs gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-border-light rounded-xl p-3 flex items-center justify-between shadow-sm">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by customer name, phone number, email address..."
            className="crm-input pl-9 py-1.5 text-xs"
          />
        </div>
        <span className="text-xs text-text-muted font-medium">{filtered.length} Customers Found</span>
      </div>

      {/* Customers Table (§40) */}
      <div className="crm-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-bg-secondary text-text-muted uppercase font-semibold border-b border-border-light">
              <tr>
                <th className="px-5 py-3.5">Customer Name</th>
                <th className="px-5 py-3.5">Contact Information</th>
                <th className="px-5 py-3.5">Vehicle Interest</th>
                <th className="px-5 py-3.5">Assigned Consultant</th>
                <th className="px-5 py-3.5">Active Leads</th>
                <th className="px-5 py-3.5">Consent</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-light">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  onClick={() => navigate(`/customers/${c.id}`)}
                  className="hover:bg-bg-secondary/60 cursor-pointer transition"
                >
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-text-primary">
                      {c.firstName} {c.lastName}
                    </div>
                    <div className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-text-muted" />
                      <span>{c.location}</span>
                    </div>
                  </td>

                  <td className="px-5 py-3.5 space-y-0.5">
                    <div className="font-medium text-text-primary">{c.phone}</div>
                    <div className="text-[11px] text-text-muted">{c.email}</div>
                  </td>

                  <td className="px-5 py-3.5">
                    <div className="font-medium text-text-primary">{c.vehicleInterest}</div>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-text-secondary">{c.assignedTo}</span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="badge-purple font-bold text-[11px]">
                      {c.activeLeads} Open
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="badge-success text-[11px] flex items-center gap-1 font-semibold w-fit">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Opted-In</span>
                    </span>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/customers/${c.id}`);
                      }}
                      className="btn btn-ghost btn-sm text-primary font-semibold hover:bg-primary/10"
                    >
                      View Profile →
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
