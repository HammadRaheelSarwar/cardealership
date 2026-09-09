from pathlib import Path
p=Path('server/src/controllers/workspace.controller.ts');s=p.read_text();a=s.index('export async function completeTaskWithOutcome(');b=s.index('// ─── 5. Mark Lead Sold',a);s=s[:a]+'''export async function completeTaskWithOutcome(req: Request,res: Response,next: NextFunction): Promise<void> {
 try {
  const {outcome,note,nextTask,lostReason}=req.body;
  if(!outcome)throw new AppError('A task outcome is required',400);
  const {data,error}=await supabase.rpc('complete_crm_task',{p_dealership_id:req.tenant.dealershipId,p_task_id:req.params.id,p_actor_id:req.user.id,p_outcome:outcome,p_note:note??null,p_next_task:nextTask??null,p_lost_reason:lostReason??null});
  if(error)throw new AppError(`Unable to complete task: ${error.message}`,400);
  sendSuccess(res,{data,message:'Task completed'});
 }catch(e){next(e);}
}

'''+s[b:];s=s.replace('DateRangePreset, TaskOutcome, LostReason','DateRangePreset, LostReason');p.write_text(s)
for filename in ['sms','email']:
 p=Path('server/src/services/'+filename+'.service.ts');s=p.read_text().replace("import { logger } from '../utils/logger';\n",'');p.write_text(s)
# Remove fabricated trends and prose from the legacy endpoint as well.
p=Path('server/src/controllers/dashboard.controller.ts');s=p.read_text().replace("trend: '+12.5%',","trend: null,").replace("trend: '+8.4%',","trend: null,").replace('realAppointmentsToday || summary.appointmentsToday','realAppointmentsToday ?? 0');a=s.index('        aiInsight: {');b=s.index('        recentLeads:',a);s=s[:a]+'        aiInsight: null,\n'+s[b:];p.write_text(s)
p=Path('server/src/controllers/admin.controller.ts');s=p.read_text().replace("systemStatus: 'healthy'", "systemStatus: [totalDealerships,activeDealerships,totalUsers,totalLeads,totalMessages].some(r=>r.error) ? 'unavailable' : 'database_connected'");a=s.index('      sendSuccess(res,');s=s[:a]+"      for(const result of [totalDealerships,activeDealerships,totalUsers,totalLeads,totalMessages])if(result.error)throw new Error(result.error.message);\n"+s[a:];p.write_text(s)
