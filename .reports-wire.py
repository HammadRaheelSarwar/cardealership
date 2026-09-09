from pathlib import Path
p=Path('server/src/routes/workspace.routes.ts');s=p.read_text();s="import { getSalesLedger } from '../controllers/workspace.controller';\n"+s;s=s.replace("router.get('/owner',", "router.get('/sales', requireRole('owner'), getSalesLedger);\nrouter.get('/owner',");p.write_text(s)
for filename,kind in [('ManagersComparisonPage','managers'),('SalesVolumePage','sales'),('FinancialReportsPage','financial'),('ConversionFunnelPage','conversion')]:
 Path('client/src/pages/app/'+filename+'.tsx').write_text("import { OwnerReport } from '@/components/common/LiveReports';\nexport default function "+filename+"() { return <OwnerReport kind=\""+kind+"\"/>; }\n")
for filename in ['ReportsPage','ActivityCoachingPage']:
 Path('client/src/pages/app/'+filename+'.tsx').write_text("export { PerformanceReport as default } from '@/components/common/LiveReports';\n")
Path('client/src/pages/app/DashboardPage.tsx').write_text("import { Navigate } from 'react-router-dom';\nexport default function DashboardPage(){return <Navigate to=\"/dashboard\" replace/>;}\n")
