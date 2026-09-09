import { useState } from 'react';
import { CollectionPage, name, RecordForm } from '@/components/common/LiveData';
import { useLiveQuery } from '@/hooks/useLiveQuery';
import { readList, saveData } from '@/services/liveData';
import { useActiveMembershipRole } from '@/store/authStore';
export default function TeamPage() {
  const role = useActiveMembershipRole();
  const query = useLiveQuery(['team'], () => readList('/team'));
  const [assign, setAssign] = useState(false);
  const [message, setMessage] = useState('');
  const fields =
    role === 'owner'
      ? [
          { key: 'firstName', label: 'First name', required: true },
          { key: 'lastName', label: 'Last name', required: true },
          {
            key: 'email',
            label: 'Email address',
            type: 'email',
            required: true,
          },
          { key: 'role', label: 'Role', options: ['salesperson', 'manager'] },
        ]
      : undefined;
  return (
    <div className="space-y-5">
      <CollectionPage
        title="Team members"
        path="/team"
        fields={fields}
        columns={[
          { label: 'Name', value: (r) => name(r.profile) },
          { label: 'Email', value: (r) => r.profile?.email },
          { label: 'Role', value: (r) => r.role },
          { label: 'Status', value: (r) => r.status },
        ]}
      />
      {role === 'owner' && (
        <>
          <button className="btn-secondary" onClick={() => setAssign(true)}>
            Assign salesperson to manager
          </button>
          {message && <p>{message}</p>}
          {assign && (
            <RecordForm
              fields={['manager', 'salesperson'].map((r) => ({
                key: r === 'manager' ? 'managerId' : 'salespersonId',
                label: r,
                required: true,
                options: (query.data || [])
                  .filter((m) => m.role === r && m.status === 'active')
                  .map((m) => ({ value: m.userId, label: name(m.profile) })),
              }))}
              onCancel={() => setAssign(false)}
              onSave={async (data) => {
                await saveData('/team/assign', data);
                setAssign(false);
                setMessage('Team assignment saved.');
              }}
            />
          )}
        </>
      )}
    </div>
  );
}
