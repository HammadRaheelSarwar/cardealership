from pathlib import Path
p=Path('server/src/routes/automation.routes.ts');s=p.read_text();s="import { supabase } from '../config/supabase';\nimport { AppError } from '../utils/AppError';\n"+s; a=s.index('export default');s=s[:a]+'''
router.post('/:id/steps', async(req,res,next)=>{
 try {
  const record=await supabase.from('automations').select('id').eq('id',req.params.id).eq('dealership_id',req.tenant.dealershipId).single();
  if(record.error)throw new AppError('Automation not found',404);
  const {type,config}=req.body;
  if(!['task','delay','sms','email'].includes(type))throw new AppError('Invalid step type',400);
  const last=await supabase.from('automation_steps').select('step_order').eq('automation_id',req.params.id).eq('dealership_id',req.tenant.dealershipId).order('step_order',{ascending:false}).limit(1);
  if(last.error)throw new AppError(last.error.message,503);
  const result=await supabase.from('automation_steps').insert({automation_id:req.params.id,dealership_id:req.tenant.dealershipId,type,config,step_order:(last.data?.[0]?.step_order??-1)+1}).select().single();
  if(result.error)throw new AppError(result.error.message,400);
  res.json({success:true,data:result.data});
 }catch(e){next(e);}
});
router.patch('/:id/steps/:stepId',async(req,res,next)=>{
 try{const result=await supabase.from('automation_steps').delete().eq('automation_id',req.params.id).eq('id',req.params.stepId).eq('dealership_id',req.tenant.dealershipId).select().single();
 if(result.error)throw new AppError('Step not found',404);res.json({success:true,data:result.data});}catch(e){next(e);}
});
''' + s[a:];p.write_text(s)
p=Path('client/src/pages/app/IntegrationsPage.tsx');s=p.read_text();a=s.index('  const [status,');b=s.index('  const integrations =',a);s=s[:a]+'''  const query = useLiveQuery(['integrations'], () => readData('/integrations/status'));
  const status = query.data;
  if (query.isPending) return <PageSkeleton />;
  if (query.isError) return <p role="alert" className="text-red-400">{query.error.message}</p>;

'''+s[b:];s="import { useLiveQuery } from '@/hooks/useLiveQuery';\nimport { readData } from '@/services/liveData';\n"+s;s=s.replace('?? true','?? false');p.write_text(s)
