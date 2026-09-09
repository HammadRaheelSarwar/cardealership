from pathlib import Path
p=Path('client/src/services/workspaceService.ts')
s=p.read_text(); start=s.index('function workspaceData'); end=s.index('// ─── Salesperson')
helper=s[start:end]
p.write_text('''import api from './api';
import type { SalespersonWorkspaceData, ManagerWorkspaceData, OwnerWorkspaceData, DateRangePreset, TaskOutcome, LostReason } from '@crm/shared';

'''+helper+'''
export async function fetchSalespersonWorkspace(): Promise<SalespersonWorkspaceData> {
  return workspaceData((await api.get('/workspace/salesperson')).data);
}
export async function fetchManagerWorkspace(range: DateRangePreset = 'mtd'): Promise<ManagerWorkspaceData> {
  return workspaceData((await api.get('/workspace/manager', { params: { range } })).data);
}
export async function fetchOwnerWorkspace(range: DateRangePreset = 'mtd'): Promise<OwnerWorkspaceData> {
  return workspaceData((await api.get('/workspace/owner', { params: { range } })).data);
}
export async function completeTask(taskId: string, payload: {
  outcome: TaskOutcome; note?: string;
  nextTask?: { type: string; title: string; dueAt: string; description?: string }; lostReason?: LostReason;
}) {
  return (await api.post(`/workspace/tasks/${taskId}/complete`, payload)).data.data;
}
export async function markLeadSold(leadId: string, payload: { saleValue: number; vehicleId?: string; grossProfit?: number; netProfit?: number }) {
  return (await api.post(`/workspace/leads/${leadId}/sold`, payload)).data.data;
}
export async function markLeadLost(leadId: string, payload: { lostReason: LostReason }) {
  return (await api.post(`/workspace/leads/${leadId}/lost`, payload)).data.data;
}
''')
p=Path('client/src/pages/auth/LoginPage.tsx'); s=p.read_text(); a=s.index('  const DEMO_USERS'); b=s.index('  const performLogin'); s=s[:a]+s[b:]; s=s.replace("loginPass?: string, isDemoClick = false", "loginPass: string").replace("loginPass || 'DealerPro123!'",'loginPass'); a=s.index('      // If server'); b=s.index('      if (axios.isAxiosError',a); s=s[:a]+s[b:]; s=s.replace('performLogin(email, password, false)','performLogin(email, password)'); a=s.index('  const handleQuickDemoLogin'); b=s.index('  return (',a); s=s[:a]+s[b:]; a=s.index('          {/* Quick Demo'); b=s.index('          {error &&',a); s=s[:a]+s[b:]; p.write_text(s)
p=Path('client/src/pages/auth/RegisterPage.tsx'); s=p.read_text(); a=s.index('      if (err.response'); b=s.index('    } finally',a); s=s[:a]+"      setError(err.response?.data?.message || err.message || 'Unable to create your account. Please try again.');\n"+s[b:]; s=s.replace("api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;",'setAuth({ user, accessToken, memberships: [] });'); p.write_text(s)
p=Path('server/src/controllers/dealership.controller.ts'); s=p.read_text(); a=s.index('async function seedDemoData'); b=s.index('// ─── POST',a); s=s[:a]+s[b:]; s=s.replace('    // Seed rich demo data (vehicles, customers, leads, tasks, appointments)\n    await seedDemoDataForDealership(dealership.id, req.user.id);\n',''); s=s.replace('Dealership created with demo data','Dealership created'); p.write_text(s)
# A seed file must never populate sample business records during setup.
Path('supabase/seed.sql').write_text('-- No sample business records. Create your dealership through registration.\n')
Path('server/src/scripts/seed.ts').write_text("console.info('Sample data seeding has been removed. Create real records through the application.');\n")
p=Path('supabase/migrations/20260902000003_role_based_crm.sql'); s=p.read_text(); s=s[:s.index('-- 8. Seed/')]; p.write_text(s)
