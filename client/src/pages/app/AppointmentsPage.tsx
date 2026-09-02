import React, { useState } from 'react';
import {
  Calendar, Plus, Clock, Car, User, MapPin, CheckCircle2,
  AlertCircle, XCircle, ChevronRight
} from 'lucide-react';

interface DealershipAppointment {
  id: string;
  customerName: string;
  phone: string;
  vehicle: string;
  salesperson: string;
  type: 'test-drive' | 'showroom' | 'phone' | 'financing';
  time: string;
  date: string;
  status: 'confirmed' | 'scheduled' | 'completed' | 'no-show';
}

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<DealershipAppointment[]>([
    {
      id: '1',
      customerName: 'Emily Davis',
      phone: '+1 (555) 482-9912',
      vehicle: '2023 BMW 330i M Sport',
      salesperson: 'Sarah Parker',
      type: 'test-drive',
      date: 'Today',
      time: '2:00 PM',
      status: 'confirmed',
    },
    {
      id: '2',
      customerName: 'John Carter',
      phone: '+1 (555) 301-4492',
      vehicle: '2024 Toyota Camry XSE',
      salesperson: 'Shane Miller',
      type: 'financing',
      date: 'Tomorrow',
      time: '10:00 AM',
      status: 'scheduled',
    },
    {
      id: '3',
      customerName: 'David Wilson',
      phone: '+1 (555) 771-3320',
      vehicle: '2024 Ford F-150 SuperCrew',
      salesperson: 'Michael Brown',
      type: 'test-drive',
      date: 'Friday',
      time: '4:30 PM',
      status: 'scheduled',
    },
    {
      id: '4',
      customerName: 'Robert Taylor',
      phone: '+1 (555) 819-2041',
      vehicle: '2023 Honda Accord Sport',
      salesperson: 'Shane Miller',
      type: 'showroom',
      date: 'Yesterday',
      time: '11:00 AM',
      status: 'completed',
    },
  ]);

  const setStatus = (id: string, newStatus: DealershipAppointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold">Dealership Appointments & Test Drives</h1>
          <p className="page-subtitle text-xs">
            Manage customer showroom visits, scheduled test drives, and financing reviews.
          </p>
        </div>

        <button
          onClick={() => alert('Book appointment modal')}
          className="btn btn-primary btn-sm text-xs gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Appointment Cards Grid (§44) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {appointments.map((appt) => (
          <div
            key={appt.id}
            className="crm-card p-5 space-y-4 hover:border-primary/50 transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              {/* Type Badge & Status */}
              <div className="flex items-center justify-between">
                <span className="badge-purple font-bold uppercase text-[10px]">
                  {appt.type.replace('-', ' ')}
                </span>
                {appt.status === 'confirmed' && (
                  <span className="badge-success text-[10px] font-bold">Confirmed</span>
                )}
                {appt.status === 'scheduled' && (
                  <span className="badge-warning text-[10px] font-bold">Scheduled</span>
                )}
                {appt.status === 'completed' && (
                  <span className="badge-neutral text-[10px] font-bold">Completed</span>
                )}
                {appt.status === 'no-show' && (
                  <span className="badge-danger text-[10px] font-bold">No Show</span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-text-primary">{appt.customerName}</h3>
                <p className="text-xs text-text-muted">{appt.phone}</p>
              </div>

              {/* Vehicle & Date Time */}
              <div className="p-2.5 bg-bg-secondary rounded-lg space-y-1.5 text-xs text-text-secondary">
                <div className="flex items-center gap-1.5 font-medium text-text-primary">
                  <Car className="w-3.5 h-3.5 text-text-muted" />
                  <span>{appt.vehicle}</span>
                </div>
                <div className="flex items-center gap-1.5 text-primary font-bold">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{appt.date} at {appt.time}</span>
                </div>
                <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                  <User className="w-3.5 h-3.5" />
                  <span>Consultant: {appt.salesperson}</span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-border-light flex items-center justify-between gap-2">
              {appt.status !== 'completed' ? (
                <>
                  <button
                    type="button"
                    onClick={() => setStatus(appt.id, 'completed')}
                    className="btn btn-secondary btn-sm text-[11px] text-success hover:bg-green-50 flex-1 justify-center"
                  >
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Completed</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus(appt.id, 'no-show')}
                    className="btn btn-secondary btn-sm text-[11px] text-danger hover:bg-red-50"
                  >
                    No-Show
                  </button>
                </>
              ) : (
                <span className="text-xs text-text-muted">Deal in progress</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
