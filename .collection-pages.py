from pathlib import Path
base=Path('client/src/pages/app')
pages={
'CustomersPage':'''<CollectionPage title="Customers" path="/customers" detail={r=>`/customers/${r.id}`} columns={[
 {label:'Customer',value:name},{label:'Phone',value:r=>r.phone},{label:'Email',value:r=>r.email},{label:'Location',value:r=>r.location},{label:'Assigned to',value:r=>name(r.assignedUser)}
]} fields={[{key:'firstName',label:'First name',required:true},{key:'lastName',label:'Last name',required:true},{key:'email',label:'Email',type:'email'},{key:'phone',label:'Phone'},{key:'location',label:'Location'}]}/>''',
'VehiclesPage':'''<CollectionPage title="Vehicle inventory" path="/vehicles" detail={r=>`/vehicles/${r.id}`} columns={[
 {label:'Vehicle',value:vehicleName},{label:'Stock number',value:r=>r.stockNumber},{label:'VIN',value:r=>r.vin},{label:'Price',value:r=>money(r.price)},{label:'Mileage',value:r=>r.mileage},{label:'Status',value:r=>r.status}
]} fields={[{key:'year',label:'Year',type:'number',required:true},{key:'make',label:'Make',required:true},{key:'model',label:'Model',required:true},{key:'trim',label:'Trim'},{key:'price',label:'Price',type:'number',required:true},{key:'mileage',label:'Mileage',type:'number'},{key:'vin',label:'VIN',required:true},{key:'stock_number',label:'Stock number'},{key:'status',label:'Status',options:['available','pending','sold','archived']}]}/>''',
'TasksPage':'''<CollectionPage title="Tasks" path="/tasks" columns={[
 {label:'Task',value:r=>r.title},{label:'Customer',value:r=>name(r.customer)},{label:'Assigned to',value:r=>name(r.assignedUser)},{label:'Due',value:r=>date(r.dueAt)},{label:'Priority',value:r=>r.priority},{label:'Status',value:r=>r.status}
]} fields={[{key:'title',label:'Task title',required:true},{key:'description',label:'Description'},{key:'dueAt',label:'Due date',type:'datetime-local',required:true},{key:'type',label:'Action',options:['follow_up','call','email','sms']},{key:'priority',label:'Priority',options:['medium','high','low']}]}
 actions={(r,refresh)=><StatusAction path={`/tasks/${r.id}/status`} current={r.status} options={['pending','completed','cancelled']} refresh={refresh}/>}/>''',
'AppointmentsPage':'''<CollectionPage title="Appointments" path="/appointments" columns={[
 {label:'Customer',value:r=>name(r.customer)},{label:'Vehicle',value:r=>vehicleName(r.vehicle)},{label:'Starts',value:r=>date(r.startsAt)},{label:'Ends',value:r=>date(r.endsAt)},{label:'Location',value:r=>r.location},{label:'Assigned to',value:r=>name(r.assignedUser)},{label:'Status',value:r=>r.status}
]} fields={[{key:'startsAt',label:'Start',type:'datetime-local',required:true},{key:'endsAt',label:'End',type:'datetime-local',required:true},{key:'location',label:'Location'},{key:'notes',label:'Notes'},{key:'type',label:'Type',options:['test_drive','showroom_visit','follow_up']}]}
 actions={(r,refresh)=><StatusAction path={`/appointments/${r.id}/status`} current={r.status} options={['scheduled','confirmed','completed','cancelled','no_show']} refresh={refresh}/>}/>''',
'TeamPage':'''<CollectionPage title="Team members" path="/team" columns={[
 {label:'Name',value:r=>name(r.profile)},{label:'Email',value:r=>r.profile?.email},{label:'Role',value:r=>r.role},{label:'Status',value:r=>r.status}
]} fields={[{key:'firstName',label:'First name',required:true},{key:'lastName',label:'Last name',required:true},{key:'email',label:'Email address',type:'email',required:true},{key:'role',label:'Role',options:['salesperson','manager']}]} />''',
'AutomationPage':'''<CollectionPage title="Automations" path="/automations" detail={r=>`/automation/${r.id}`} columns={[
 {label:'Name',value:r=>r.name},{label:'Trigger',value:r=>r.triggerType},{label:'Steps',value:r=>r.steps?.length||0},{label:'Status',value:r=>r.status},{label:'Created',value:r=>date(r.createdAt)}
]} fields={[{key:'name',label:'Name',required:true},{key:'description',label:'Description'},{key:'triggerType',label:'Trigger',options:['new_lead','lead_stage_changed','task_overdue']}]}
 actions={(r,refresh)=><StatusAction path={`/automations/${r.id}/status`} current={r.status} options={['draft','active','paused','archived']} refresh={refresh}/>}/>'''
}
for page,jsx in pages.items():
 (base/(page+'.tsx')).write_text("import { CollectionPage, name, vehicleName, date, money } from '@/components/common/LiveData';\nimport { StatusAction } from '@/components/common/StatusAction';\nexport default function "+page+"() { return ("+jsx+"); }\n")
