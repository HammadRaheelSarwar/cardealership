import {
  CollectionPage,
  name,
  vehicleName,
  date,
  money,
} from '@/components/common/LiveData';
import { StatusAction } from '@/components/common/StatusAction';
export default function TasksPage() {
  return (
    <CollectionPage
      title="Tasks"
      path="/tasks"
      columns={[
        { label: 'Task', value: (r) => r.title },
        { label: 'Customer', value: (r) => name(r.customer) },
        { label: 'Assigned to', value: (r) => name(r.assignedUser) },
        { label: 'Due', value: (r) => date(r.dueAt) },
        { label: 'Priority', value: (r) => r.priority },
        { label: 'Status', value: (r) => r.status },
      ]}
      fields={[
        { key: 'title', label: 'Task title', required: true },
        { key: 'description', label: 'Description' },
        {
          key: 'dueAt',
          label: 'Due date',
          type: 'datetime-local',
          required: true,
        },
        {
          key: 'type',
          label: 'Action',
          options: ['follow_up', 'call', 'email', 'sms'],
        },
        {
          key: 'priority',
          label: 'Priority',
          options: ['medium', 'high', 'low'],
        },
      ]}
      actions={(r, refresh) => (
        <StatusAction
          path={`/tasks/${r.id}/status`}
          current={r.status}
          options={['pending', 'completed', 'cancelled']}
          refresh={refresh}
        />
      )}
    />
  );
}
