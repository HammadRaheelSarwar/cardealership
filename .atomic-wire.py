from pathlib import Path
import re
p=Path('server/src/controllers/workspace.controller.ts');s=p.read_text();a=s.index('export async function markLeadSold(');b=s.index('// ─── 6. Mark Lead Lost',a);s=s[:a]+'''export async function markLeadSold(req: Request,res: Response,next: NextFunction): Promise<void> {
 try {
  const {saleValue, grossProfit, netProfit, vehicleId}=req.body;
  if(typeof saleValue!=='number'||!Number.isFinite(saleValue)||saleValue<0)throw new AppError('Enter a valid sale value',400);
  for(const value of [grossProfit,netProfit])if(value!==undefined&&(typeof value!=='number'||!Number.isFinite(value)))throw new AppError('Enter valid profit figures',400);
  const {data,error}=await supabase.rpc('close_crm_deal',{p_dealership_id:req.tenant.dealershipId,p_lead_id:req.params.id,p_actor_id:req.user.id,p_sale_value:saleValue,p_gross_profit:grossProfit??null,p_net_profit:netProfit??null,p_vehicle_id:vehicleId??null});
  if(error)throw new AppError(`Unable to record sale: ${error.message}`,400);
  sendSuccess(res,{data:{lead:data},message:'Sale recorded'});
 }catch(e){next(e);}
}

'''+s[b:]
# Stage history is now recorded once by the database trigger.
s=re.sub(r'\s*await supabase\.from\(\'lead_stage_history\'\)\.insert\(\{.*?\}\);','',s,flags=re.S)
# Do not invent an appointment tomorrow when no appointment time was supplied.
a=s.find('      // If appointment was set, create');
if a>=0:
 b=s.index('\n    }',a);s=s[:a]+s[b:]
p.write_text(s)
p=Path('server/src/controllers/lead.controller.ts');s=p.read_text();s="import { markLeadSold as recordSale } from './workspace.controller';\n"+s;a=s.index('export async function markLeadSold(');b=s.index('// ─── GET /api/v1/leads/:id/activity',a);s=s[:a]+'''export async function markLeadSold(req: Request,res: Response,next: NextFunction): Promise<void> {
 req.body.saleValue=req.body.saleValue??req.body.soldValue;
 await recordSale(req,res,next);
}

'''+s[b:];s=s.replace("    if (!targetStage) throw new AppError('Pipeline stage not found', 404);","    if (!targetStage) throw new AppError('Pipeline stage not found', 404);\n    if (targetStage.type === 'won') throw new AppError('Use Mark sold and enter the sale value to close this deal',400);");p.write_text(s)
p=Path('client/src/services/liveData.ts');s=p.read_text();s=s.replace("    if (!Array.isArray(response.data.data))", "    const data = path.startsWith('/pipeline/stages') ? response.data.data?.stages : response.data.data;\n    if (!Array.isArray(data))").replace('normalize(response.data.data));','normalize(data));');p.write_text(s)
p=Path('server/src/controllers/task.controller.ts');s=p.read_text().replace('assigned_user:profiles(*)','assigned_user:profiles!tasks_assigned_user_id_fkey(*)');p.write_text(s)
p=Path('client/src/layouts/OwnerWorkspaceLayout.tsx');s=p.read_text();s="import { useLiveQuery } from '@/hooks/useLiveQuery';\nimport { fetchOwnerWorkspace } from '@/services/workspaceService';\nimport { money } from '@/components/common/LiveData';\n"+s;s=s.replace('  const dealership = useActiveDealership();',"  const dealership = useActiveDealership();\n  const overview = useLiveQuery(['workspace','owner','mtd'],()=>fetchOwnerWorkspace('mtd')); ");s=s.replace('>—<','>{overview.data ? money(overview.data.salesVolume) : \'—\'}<',1);s=s.replace('>—<',">{overview.data?.unitsSold ?? '—'}<",1);p.write_text(s)
p=Path('client/src/layouts/ManagerWorkspaceLayout.tsx');s=p.read_text().replace('Downtown Sales Team','Sales team');p.write_text(s)
p=Path('client/src/components/common/TopHeader.tsx');s=p.read_text().replace("'Premier Auto Group'","'Dealership'");s=s.replace('<span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />','');p.write_text(s)
p=Path('client/src/pages/auth/LoginPage.tsx');s=p.read_text();a=s.index('          {/* Active Deal Preview Card */}');b=s.index('\n        </div>',a);s=s[:a]+s[b:];p.write_text(s)
