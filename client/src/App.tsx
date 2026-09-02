import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

// Layouts
import { AppLayout } from '@/layouts/AppLayout';
import { PublicLayout } from '@/layouts/PublicLayout';

// Auth pages
import LoginPage from '@/pages/auth/LoginPage';
import RegisterPage from '@/pages/auth/RegisterPage';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';

// App pages (lazy loaded for code splitting)
import { lazy, Suspense } from 'react';
import { PageSkeleton } from '@/components/common/PageSkeleton';

const DashboardPage = lazy(() => import('@/pages/app/DashboardPage'));
const LeadsPage = lazy(() => import('@/pages/app/LeadsPage'));
const LeadDetailPage = lazy(() => import('@/pages/app/LeadDetailPage'));
const PipelinePage = lazy(() => import('@/pages/app/PipelinePage'));
const InboxPage = lazy(() => import('@/pages/app/InboxPage'));
const CustomersPage = lazy(() => import('@/pages/app/CustomersPage'));
const CustomerDetailPage = lazy(() => import('@/pages/app/CustomerDetailPage'));
const VehiclesPage = lazy(() => import('@/pages/app/VehiclesPage'));
const VehicleDetailPage = lazy(() => import('@/pages/app/VehicleDetailPage'));
const TasksPage = lazy(() => import('@/pages/app/TasksPage'));
const AppointmentsPage = lazy(() => import('@/pages/app/AppointmentsPage'));
const AutomationPage = lazy(() => import('@/pages/app/AutomationPage'));
const AutomationDetailPage = lazy(() => import('@/pages/app/AutomationDetailPage'));
const AIPage = lazy(() => import('@/pages/app/AIPage'));
const ReportsPage = lazy(() => import('@/pages/app/ReportsPage'));
const TeamPage = lazy(() => import('@/pages/app/TeamPage'));
const IntegrationsPage = lazy(() => import('@/pages/app/IntegrationsPage'));
const SettingsPage = lazy(() => import('@/pages/app/SettingsPage'));

// Admin pages
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage'));
const AdminDealershipsPage = lazy(() => import('@/pages/admin/AdminDealershipsPage'));

// Public/marketing pages
const LandingPage = lazy(() => import('@/pages/public/LandingPage'));

// ─── Guards ───────────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (user?.platformRole !== 'superAdmin') return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

// ─── App Routes ───────────────────────────────────────────────────────────────

export default function App() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Routes>
        {/* ── Public marketing ── */}
        <Route path="/" element={<LandingPage />} />

        {/* ── Auth ── */}
        <Route element={<PublicOnlyRoute><PublicLayout /></PublicOnlyRoute>}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
        </Route>

        {/* ── App (protected) ── */}
        <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/leads/:id" element={<LeadDetailPage />} />
          <Route path="/pipeline" element={<PipelinePage />} />
          <Route path="/inbox" element={<InboxPage />} />
          <Route path="/customers" element={<CustomersPage />} />
          <Route path="/customers/:id" element={<CustomerDetailPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/vehicles/:id" element={<VehicleDetailPage />} />
          <Route path="/tasks" element={<TasksPage />} />
          <Route path="/appointments" element={<AppointmentsPage />} />
          <Route path="/automation" element={<AutomationPage />} />
          <Route path="/automation/:id" element={<AutomationDetailPage />} />
          <Route path="/ai" element={<AIPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/integrations" element={<IntegrationsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/app" element={<Navigate to="/dashboard" replace />} />
        </Route>

        {/* ── Super Admin ── */}
        <Route element={<AdminRoute><AppLayout /></AdminRoute>}>
          <Route path="/admin" element={<AdminDashboardPage />} />
          <Route path="/admin/dealerships" element={<AdminDealershipsPage />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}
