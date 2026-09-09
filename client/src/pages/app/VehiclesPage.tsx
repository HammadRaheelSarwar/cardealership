import {
  CollectionPage,
  name,
  vehicleName,
  date,
  money,
} from '@/components/common/LiveData';
import { StatusAction } from '@/components/common/StatusAction';
export default function VehiclesPage() {
  return (
    <CollectionPage
      title="Vehicle inventory"
      path="/vehicles"
      detail={(r) => `/vehicles/${r.id}`}
      columns={[
        { label: 'Vehicle', value: vehicleName },
        { label: 'Stock number', value: (r) => r.stockNumber },
        { label: 'VIN', value: (r) => r.vin },
        { label: 'Price', value: (r) => money(r.price) },
        { label: 'Mileage', value: (r) => r.mileage },
        { label: 'Status', value: (r) => r.status },
      ]}
      fields={[
        { key: 'year', label: 'Year', type: 'number', required: true },
        { key: 'make', label: 'Make', required: true },
        { key: 'model', label: 'Model', required: true },
        { key: 'trim', label: 'Trim' },
        { key: 'price', label: 'Price', type: 'number', required: true },
        { key: 'mileage', label: 'Mileage', type: 'number' },
        { key: 'vin', label: 'VIN', required: true },
        { key: 'stock_number', label: 'Stock number' },
        {
          key: 'status',
          label: 'Status',
          options: ['available', 'pending', 'sold', 'archived'],
        },
      ]}
    />
  );
}
