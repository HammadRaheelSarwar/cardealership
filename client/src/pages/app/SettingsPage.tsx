import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useLiveQuery } from '@/hooks/useLiveQuery';
import { readData, readList, saveData } from '@/services/liveData';
import {
  Page,
  QueryState,
  Table,
  RecordForm,
} from '@/components/common/LiveData';
export default function SettingsPage() {
  const id = useAuthStore((s) => s.activeDealershipId);
  const query = useLiveQuery(['dealership', id], () =>
    readData(`/dealerships/${id}`)
  );
  const stages = useLiveQuery(['stages'], () => readList('/pipeline/stages'));
  const sources = useLiveQuery(['sources'], () => readList('/lead-sources'));
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [adding, setAdding] = useState<'stage' | 'source' | null>(null);
  return (
    <Page title="Dealership settings">
      <QueryState query={query}>
        {query.data && (
          <form
            key={id}
            className="space-y-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const data = Object.fromEntries(new FormData(e.currentTarget));
              setBusy(true);
              setSaved(false);
              setError('');
              try {
                await saveData(`/dealerships/${id}`, data, 'patch');
                setSaved(true);
                await query.refetch();
              } catch (e: any) {
                setError(e.response?.data?.message || e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <div className="grid sm:grid-cols-2 gap-3">
              {['name', 'email', 'phone', 'website', 'timezone'].map(
                (field) => (
                  <label key={field} className="text-gray-300 capitalize">
                    {field}
                    <input
                      name={field}
                      defaultValue={query.data.dealership[field] || ''}
                      required={['name', 'email', 'timezone'].includes(field)}
                      className="block w-full p-2 bg-black border border-white/20 rounded"
                    />
                  </label>
                )
              )}
            </div>
            {error && (
              <p role="alert" className="text-red-400">
                {error}
              </p>
            )}
            {saved && <p className="text-green-400">Changes saved.</p>}
            <button disabled={busy} className="btn-primary">
              {busy ? 'Saving…' : 'Save settings'}
            </button>
          </form>
        )}
      </QueryState>
      <h2 className="text-lg text-white">Pipeline stages</h2>
      <QueryState query={stages}>
        <Table
          rows={stages.data || []}
          columns={[
            { label: 'Stage', value: (r) => r.name },
            { label: 'Type', value: (r) => r.type },
            { label: 'Order', value: (r) => r.sortOrder },
          ]}
        />
      </QueryState>
      <button className="btn-secondary" onClick={() => setAdding('stage')}>
        Add stage
      </button>
      <h2 className="text-lg text-white">Lead sources</h2>
      <QueryState query={sources}>
        <Table
          rows={sources.data || []}
          columns={[
            { label: 'Source', value: (r) => r.name },
            { label: 'Channel', value: (r) => r.channel },
          ]}
        />
      </QueryState>
      <button className="btn-secondary" onClick={() => setAdding('source')}>
        Add source
      </button>
      {adding && (
        <RecordForm
          key={adding}
          fields={
            adding === 'stage'
              ? [
                  { key: 'name', label: 'Name', required: true },
                  {
                    key: 'color',
                    label: 'Color',
                    type: 'color',
                    required: true,
                  },
                ]
              : [
                  { key: 'name', label: 'Name', required: true },
                  {
                    key: 'channel',
                    label: 'Channel',
                    options: [
                      'web',
                      'phone',
                      'walk-in',
                      'referral',
                      'social',
                      'marketplace',
                    ],
                  },
                ]
          }
          onCancel={() => setAdding(null)}
          onSave={async (data) => {
            await saveData(
              adding === 'stage' ? '/pipeline/stages' : '/lead-sources',
              {
                ...data,
                slug: data.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
              }
            );
            setAdding(null);
            await stages.refetch();
            await sources.refetch();
          }}
        />
      )}
    </Page>
  );
}
