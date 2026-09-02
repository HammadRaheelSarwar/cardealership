import React, { useState } from 'react';
import {
  CheckSquare, Plus, Clock, Phone, MessageSquare, Mail,
  Calendar, CheckCircle2, AlertTriangle, ChevronRight, Car
} from 'lucide-react';
import { getTaskDisplayStatus, TaskStatus } from '@crm/shared';

interface DealershipTask {
  id: string;
  title: string;
  leadName: string;
  vehicle: string;
  type: 'call' | 'sms' | 'email' | 'follow-up' | 'appointment' | 'general';
  priority: 'low' | 'medium' | 'high';
  dueAt: string;
  status: TaskStatus;
}

export default function TasksPage() {
  const [filter, setFilter] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');

  const [tasks, setTasks] = useState<DealershipTask[]>([
    {
      id: '1',
      title: 'Call John Carter re: financing approval',
      leadName: 'John Carter',
      vehicle: '2024 Toyota Camry XSE',
      type: 'call',
      priority: 'high',
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 2).toISOString(), // 2 hrs from now
      status: 'pending',
    },
    {
      id: '2',
      title: 'Send text with trade-in appraisal link',
      leadName: 'Emily Davis',
      vehicle: '2023 BMW 330i',
      type: 'sms',
      priority: 'high',
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 5).toISOString(),
      status: 'pending',
    },
    {
      id: '3',
      title: 'Follow up with David Wilson on towing package',
      leadName: 'David Wilson',
      vehicle: '2024 Ford F-150',
      type: 'follow-up',
      priority: 'medium',
      dueAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // Yesterday (overdue!)
      status: 'pending',
    },
    {
      id: '4',
      title: 'Confirm Saturday morning test drive slot',
      leadName: 'Robert Taylor',
      vehicle: '2023 Honda Accord Sport',
      type: 'appointment',
      priority: 'medium',
      dueAt: new Date(Date.now() + 1000 * 60 * 60 * 24).toISOString(),
      status: 'completed',
    },
  ]);

  const toggleTaskStatus = (id: string) => {
    setTasks((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: t.status === 'completed' ? 'pending' : 'completed' } : t))
    );
  };

  const filteredTasks = tasks.filter((t) => {
    const displayStatus = getTaskDisplayStatus(t.status, t.dueAt);
    if (filter === 'all') return true;
    if (filter === 'today') return displayStatus === 'today';
    if (filter === 'overdue') return displayStatus === 'overdue';
    if (filter === 'completed') return t.status === 'completed';
    return true;
  });

  return (
    <div className="space-y-4 animate-fade-in max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title text-2xl font-bold">Dealership Task Manager</h1>
          <p className="page-subtitle text-xs">
            Manage phone calls, follow-up messages, test drives, and scheduled reminders.
          </p>
        </div>

        <button
          onClick={() => alert('New task dialog')}
          className="btn btn-primary btn-sm text-xs gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>New Task</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white border border-border-light rounded-xl p-3 flex items-center gap-2 shadow-sm text-xs">
        {(['all', 'today', 'overdue', 'completed'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded font-semibold capitalize transition ${
              filter === tab
                ? 'bg-primary text-white'
                : 'text-text-secondary hover:bg-bg-secondary hover:text-text-primary'
            }`}
          >
            {tab === 'overdue' ? '⚠️ Overdue' : tab}
          </button>
        ))}
      </div>

      {/* Tasks List (§43) */}
      <div className="crm-card overflow-hidden divide-y divide-border-light">
        {filteredTasks.map((t) => {
          const displayStatus = getTaskDisplayStatus(t.status, t.dueAt);

          return (
            <div
              key={t.id}
              className={`p-4 flex items-center justify-between gap-4 hover:bg-bg-secondary/40 transition ${
                t.status === 'completed' ? 'opacity-60 bg-gray-50/50' : ''
              }`}
            >
              <div className="flex items-center gap-3.5">
                <button
                  type="button"
                  onClick={() => toggleTaskStatus(t.id)}
                  className={`w-5 h-5 rounded border flex items-center justify-center transition ${
                    t.status === 'completed'
                      ? 'bg-success border-success text-white'
                      : 'border-border-light hover:border-primary'
                  }`}
                >
                  {t.status === 'completed' && <CheckCircle2 className="w-3.5 h-3.5" />}
                </button>

                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold text-xs ${
                        t.status === 'completed' ? 'line-through text-text-muted' : 'text-text-primary'
                      }`}
                    >
                      {t.title}
                    </span>
                    {t.priority === 'high' && (
                      <span className="badge-danger text-[10px] font-bold">HIGH PRIORITY</span>
                    )}
                    {displayStatus === 'overdue' && (
                      <span className="badge-warning text-[10px] font-bold">OVERDUE</span>
                    )}
                    {displayStatus === 'today' && (
                      <span className="badge-purple text-[10px] font-bold">DUE TODAY</span>
                    )}
                  </div>

                  <div className="flex items-center gap-3 text-[11px] text-text-muted">
                    <span className="font-medium text-text-secondary">{t.leadName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Car className="w-3 h-3 text-text-muted" />
                      {t.vehicle}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <span className="text-[11px] text-text-muted font-medium">
                  {new Date(t.dueAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                <button
                  onClick={() => toggleTaskStatus(t.id)}
                  className="btn btn-ghost btn-sm text-xs font-semibold text-primary"
                >
                  {t.status === 'completed' ? 'Reopen' : 'Mark Done'}
                </button>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
          <div className="py-12 text-center text-xs text-text-muted">
            No tasks matching this filter.
          </div>
        )}
      </div>
    </div>
  );
}
