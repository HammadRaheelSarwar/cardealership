from pathlib import Path
for filename,role in [('OwnerDashboard','owner'),('ManagerDashboard','manager'),('SalespersonDashboard','salesperson')]:
 p=Path('client/src/pages/app')/(filename+'.tsx'); s=p.read_text(); s="import { useLiveQuery } from '@/hooks/useLiveQuery';\n"+s
 a=s.index('  const [loading,'); b=s.index('\n',s.index('  const [workspace,',a))+1; s=s[:a]+s[b:]
 a=s.index('  useEffect(() =>'); b=s.index('\n  };',s.index('  const loadWorkspace',a))+5
 title=role.capitalize(); expr=f'fetch{title}Workspace('+('' if role=='salesperson' else 'range')+')'
 replacement=f"  const workspaceQuery = useLiveQuery(['workspace', '{role}'"+('' if role=='salesperson' else ', range')+f"], () => {expr});\n  const workspace = workspaceQuery.data;\n  const loading = workspaceQuery.isPending;\n  const error = workspaceQuery.error?.message;\n  const loadWorkspace = async (_range?: DateRangePreset) => {{ await workspaceQuery.refetch(); }};\n"
 if role=='salesperson': replacement=replacement.replace('_range?: DateRangePreset','')
 s=s[:a]+replacement+s[b:]
 if role=='salesperson':
  a=s.index('      // Optimistically'); b=s.index('      setCompletingTask(null)',a); s=s[:a]+'      await loadWorkspace();\n\n'+s[b:]
  a=s.index('  const handleStageCustomerClick'); b=s.index('\n  if (loading)',a);s=s[:a]+"  const handleStageCustomerClick = (stage: any) => { navigate(`/leads?stageId=${stage.stageId}`); };\n"+s[b:]
 if role=='owner':
  s=s.replace('(Margin 8.3%)','')
  a=s.index('              <strong className="text-amber-300">Executive Insight:'); b=s.index('\n            </span>',a)
  s=s[:a]+'''              {workspace.pipelineFunnel.find(step => step.isHighestDropOff)
                ? `Largest recorded drop-off: ${workspace.pipelineFunnel.find(step => step.isHighestDropOff)!.fromStage} to ${workspace.pipelineFunnel.find(step => step.isHighestDropOff)!.toStage}. Review follow-ups at this stage.`
                : 'No conversion drop-off recorded for this period.'}'''+s[b:]
 s=s.replace('Monitoring Downtown Sales Team','Monitoring assigned sales team'); p.write_text(s)
# Names and header figures are loaded from the current session/workspace.
for filename in ['OwnerWorkspaceLayout','ManagerWorkspaceLayout','SalesWorkspaceLayout']:
 p=Path('client/src/layouts')/(filename+'.tsx');s=p.read_text();s="import { useActiveDealership } from '@/store/authStore';\n"+s;s=s.replace('  const navigate = useNavigate();','  const navigate = useNavigate();\n  const dealership = useActiveDealership();');s=s.replace('>Premier Auto Group<',">{dealership?.dealershipId.name || 'Dealership'}<").replace('>Premier Automotive<',">{dealership?.dealershipId.name || 'Dealership'}<").replace('>Shane Miller (Manager)<',">{user?.firstName} {user?.lastName}<")
 s=s.replace('14 tasks overdue across 3 reps. Review coaching view.','Review current team tasks in the coaching view.').replace('14 Overdue Tasks','View overdue tasks')
 import re
 s=re.sub(r'<div className="hidden.*?MTD Volume:.*?</div>', '',s,flags=re.S) if False else s
 s=s.replace('$1,420,000','—').replace('>23<','>—<')
 s=s.replace("  const handleLogout = () => {", "  const handleLogout = async () => {\n    try { await api.post('/auth/logout'); } catch { /* Clear local session even when disconnected. */ }")
 s="import api from '@/services/api';\n"+s;p.write_text(s)
# Remove the lead-list fallback while preserving the existing create form.
p=Path('client/src/pages/app/LeadsPage.tsx');s=p.read_text();a=s.index('      try {');b=s.index('\n  const handleCreateLead',a);s=s[:a]+'''      const params = new URLSearchParams(window.location.search);
      const path = params.get('stageId') ? `/leads?stageId=${encodeURIComponent(params.get('stageId')!)}` : '/leads';
      return (await readList(path)).map(normalizeLead);
    },
  });
'''+s[b:];s=s.replace('const { data: leadsData, refetch }','const { data: leadsData, refetch, isError, error }');s="import { readList } from '@/services/liveData';\n"+s;s=s.replace("vehicle: '2024 Toyota Camry XSE'","vehicle: ''");a=s.index('  return (',s.index('const filteredLeads'));s=s[:a]+"  if (isError) return <div role=\"alert\" className=\"text-red-400 p-6\">{error.message}<button onClick={()=>refetch()}>Retry</button></div>;\n"+s[a:];p.write_text(s)
