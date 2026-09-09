import {
  CollectionPage,
  name,
  vehicleName,
  date,
  money,
} from '@/components/common/LiveData';
import { StatusAction } from '@/components/common/StatusAction';
export default function AppointmentsPage() {
  return (
    <CollectionPage
      title="Appointments"
      path="/appointments"
      columns={[
        { label: 'Customer', value: (r) => name(r.customer) },
        { label: 'Vehicle', value: (r) => vehicleName(r.vehicle) },
        { label: 'Starts', value: (r) => date(r.startsAt) },
        { label: 'Ends', value: (r) => date(r.endsAt) },
        { label: 'Location', value: (r) => r.location },
        { label: 'Assigned to', value: (r) => name(r.assignedUser) },
        { label: 'Status', value: (r) => r.status },
      ]}
      fields={[
        {
          key: 'startsAt',
          label: 'Start',
          type: 'datetime-local',
          required: true,
        },
        { key: 'endsAt', label: 'End', type: 'datetime-local', required: true },
        { key: 'location', label: 'Location' },
        { key: 'notes', label: 'Notes' },
        {
          key: 'type',
          label: 'Type',
          options: ['test_drive', 'showroom_visit', 'follow_up'],
        },
      ]}
      actions={(r, refresh) => (
        <StatusAction
          path={`/appointments/${r.id}/status`}
          current={r.status}
          options={[
            'scheduled',
            'confirmed',
            'completed',
            'cancelled',
            'no_show',
          ]}
          refresh={refresh}
        />
      )}
    />
  );
}
