from pathlib import Path
p=Path('server/src/controllers/ai.controller.ts');s=p.read_text();s="import { AppError } from '../utils/AppError';\n"+s;s=s.replace("'*, customer:customers(*), vehicle:vehicles(*)'","'*, customer:customers(*), vehicle:vehicles(*), stage:pipeline_stages(*)'");s=s.replace("currentStage: 'Follow-Up',","currentStage: lead.stage?.name || 'No stage recorded',").replace("recentMessages: lead.notes ? [lead.notes] : ['Interested in flexible financing'],","recentMessages: lead.notes ? [lead.notes] : [],");s=s.replace("      const summary = await aiService.summarizeLead(leadData);","      if (!leadId) throw new AppError('Select a lead to summarize',400);\n      const summary = await aiService.summarizeLead(leadData);");s=s.replace("      const dealershipName = 'Premier Auto Group';",'''      const dealershipName = req.dealership.name;
      let leadsQuery = supabase.from('leads').select('id,status,temperature,notes,created_at,assigned_user_id').eq('dealership_id',req.tenant.dealershipId).is('deleted_at',null).order('updated_at',{ascending:false}).limit(100);
      let tasksQuery = supabase.from('tasks').select('title,status,due_at,assigned_user_id').eq('dealership_id',req.tenant.dealershipId).is('deleted_at',null).order('due_at').limit(100);
      if(req.tenant.role==='salesperson'){leadsQuery=leadsQuery.eq('assigned_user_id',req.user.id);tasksQuery=tasksQuery.eq('assigned_user_id',req.user.id);}
      if(req.tenant.role==='manager'){
        const team=await supabase.from('manager_team_members').select('salesperson_user_id').eq('dealership_id',req.tenant.dealershipId).eq('manager_user_id',req.user.id);
        if(team.error)throw new AppError('Unable to load team',503);
        const ids=[req.user.id,...(team.data||[]).map(t=>t.salesperson_user_id)];leadsQuery=leadsQuery.in('assigned_user_id',ids);tasksQuery=tasksQuery.in('assigned_user_id',ids);
      }
      const [leads,tasks]=await Promise.all([leadsQuery,tasksQuery]);
      if(leads.error||tasks.error)throw new AppError('Unable to load records for AI analysis',503);''');s=s.replace("processCommand(query || '', dealershipName)","processCommand(query || '', dealershipName, {leads:leads.data,tasks:tasks.data,asOf:new Date().toISOString()})");p.write_text(s)
p=Path('client/src/pages/app/AIPage.tsx');s=p.read_text().replace('} catch (err) {','} catch (err: any) {').replace("'AI provider is processing pipeline insights. Currently running in rule-based intelligence mode.'","err.response?.data?.message || err.message || 'Unable to contact the AI provider.'");p.write_text(s)
# Use isolated auth clients so signing in never replaces the backend service-role session.
p=Path('server/src/config/supabase.ts');s=p.read_text()+'''\nexport function createAuthClient() {
  return createClient(env.SUPABASE_URL, env.SUPABASE_ANON_KEY || env.SUPABASE_SERVICE_ROLE_KEY, {auth:{persistSession:false,autoRefreshToken:false}});
}
''';p.write_text(s)
p=Path('server/src/controllers/auth.controller.ts');s=p.read_text().replace("import { supabase }", "import { supabase, createAuthClient }").replace('supabase.auth.signInWithPassword','createAuthClient().auth.signInWithPassword').replace('supabase.auth.resetPasswordForEmail','createAuthClient().auth.resetPasswordForEmail').replace('supabase.auth.verifyOtp','createAuthClient().auth.verifyOtp');s=s.replace('    await session(req, res, profile, 201);', '''    const confirmation = await createAuthClient().auth.resend({type:'signup',email,options:{emailRedirectTo:`${env.CLIENT_URL}/login`}});
    if(confirmation.error) throw new AppError('Account created, but confirmation email could not be sent. Request a password reset to verify access.',503);
    await session(req, res, profile, 201);''');p.write_text(s)
p=Path('client/src/pages/auth/ResetPasswordPage.tsx');s=p.read_text().replace("const token = searchParams.get('token') || '';","const token = searchParams.get('token') || new URLSearchParams(window.location.hash.slice(1)).get('access_token') || '';");p.write_text(s)
