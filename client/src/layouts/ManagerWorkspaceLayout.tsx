import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  Users, GitMerge, CheckSquare, Inbox, Calendar, BarChart3,
  TrendingUp, LogOut, Car, AlertTriangle
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const MANAGER_TEAM_NAV = [
  { label: 'Team Pipeline', icon: GitMerge, to: '/team-pipeline' },
  { label: 'Team Tasks', icon: CheckSquare, to: '/team-tasks' },
  { label: 'Appointments', icon: Calendar, to: '/appointments' },
  { label: 'Inbox', icon: Inbox, to: '/inbox' },
  { label: 'Salespeople', icon: Users, to: '/salespeople' },
];

const MANAGER_PERF_NAV = [
  { label: 'Activity & Coaching', icon: TrendingUp, to: '/performance' },
  { label: 'Reports', icon: BarChart3, to: '/reports' },
];

export function ManagerWorkspaceLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070707] text-white">
      {/* ── Manager Sidebar (Operational & Diagnostic) ── */}
      <aside className="hidden md:flex flex-col w-[230px] shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[#090909] select-none z-30">
        {/* Dealership Branding */}
        <div className="flex items-center gap-2.5 px-4 h-[52px] border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="w-6 h-6 rounded bg-[#141414] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
            <Car className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate leading-none">Premier Auto Group</p>
            <p className="text-[10px] text-purple-300 font-medium mt-1 truncate">Manager Portal</p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* TEAM section */}
          <div>
            <span className="text-[10px] font-bold text-[#555555] uppercase tracking-wider block px-2.5 mb-1.5">
              Team Operations
            </span>
            <div className="space-y-1">
              {MANAGER_TEAM_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors group font-medium',
                      isActive
                        ? 'bg-[#151515] text-[#E6C85C] border border-[rgba(212,175,55,0.3)] shadow-sm'
                        : 'text-[#8C8C8C] hover:text-white hover:bg-white/[0.04]'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-white" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>

          {/* PERFORMANCE section */}
          <div>
            <span className="text-[10px] font-bold text-[#555555] uppercase tracking-wider block px-2.5 mb-1.5">
              Accountability
            </span>
            <div className="space-y-1">
              {MANAGER_PERF_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors group font-medium',
                      isActive
                        ? 'bg-[#151515] text-[#E6C85C] border border-[rgba(212,175,55,0.3)] shadow-sm'
                        : 'text-[#8C8C8C] hover:text-white hover:bg-white/[0.04]'
                    )
                  }
                >
                  <item.icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-white" />
                  <span>{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </nav>

        {/* Overdue alert ticker */}
        <div className="p-3 mx-2 mb-2 rounded-lg bg-[#140F0F] border border-red-500/20">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-red-400">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Team Alert</span>
          </div>
          <p className="text-[10px] text-[#A0A0A0] mt-1 leading-snug">
            14 tasks overdue across 3 reps. Review coaching view.
          </p>
        </div>

        {/* Sign Out */}
        <div className="border-t border-[rgba(255,255,255,0.06)] p-2 bg-[#080808]">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2.5 px-3 py-1.5 rounded text-xs text-[#8C8C8C] hover:text-[#EF4444] hover:bg-red-500/10 w-full transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ── Main Manager Body ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#070707]">
        {/* Manager Header */}
        <header className="h-[52px] border-b border-[rgba(255,255,255,0.06)] bg-[#070707] flex items-center px-4 sm:px-6 gap-3 shrink-0 z-20">
          <div>
            <h2 className="text-xs font-semibold text-white">Downtown Sales Team</h2>
            <p className="text-[10px] text-[#6E6E6E]">Shane Miller (Manager)</p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Quick Overdue Badge */}
            <div
              onClick={() => navigate('/team-pipeline')}
              className="flex items-center gap-1.5 px-2.5 py-1 bg-red-950/40 border border-red-500/30 rounded-md text-[11px] text-red-300 cursor-pointer hover:bg-red-900/30 transition"
            >
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span>14 Overdue Tasks</span>
            </div>

            <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />

            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#161616] border border-purple-400/40 flex items-center justify-center text-xs font-bold text-purple-300">
                {user?.firstName?.charAt(0) || 'S'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-purple-300 mt-0.5">Sales Manager</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 bg-[#070707] text-white">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
