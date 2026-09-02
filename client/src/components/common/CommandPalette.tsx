import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search, Plus, UserPlus, Calendar, CheckSquare, MessageSquare,
  Sparkles, Car, X, Command
} from 'lucide-react';

export function CommandPalette() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!open) return null;

  const actions = [
    { label: 'New Lead Opportunity', icon: Plus, link: '/leads' },
    { label: 'New Customer Record', icon: UserPlus, link: '/customers' },
    { label: 'Create New Task', icon: CheckSquare, link: '/tasks' },
    { label: 'Schedule Appointment', icon: Calendar, link: '/appointments' },
    { label: 'Open Shared Inbox', icon: MessageSquare, link: '/inbox' },
    { label: 'Open AI Command Center', icon: Sparkles, link: '/ai' },
    { label: 'Search Vehicles Inventory', icon: Car, link: '/vehicles' },
  ];

  const filtered = actions.filter((a) =>
    a.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (link: string) => {
    setOpen(false);
    navigate(link);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl border border-border-light w-full max-w-xl overflow-hidden space-y-2">
        {/* Input */}
        <div className="p-3 border-b border-border-light flex items-center gap-2">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search (e.g. New Lead, Open Inbox)..."
            className="w-full text-xs py-1 text-text-primary placeholder:text-text-muted border-none focus:outline-none"
            autoFocus
          />
          <button onClick={() => setOpen(false)} className="p-1 text-text-muted hover:text-text-primary rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* List */}
        <div className="max-h-72 overflow-y-auto p-2 space-y-1 text-xs">
          {filtered.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.label}
                onClick={() => handleSelect(action.link)}
                className="w-full p-2.5 rounded-lg hover:bg-bg-secondary flex items-center justify-between text-left transition group"
              >
                <div className="flex items-center gap-2.5 text-text-primary font-medium">
                  <Icon className="w-4 h-4 text-text-muted group-hover:text-primary" />
                  <span>{action.label}</span>
                </div>
                <span className="text-[10px] text-text-muted uppercase font-bold">Action</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
