import React, { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore, useActiveMembershipRole } from '@/store/authStore';
import { PageSkeleton } from '@/components/common/PageSkeleton';

// Role-Aware Workspace Layouts
import { SalesWorkspaceLayout } from '@/layouts/SalesWorkspaceLayout';
import { ManagerWorkspaceLayout } from '@/layouts/ManagerWorkspaceLayout';
import { OwnerWorkspaceLayout } from '@/layouts/OwnerWorkspaceLayout';
import { AppLayout } from '@/layouts/AppLayout';
import { PublicLayout } from '@/layouts/PublicLayout';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// Role-Specific Dashboards
const SalespersonDashboard = lazy(
  () => import('@/pages/app/SalespersonDashboard')
);
const ManagerDashboard = lazy(() => import('@/pages/app/ManagerDashboard'));
const OwnerDashboard = lazy(() => import('@/pages/app/OwnerDashboard'));

// Reused App Pages
const LeadDetailPage = lazy(() => import('@/pages/app/LeadDetailPage'));
const LeadsPage = lazy(() => import('@/pages/app/LeadsPage'));
const PipelinePage = lazy(() => import('@/pages/app/PipelinePage'));
const InboxPage = lazy(() => import('@/pages/app/InboxPage'));
const CustomersPage = lazy(() => import('@/pages/app/CustomersPage'));
const CustomerDetailPage = lazy(() => import('@/pages/app/CustomerDetailPage'));
const VehiclesPage = lazy(() => import('@/pages/app/VehiclesPage'));
const VehicleDetailPage = lazy(() => import('@/pages/app/VehicleDetailPage'));
const TasksPage = lazy(() => import('@/pages/app/TasksPage'));
const AppointmentsPage = lazy(() => import('@/pages/app/AppointmentsPage'));
const ReportsPage = lazy(() => import('@/pages/app/ReportsPage'));
const ActivityCoachingPage = lazy(
  () => import('@/pages/app/ActivityCoachingPage')
);
const ConversionFunnelPage = lazy(
  () => import('@/pages/app/ConversionFunnelPage')
);
const SalesVolumePage = lazy(() => import('@/pages/app/SalesVolumePage'));
const FinancialReportsPage = lazy(
  () => import('@/pages/app/FinancialReportsPage')
);
const ManagersComparisonPage = lazy(
  () => import('@/pages/app/ManagersComparisonPage')
);
const TeamPage = lazy(() => import('@/pages/app/TeamPage'));
const IntegrationsPage = lazy(() => import('@/pages/app/IntegrationsPage'));
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'));
const AutomationPage = lazy(() => import('@/pages/app/AutomationPage'));
const AutomationDetailPage = lazy(
  () => import('@/pages/app/AutomationDetailPage')
);
const AIPage = lazy(() => import('@/pages/app/AIPage'));

// Admin & Public pages
const AdminDashboardPage = lazy(
  () => import('@/pages/admin/AdminDashboardPage')
);
const AdminDealershipsPage = lazy(
  () => import('@/pages/admin/AdminDealershipsPage')
);
const LandingPage = lazy(() => import('@/pages/public/LandingPage'));

// ─── Guards ───────────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const { isAuthenticated } = useAuthStore();
  const role = useActiveMembershipRole();

  if (isAuthenticated) {
    if (!role)
      return location.pathname === '/register' ? (
        <>{children}</>
      ) : (
        <Navigate to="/register" replace />
      );
    if (role === 'salesperson') return <Navigate to="/my-pipeline" replace />;
    if (role === 'manager') return <Navigate to="/team-pipeline" replace />;
    return <Navigate to="/owner-overview" replace />;
  }
  return <>{children}</>;
}

function RoleGuard({
  allowedRoles,
  children,
}: {
  allowedRoles: Array<'salesperson' | 'manager' | 'owner'>;
  children: React.ReactNode;
}) {
  const { isAuthenticated } = useAuthStore();
  const role = useActiveMembershipRole() as
    'salesperson' | 'manager' | 'owner' | null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (role && !allowedRoles.includes(role)) {
    // Redirect to user's assigned role home
    if (role === 'salesperson') return <Navigate to="/my-pipeline" replace />;
    if (role === 'manager') return <Navigate to="/team-pipeline" replace />;
    return <Navigate to="/owner-overview" replace />;
  }
  return <>{children}</>;
}

function RoleHomeRedirect() {
  const role = useActiveMembershipRole();
  if (role === 'salesperson') return <Navigate to="/my-pipeline" replace />;
  if (role === 'manager') return <Navigate to="/team-pipeline" replace />;
  return <Navigate to="/owner-overview" replace />;
}

function AdaptiveWorkspaceLayout() {
  const role = useActiveMembershipRole();
  if (role === 'salesperson') return <SalesWorkspaceLayout />;
  if (role === 'manager') return <ManagerWorkspaceLayout />;
  return <OwnerWorkspaceLayout />;
}

// ─── App Routes ───────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* ── Public marketing ── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Auth ── */}
        <Route
          element={
            <PublicOnlyRoute>
              <PublicLayout />
            </PublicOnlyRoute>
          }
        >
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ── SHARED WORKSPACE ROUTES (Inbox, Appointments, Lead Detail, Reports) ── */}
        <Route
          element={
            <ProtectedRoute>
              <AdaptiveWorkspaceLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/reports" element={<ReportsPage />} />
        </Route>

        {/* ── 1. SALESPERSON WORKSPACE ROUTES (§3, §4, §24) ── */}
        <Route
          element={
            <RoleGuard allowedRoles={['salesperson']}>
              <SalesWorkspaceLayout />
            </RoleGuard>
          }
        >
          <Route path="/my-pipeline" element={<SalespersonDashboard />} />
          <Route path="/my-tasks" element={<TasksPage />} />
        </Route>

        {/* ── 2. MANAGER WORKSPACE ROUTES (§3, §12, §24) ── */}
        <Route
          element={
            <RoleGuard allowedRoles={['manager', 'owner']}>
              <ManagerWorkspaceLayout />
            </RoleGuard>
          }
        >
          <Route path="/team-pipeline" element={<ManagerDashboard />} />
          <Route path="/team-tasks" element={<TasksPage />} />
          <Route path="/salespeople" element={<TeamPage />} />
          <Route path="/salespeople/:id" element={<TeamPage />} />
          <Route path="/performance" element={<ActivityCoachingPage />} />
        </Route>

        {/* ── 3. OWNER WORKSPACE ROUTES (§3, §18, §24) ── */}
        <Route
          element={
            <RoleGuard allowedRoles={['owner']}>
              <OwnerWorkspaceLayout />
            </RoleGuard>
          }
        >
          <Route path="/owner-overview" element={<OwnerDashboard />} />
          <Route path="/managers" element={<ManagersComparisonPage />} />
          <Route path="/sales" element={<SalesVolumePage />} />
          <Route path="/conversion" element={<ConversionFunnelPage />} />
          <Route path="/financial-reports" element={<FinancialReportsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/automation" element={<AutomationPage />} />
          <Route path="/automation/:id" element={<AutomationDetailPage />} />
          <Route path="/ai" element={<AIPage />} />
        </Route>

        {/* ── General Leads & Inventory Workspace ── */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
        </Route>

        {/* ── Smart Role Dashboard Redirect ── */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <RoleHomeRedirect />
            </ProtectedRoute>
          }
        />
        <Route path="/app" element={<Navigate to="/dashboard" replace />} />

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
