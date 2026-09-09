import api from '@/services/api';
import { useActiveDealership } from '@/store/authStore';
import React from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  GitMerge,
  CheckSquare,
  Inbox,
  Calendar,
  Search,
  LogOut,
  Car,
  Sparkles,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const SALES_NAV = [
  { label: 'My Pipeline', icon: GitMerge, to: '/my-pipeline' },
  { label: 'My Tasks', icon: CheckSquare, to: '/my-tasks' },
  { label: 'Inbox', icon: Inbox, to: '/inbox' },
  { label: 'Appointments', icon: Calendar, to: '/appointments' },
];

export function SalesWorkspaceLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dealership = useActiveDealership();
  const location = useLocation();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* Clear local session even when disconnected. */
    }
    logout();
    navigate('/login');
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#070707] text-white">
      {/* ── Desktop Sales Sidebar (Focused & Minimal) ── */}
      <aside className="hidden md:flex flex-col w-[220px] shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[#090909] select-none z-30">
        {/* Dealership Branding */}
        <div className="flex items-center gap-2.5 px-4 h-[52px] border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="w-6 h-6 rounded bg-[#141414] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
            <Car className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate leading-none">
              {dealership?.dealershipId.name || 'Dealership'}
            </p>
            <p className="text-[10px] text-[#D4AF37] font-medium mt-1 truncate">
              Sales Workspace
            </p>
          </div>
        </div>

        {/* Sales Navigation */}
        <div className="px-3 pt-4 pb-2">
          <span className="text-[10px] font-bold text-[#555555] uppercase tracking-wider block px-2">
            My Work
          </span>
        </div>
        <nav className="flex-1 px-2 space-y-1">
          {SALES_NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors group font-medium',
                  isActive
                    ? 'bg-[#141414] text-[#E6C85C] border border-[rgba(212,175,55,0.3)] shadow-sm'
                    : 'text-[#8C8C8C] hover:text-white hover:bg-white/[0.04]'
                )
              }
            >
              <item.icon className="w-4 h-4 shrink-0 transition-colors group-hover:text-white" />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Task Zero Reminder Footer */}
        <div className="p-3 mx-2 mb-2 rounded-lg bg-[#0F0F0F] border border-[rgba(212,175,55,0.2)]">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#D4AF37]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Daily Objective</span>
          </div>
          <p className="text-[10px] text-[#A0A0A0] mt-1 leading-snug">
            Get tasks due to zero. Move customers forward.
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

      {/* ── Main Workspace Body ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#070707]">
        {/* Sales Header */}
        <header className="h-[52px] border-b border-[rgba(255,255,255,0.06)] bg-[#070707] flex items-center px-4 sm:px-6 gap-3 shrink-0 z-20">
          {/* Quick Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#6E6E6E]" />
              <input
                type="text"
                placeholder="Search my leads or vehicle interest..."
                className="w-full bg-[#0F0F0F] border border-[rgba(255,255,255,0.06)] hover:border-white/15 focus:border-[#D4AF37] rounded-md pl-8 pr-3 py-1.5 text-xs text-white placeholder-[#555555] transition-colors focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Salesperson Profile pill */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#161616] border border-[#D4AF37]/40 flex items-center justify-center text-xs font-bold text-[#E6C85C]">
                {user?.firstName?.charAt(0) || 'S'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-[#8C8C8C] mt-0.5">Sales Rep</p>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable View */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 pb-20 md:pb-6 bg-[#070707] text-white">
          <Outlet />
        </main>

        {/* ── Mobile Bottom Navigation Bar (Section 42) ── */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 h-14 bg-[#0A0A0A] border-t border-[rgba(255,255,255,0.08)] flex items-center justify-around px-2 z-40">
          {SALES_NAV.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 py-1 px-3 rounded-lg text-[10px] font-medium transition-colors',
                  isActive
                    ? 'text-[#E6C85C]'
                    : 'text-[#777777] hover:text-white'
                )}
              >
                <item.icon
                  className={cn('w-4 h-4', isActive && 'text-[#D4AF37]')}
                />
                <span>{item.label.replace('My ', '')}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
