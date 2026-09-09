from pathlib import Path
for file,export in [('CustomerDetailPage','CustomerDetail'),('VehicleDetailPage','VehicleDetail'),('LeadDetailPage','LeadDetail')]:
 Path('client/src/pages/app/'+file+'.tsx').write_text("export { "+export+" as default } from '@/components/common/LiveDetails';\n")
