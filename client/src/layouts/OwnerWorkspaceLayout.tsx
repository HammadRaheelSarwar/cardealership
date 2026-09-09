import { useLiveQuery } from '@/hooks/useLiveQuery';
import { fetchOwnerWorkspace } from '@/services/workspaceService';
import { money } from '@/components/common/LiveData';
import api from '@/services/api';
import { useActiveDealership } from '@/store/authStore';
import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users2,
  DollarSign,
  TrendingUp,
  BarChart3,
  Wallet,
  UserCog,
  Puzzle,
  Settings,
  LogOut,
  Car,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/utils/cn';

const OWNER_OVERVIEW_NAV = [
  {
    label: 'Dealership Performance',
    icon: LayoutDashboard,
    to: '/owner-overview',
  },
  { label: 'Managers / Teams', icon: Users2, to: '/managers' },
  { label: 'Sales Volume', icon: DollarSign, to: '/sales' },
  { label: 'Conversion Funnel', icon: TrendingUp, to: '/conversion' },
];

const OWNER_REPORTING_NAV = [
  { label: 'Performance Reports', icon: BarChart3, to: '/reports' },
  { label: 'Financial Reports', icon: Wallet, to: '/financial-reports' },
];

const OWNER_ADMIN_NAV = [
  { label: 'Team', icon: UserCog, to: '/team' },
  { label: 'Integrations', icon: Puzzle, to: '/integrations' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export function OwnerWorkspaceLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const dealership = useActiveDealership();
  const overview = useLiveQuery(['workspace', 'owner', 'mtd'], () =>
    fetchOwnerWorkspace('mtd')
  );

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
      {/* ── Owner Sidebar (Executive & Performance-Focused) ── */}
      <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-[rgba(255,255,255,0.06)] bg-[#090909] select-none z-30">
        {/* Dealership Executive Branding */}
        <div className="flex items-center gap-2.5 px-4 h-[52px] border-b border-[rgba(255,255,255,0.06)] shrink-0">
          <div className="w-6 h-6 rounded bg-[#141414] border border-[#D4AF37]/50 flex items-center justify-center shrink-0">
            <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate leading-none">
              {dealership?.dealershipId.name || 'Dealership'}
            </p>
            <p className="text-[10px] text-[#D4AF37] font-semibold mt-1 truncate">
              Executive Portal
            </p>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {/* OVERVIEW section */}
          <div>
            <span className="text-[10px] font-bold text-[#555555] uppercase tracking-wider block px-2.5 mb-1.5">
              Executive Overview
            </span>
            <div className="space-y-1">
              {OWNER_OVERVIEW_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors group font-medium',
                      isActive
                        ? 'bg-[#151515] text-[#E6C85C] border border-[rgba(212,175,55,0.35)] shadow-sm'
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

          {/* REPORTING section */}
          <div>
            <span className="text-[10px] font-bold text-[#555555] uppercase tracking-wider block px-2.5 mb-1.5">
              Business Reporting
            </span>
            <div className="space-y-1">
              {OWNER_REPORTING_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors group font-medium',
                      isActive
                        ? 'bg-[#151515] text-[#E6C85C] border border-[rgba(212,175,55,0.35)] shadow-sm'
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

          {/* ADMIN section */}
          <div>
            <span className="text-[10px] font-bold text-[#555555] uppercase tracking-wider block px-2.5 mb-1.5">
              Dealership Governance
            </span>
            <div className="space-y-1">
              {OWNER_ADMIN_NAV.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2.5 px-2.5 py-2 rounded-md text-xs transition-colors group font-medium',
                      isActive
                        ? 'bg-[#151515] text-[#E6C85C] border border-[rgba(212,175,55,0.35)] shadow-sm'
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

      {/* ── Main Executive Body ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden bg-[#070707]">
        {/* Owner Header */}
        <header className="h-[52px] border-b border-[rgba(255,255,255,0.06)] bg-[#070707] flex items-center px-4 sm:px-6 gap-3 shrink-0 z-20">
          <div>
            <h2 className="text-xs font-semibold text-white">
              Dealer Principal Overview
            </h2>
            <p className="text-[10px] text-[#6E6E6E]">Enterprise Operations</p>
          </div>

          <div className="flex items-center gap-3 ml-auto">
            {/* Executive KPI Ticker */}
            <div className="hidden lg:flex items-center gap-3 bg-[#111111] border border-white/[0.06] px-3 py-1 rounded-md text-xs">
              <span className="text-[#8C8C8C]">MTD Volume:</span>
              <span className="font-mono font-semibold text-[#E6C85C]">
                {overview.data ? money(overview.data.salesVolume) : '—'}
              </span>
              <span className="text-white/20">|</span>
              <span className="text-[#8C8C8C]">Units Sold:</span>
              <span className="font-mono font-semibold text-white">
                {overview.data?.unitsSold ?? '—'}
              </span>
            </div>

            <div className="w-[1px] h-4 bg-white/10 hidden sm:block" />

            {/* Profile Avatar */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#161616] border border-[#D4AF37] flex items-center justify-center text-xs font-bold text-[#E6C85C]">
                {user?.firstName?.charAt(0) || 'A'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-semibold text-white leading-none">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-[10px] text-[#D4AF37] mt-0.5">
                  Dealer Principal
                </p>
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
