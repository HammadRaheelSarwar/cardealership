import { Search, Plus, Bell, Sparkles, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, useActiveDealership } from '@/store/authStore';

export function TopHeader() {
  const { user } = useAuthStore();
  const membership = useActiveDealership();
  const navigate = useNavigate();

  return (
    <header className="h-[52px] border-b border-[rgba(255,255,255,0.06)] bg-[#070707] flex items-center px-5 gap-4 shrink-0 z-20">
      {/* ── Global Search (Dominant & Quiet) ── */}
      <div className="flex-1 max-w-lg">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6E6E6E]" />
          <input
            type="text"
            placeholder="Search leads, stock #, VIN, customers (⌘K)..."
            className="w-full bg-[#0F0F0F] border border-[rgba(255,255,255,0.06)] hover:border-white/15 focus:border-[#D4AF37] rounded-md pl-8 pr-10 py-1.5 text-xs text-white placeholder-[#555555] transition-colors"
            onClick={() => navigate('/leads')}
            readOnly
          />
          <kbd className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-[#6E6E6E] bg-white/[0.04] px-1 py-0.5 rounded">
            ⌘K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-2.5 ml-auto">
        {/* Dealership Switcher */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded text-xs text-[#A0A0A0] hover:text-white transition-colors cursor-pointer">
          <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
          <span className="font-medium text-white truncate max-w-[130px]">
            {membership?.dealershipId?.name || 'Premier Auto Group'}
          </span>
          <ChevronDown className="w-3 h-3 text-[#6E6E6E]" />
        </div>

        <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />

        {/* Subtle Ask AI Action (Quiet icon button) */}
        <button
          onClick={() => navigate('/ai')}
          className="p-1.5 rounded text-[#8C8C8C] hover:text-[#D4AF37] hover:bg-white/[0.04] transition-colors"
          title="Ask AI Sales Assistant"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => navigate('/dashboard')}
          className="p-1.5 rounded text-[#8C8C8C] hover:text-white hover:bg-white/[0.04] transition-colors relative"
          title="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
        </button>

        {/* Compact + New Lead Button (The single primary action on header) */}
        <button
          onClick={() => navigate('/leads')}
          className="btn-primary btn-sm text-xs font-semibold gap-1 ml-1"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Lead</span>
        </button>

        {/* Profile Avatar */}
        <div
          onClick={() => navigate('/settings')}
          className="w-7 h-7 rounded bg-[#141414] border border-[rgba(255,255,255,0.1)] flex items-center justify-center text-xs font-bold text-[#E6C85C] cursor-pointer hover:border-[#D4AF37] transition-colors ml-1 shrink-0"
          title={`${user?.firstName} ${user?.lastName}`}
        >
          {user?.firstName?.charAt(0) ?? 'A'}
          {user?.lastName?.charAt(0) ?? 'M'}
        </div>
      </div>
    </header>
  );
}
