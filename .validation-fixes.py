from pathlib import Path
p=Path('server/src/__tests__/role_workspace.test.ts');s=p.read_text().replace("describe('Role-Based CRM Architecture & Workflows', () => {", "describe('Role-Based CRM Architecture & Workflows', () => {\n  beforeEach(() => { jest.useFakeTimers(); jest.setSystemTime(new Date(2026, 8, 9, 12)); });\n  afterEach(() => jest.useRealTimers());");p.write_text(s)
p=Path('client/src/pages/auth/RegisterPage.tsx');s=p.read_text().replace('  const [step, setStep] = useState(1);',"  const [step, setStep] = useState(1);\n  const [registered, setRegistered] = useState<any>(null);\n  const [createdDealership, setCreatedDealership] = useState(false);")
s=s.replace("const regRes = await api.post('/auth/register', {", "const regRes = registered ? {data:{data:registered}} : await api.post('/auth/register', {");s=s.replace('      const { user, accessToken } = regRes.data.data;', '      const { user, accessToken } = regRes.data.data;\n      setRegistered(regRes.data.data);');s=s.replace('      setAuth({ user, accessToken, memberships: [] });','      useAuthStore.getState().setAccessToken(accessToken);');s=s.replace("      await api.post('/dealerships', {", "      if (!createdDealership) await api.post('/dealerships', {");s=s.replace('      // 4. Fetch updated me', '      setCreatedDealership(true);\n\n      // 4. Fetch updated me');s=s.replace('placeholder="Premier Auto Group"','placeholder="Your dealership name"')
# Avoid collecting invitations that were previously ignored.
a=s.find('            {step === 5 && (');
# Exact step-five block will be kept only if wired, below.
s=s.replace("      navigate('/dashboard');", '''      for (const [email,role] of [[formData.inviteEmail1,formData.inviteRole1],[formData.inviteEmail2,formData.inviteRole2]]) {
        if(email.trim()) {
          try { await api.post('/team',{email,role,firstName:email.split('@')[0],lastName:''}); }
          catch { /* Invitations can be retried from Team without repeating registration. */ }
        }
      }
      navigate('/dashboard');''')
# Remove this unwired invite flow entirely instead of silently ignoring invite failures.
a=s.index('      for (const [email,role]');b=s.index("      navigate('/dashboard');",a);s=s[:a]+s[b:]
# Step 5 communicates the real next step; invitations happen in the saved dealership.
start=s.find('        {step === 5 && (')
if start>=0:
 end=s.index('\n        )}',start)+11
 s=s[:start]+'''        {step === 5 && (
          <div className="space-y-3"><h2 className="text-lg font-semibold">Ready to create your dealership</h2><p className="text-sm text-gray-500">Your workspace starts with no customers, inventory, or sales. Invite your team from the Team page after setup.</p></div>
        )}'''+s[end:]
p.write_text(s)
p=Path('client/src/services/api.ts');s=p.read_text().replace("`${import.meta.env.VITE_API_URL.replace(/\\/$/, '')}/api/v1`", "`${import.meta.env.VITE_API_URL.replace(/\\/$/, '').replace(/\\/api\\/v1$/, '')}/api/v1`");p.write_text(s)
p=Path('server/src/controllers/ai.controller.ts');s=p.read_text().replace('        if (lead) {',"        if (!lead) throw new AppError('Lead not found',404);\n        if (req.tenant.role === 'salesperson' && lead.assigned_user_id !== req.user.id) throw new AppError('Lead access denied',403);\n        if (lead) {");p.write_text(s)
p=Path('client/src/components/common/LiveDetails.tsx');s=p.read_text().replace("'price_payment','financing_declined'", "'price','financing'");p.write_text(s)
p=Path('server/src/controllers/report.controller.ts');s=p.read_text();a=s.index('      const total =');s=s[:a]+"      for(const result of [totalLeads,wonLeads,lostLeads,totalCustomers,totalAppointments,overdueTasks,unreadMessages])if(result.error)throw new Error(result.error.message);\n"+s[a:];s=s.replace('data: stats }','data: stats, error }').replace("      sendSuccess(res, { data: stats || [] });", "      if(error)throw new Error(error.message);\n      sendSuccess(res, { data: stats || [] });");p.write_text(s)
p=Path('server/src/controllers/leadSource.controller.ts');s=p.read_text().replace('data: sources }','data: sources, error }').replace('    sendSuccess(res, { data: sources', '    if(error)throw new Error(error.message);\n    sendSuccess(res, { data: sources');p.write_text(s)
p=Path('server/src/config/env.ts');s=p.read_text();a=s.index('export const env =');s=s[:a]+'''if (parsed.data.NODE_ENV === 'production') {
  for (const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SUPABASE_ANON_KEY','JWT_ACCESS_SECRET','JWT_REFRESH_SECRET','CLIENT_URL']) {
    if (!process.env[key]) throw new Error(`Missing required production setting: ${key}`);
  }
}

'''+s[a:];p.write_text(s)
