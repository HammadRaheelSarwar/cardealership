import { useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Page,
  QueryState,
  Table,
  RecordForm,
} from '@/components/common/LiveData';
import { useLiveQuery } from '@/hooks/useLiveQuery';
import { readList, saveData } from '@/services/liveData';
export default function AutomationDetailPage() {
  const { id } = useParams();
  const query = useLiveQuery(['automations'], () => readList('/automations'));
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const record = query.data?.find((r) => r.id === id);
  return (
    <Page title="Automation workflow">
      <QueryState query={query}>
        {record ? (
          <>
            <h2 className="text-xl text-white">{record.name}</h2>
            <p>{record.description}</p>
            <p>
              Trigger: {record.triggerType} · Status: {record.status}
            </p>
            <Table
              rows={[...(record.steps || [])].sort(
                (a, b) => a.stepOrder - b.stepOrder
              )}
              columns={[
                { label: 'Order', value: (r) => r.stepOrder + 1 },
                { label: 'Action', value: (r) => r.type },
                {
                  label: 'Details',
                  value: (r) =>
                    r.config.title ||
                    r.config.body ||
                    r.config.delayMinutes ||
                    '—',
                },
                {
                  label: 'Actions',
                  value: (r) => (
                    <button
                      onClick={async () => {
                        setError('');
                        try {
                          await saveData(
                            `/automations/${id}/steps/${r.id}`,
                            { remove: true },
                            'patch'
                          );
                          await query.refetch();
                        } catch (e: any) {
                          setError(e.response?.data?.message || e.message);
                        }
                      }}
                    >
                      Remove
                    </button>
                  ),
                },
              ]}
            />
            <button className="btn-primary" onClick={() => setAdding(true)}>
              Add step
            </button>
            {adding && (
              <RecordForm
                fields={[
                  {
                    key: 'type',
                    label: 'Action',
                    options: ['task', 'delay', 'sms', 'email'],
                  },
                  { key: 'title', label: 'Task title or email subject' },
                  { key: 'body', label: 'Message text' },
                  {
                    key: 'delayMinutes',
                    label: 'Delay in minutes',
                    type: 'number',
                  },
                ]}
                onCancel={() => setAdding(false)}
                onSave={async (data) => {
                  const { type, ...config } = data;
                  await saveData(`/automations/${id}/steps`, { type, config });
                  setAdding(false);
                  await query.refetch();
                }}
              />
            )}
            {error && <p className="text-red-400">{error}</p>}
          </>
        ) : (
          <p>Automation not found.</p>
        )}
      </QueryState>
    </Page>
  );
}
