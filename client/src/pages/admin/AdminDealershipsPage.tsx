import { useQuery } from '@tanstack/react-query';
import { readList } from '@/services/liveData';
import { Page, QueryState, Table } from '@/components/common/LiveData';
import { StatusAction } from '@/components/common/StatusAction';
export default function AdminDealershipsPage() {
  const query = useQuery({
    queryKey: ['admin-dealerships'],
    queryFn: () => readList('/admin/dealerships'),
    refetchInterval: 15000,
  });
  return (
    <Page title="Dealership administration">
      <QueryState query={query}>
        <Table
          rows={query.data || []}
          columns={[
            { label: 'Dealership', value: (r) => r.name },
            { label: 'Email', value: (r) => r.email },
            { label: 'Status', value: (r) => r.status },
            {
              label: 'Actions',
              value: (r) => (
                <StatusAction
                  path={`/admin/dealerships/${r.id}/status`}
                  current={r.status}
                  options={['active', 'suspended']}
                  refresh={() => {
                    void query.refetch();
                  }}
                />
              ),
            },
          ]}
        />
      </QueryState>
    </Page>
  );
}
