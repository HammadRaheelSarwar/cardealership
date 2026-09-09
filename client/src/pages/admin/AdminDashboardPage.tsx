import { useQuery } from '@tanstack/react-query';
import { readData } from '@/services/liveData';
import { Page, QueryState, Table } from '@/components/common/LiveData';
export default function AdminDashboardPage() {
  const query = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => readData('/admin/stats'),
    refetchInterval: 15000,
  });
  return (
    <Page title="Platform overview">
      <QueryState query={query}>
        <Table
          rows={
            query.data
              ? Object.entries(query.data)
                  .filter(([k]) => !k.includes('_'))
                  .map(([metric, value]) => ({ metric, value }))
              : []
          }
          columns={[
            { label: 'Metric', value: (r) => r.metric },
            { label: 'Value', value: (r) => String(r.value) },
          ]}
        />
      </QueryState>
    </Page>
  );
}
