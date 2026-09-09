import {
  CollectionPage,
  name,
  vehicleName,
  date,
  money,
} from '@/components/common/LiveData';
import { StatusAction } from '@/components/common/StatusAction';
export default function AutomationPage() {
  return (
    <CollectionPage
      title="Automations"
      path="/automations"
      detail={(r) => `/automation/${r.id}`}
      columns={[
        { label: 'Name', value: (r) => r.name },
        { label: 'Trigger', value: (r) => r.triggerType },
        { label: 'Steps', value: (r) => r.steps?.length || 0 },
        { label: 'Status', value: (r) => r.status },
        { label: 'Created', value: (r) => date(r.createdAt) },
      ]}
      fields={[
        { key: 'name', label: 'Name', required: true },
        { key: 'description', label: 'Description' },
        {
          key: 'triggerType',
          label: 'Trigger',
          options: ['new_lead', 'lead_stage_changed', 'task_overdue'],
        },
      ]}
      actions={(r, refresh) => (
        <StatusAction
          path={`/automations/${r.id}/status`}
          current={r.status}
          options={['draft', 'active', 'paused', 'archived']}
          refresh={refresh}
        />
      )}
    />
  );
}
