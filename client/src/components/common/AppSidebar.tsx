import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Users, GitMerge, Inbox, UserCircle, Car,
  CheckSquare, Calendar, Zap, Sparkles, BarChart3, UserCog,
  Puzzle, Settings, HelpCircle, ChevronLeft, ChevronRight,
  LogOut, Shield
} from 'lucide-react';
import { useAuthStore, useActiveDealership } from '@/store/authStore';
import { cn } from '@/utils/cn';
import api from '@/services/api';

const NAV_WORK = [
  { label: 'Dashboard', icon: LayoutDashboard, to: '/dashboard' },
  { label: 'Leads', icon: Users, to: '/leads' },
  { label: 'Inbox', icon: Inbox, to: '/inbox' },
  { label: 'Pipeline', icon: GitMerge, to: '/pipeline' },
];

const NAV_OPERATIONS = [
  { label: 'Customers', icon: UserCircle, to: '/customers' },
  { label: 'Vehicles', icon: Car, to: '/vehicles' },
  { label: 'Tasks', icon: CheckSquare, to: '/tasks' },
  { label: 'Appointments', icon: Calendar, to: '/appointments' },
];

const NAV_INTELLIGENCE = [
  { label: 'Automation', icon: Zap, to: '/automation' },
  { label: 'AI Assistant', icon: Sparkles, to: '/ai' },
  { label: 'Reports', icon: BarChart3, to: '/reports' },
];

const NAV_ADMIN = [
  { label: 'Team', icon: UserCog, to: '/team' },
  { label: 'Integrations', icon: Puzzle, to: '/integrations' },
  { label: 'Settings', icon: Settings, to: '/settings' },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuthStore();
  const activeMembership = useActiveDealership();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout');
    } finally {
      logout();
      navigate('/login');
    }
  };

  const sidebarWidth = collapsed ? 'w-[68px]' : 'w-[230px]';

  return (
    <aside
      className={cn(
        'h-screen flex flex-col border-r border-[rgba(255,255,255,0.06)] bg-[#0A0A0A] shrink-0 z-30',
        'transition-all duration-150 ease-out select-none',
        sidebarWidth
      )}
    >
      {/* ── Dealership Branding (Small & Refined) ── */}
      <div className="flex items-center gap-2.5 px-4 h-[52px] border-b border-[rgba(255,255,255,0.06)] shrink-0">
        <div className="w-6 h-6 rounded bg-[#141414] border border-[rgba(255,255,255,0.1)] flex items-center justify-center shrink-0">
          <Car className="w-3.5 h-3.5 text-[#D4AF37]" />
        </div>
        {!collapsed && (
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-semibold text-white truncate leading-none">
              {activeMembership?.dealershipId.name ?? 'DealerOS CRM'}
            </p>
            <p className="text-[10px] text-[#6E6E6E] mt-1 truncate">
              {activeMembership?.role ?? 'Platform Admin'}
            </p>
          </div>
        )}
      </div>

      {/* ── Navigation Sections (WORK, OPERATIONS, INTELLIGENCE, ADMIN) ── */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-4">
        <SidebarSection label="WORK" items={NAV_WORK} collapsed={collapsed} />
        <SidebarSection label="OPERATIONS" items={NAV_OPERATIONS} collapsed={collapsed} />
        <SidebarSection label="INTELLIGENCE" items={NAV_INTELLIGENCE} collapsed={collapsed} />
        <SidebarSection label="ADMIN" items={NAV_ADMIN} collapsed={collapsed} />
      </nav>

      {/* ── Bottom Controls ── */}
      <div className="border-t border-[rgba(255,255,255,0.06)] p-2 space-y-0.5 bg-[#090909]">
        <button
          onClick={handleLogout}
          className={cn(
            'flex items-center gap-2.5 px-3 py-1.5 rounded text-xs text-[#8C8C8C] hover:text-[#EF4444] hover:bg-red-500/10 w-full transition-colors',
            collapsed && 'justify-center px-0'
          )}
          title="Sign Out"
        >
          <LogOut className="w-3.5 h-3.5 shrink-0" />
          {!collapsed && <span>Sign Out</span>}
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className={cn(
            'flex items-center gap-2.5 px-3 py-1.5 rounded text-xs text-[#6E6E6E] hover:text-white hover:bg-white/5 w-full transition-colors',
            collapsed && 'justify-center px-0'
          )}
          title={collapsed ? 'Expand' : 'Collapse'}
        >
          {collapsed ? (
            <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <>
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

function SidebarSection({
  label,
  items,
  collapsed,
}: {
  label: string;
  items: { label: string; icon: any; to: string }[];
  collapsed: boolean;
}) {
  return (
    <div>
      {!collapsed && (
        <p className="px-3 mb-1 text-[10px] font-semibold text-[#5A5A5A] uppercase tracking-wider">
          {label}
        </p>
      )}
      <div className="space-y-0.5">
        {items.map(({ label: itemLabel, icon: Icon, to }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-2.5 px-3 py-1.5 text-xs font-medium transition-colors w-full',
                isActive
                  ? 'border-l-2 border-[#D4AF37] text-white bg-[#141414] font-semibold pl-[10px]'
                  : 'text-[#8C8C8C] hover:text-white hover:bg-white/[0.03] border-l-2 border-transparent',
                collapsed && 'justify-center px-0 border-l-0'
              )
            }
            title={collapsed ? itemLabel : undefined}
          >
            {({ isActive }) => (
              <>
                <Icon
                  className={cn(
                    'w-3.5 h-3.5 shrink-0 transition-colors',
                    isActive ? 'text-[#D4AF37]' : 'text-[#6E6E6E]'
                  )}
                />
                {!collapsed && <span className="truncate">{itemLabel}</span>}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}
