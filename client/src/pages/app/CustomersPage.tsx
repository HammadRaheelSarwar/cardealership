import {
  CollectionPage,
  name,
  vehicleName,
  date,
  money,
} from '@/components/common/LiveData';
import { StatusAction } from '@/components/common/StatusAction';
export default function CustomersPage() {
  return (
    <CollectionPage
      title="Customers"
      path="/customers"
      detail={(r) => `/customers/${r.id}`}
      columns={[
        { label: 'Customer', value: name },
        { label: 'Phone', value: (r) => r.phone },
        { label: 'Email', value: (r) => r.email },
        { label: 'Location', value: (r) => r.location },
        { label: 'Assigned to', value: (r) => name(r.assignedUser) },
      ]}
      fields={[
        { key: 'firstName', label: 'First name', required: true },
        { key: 'lastName', label: 'Last name', required: true },
        { key: 'email', label: 'Email', type: 'email' },
        { key: 'phone', label: 'Phone' },
        { key: 'location', label: 'Location' },
      ]}
    />
  );
}
