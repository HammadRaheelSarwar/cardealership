import { useState } from 'react';
import {
  Page,
  QueryState,
  Table,
  name,
  date,
} from '@/components/common/LiveData';
import { useLiveQuery } from '@/hooks/useLiveQuery';
import { readList, saveData } from '@/services/liveData';
export default function InboxPage() {
  const conversations = useLiveQuery(['conversations'], () =>
    readList('/messages/conversations')
  );
  const [selected, setSelected] = useState('');
  const [mode, setMode] = useState('sms');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const current = (conversations.data || []).find((r) => r.id === selected);
  const messages = useLiveQuery(
    ['messages', selected],
    () => readList(`/messages/conversations/${selected}/messages`),
    Boolean(selected)
  );
  return (
    <Page title="Inbox">
      <QueryState query={conversations}>
        <Table
          rows={conversations.data || []}
          onRow={(r) => setSelected(r.id)}
          columns={[
            { label: 'Customer', value: (r) => name(r.customer) },
            { label: 'Latest message', value: (r) => r.lastMessagePreview },
            { label: 'Updated', value: (r) => date(r.lastMessageAt) },
          ]}
        />
      </QueryState>
      {current && (
        <>
          <h2 className="text-xl text-white">{name(current.customer)}</h2>
          <QueryState query={messages}>
            <Table
              rows={messages.data || []}
              columns={[
                { label: 'Date', value: (r) => date(r.createdAt) },
                { label: 'Direction', value: (r) => r.direction },
                { label: 'Channel', value: (r) => r.channel },
                { label: 'Message', value: (r) => r.content },
                { label: 'Status', value: (r) => r.status },
              ]}
            />
          </QueryState>
          <form
            className="space-y-3"
            onSubmit={async (e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const data = new FormData(form);
              setBusy(true);
              setError('');
              try {
                await saveData(`/messages/${mode}`, {
                  customerId: current.customerId,
                  leadId: current.leadId,
                  to: current.customer?.phone,
                  toEmail: current.customer?.email,
                  subject: data.get('subject'),
                  body: data.get('body'),
                });
                form.reset();
                await messages.refetch();
                await conversations.refetch();
              } catch (e: any) {
                setError(e.response?.data?.message || e.message);
              } finally {
                setBusy(false);
              }
            }}
          >
            <select
              aria-label="Message channel"
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="bg-black p-2 border border-white/20 rounded"
            >
              <option value="sms">SMS</option>
              <option value="email">Email</option>
            </select>
            {mode === 'email' && (
              <input
                name="subject"
                placeholder="Subject"
                required
                className="block w-full bg-black p-2 border border-white/20 rounded"
              />
            )}
            <textarea
              name="body"
              placeholder="Write your message"
              required
              className="block w-full bg-black p-3 border border-white/20 rounded"
            />
            {error && (
              <p role="alert" className="text-red-400">
                {error}
              </p>
            )}
            <button disabled={busy} className="btn-primary">
              {busy ? 'Sending…' : 'Send message'}
            </button>
          </form>
        </>
      )}
    </Page>
  );
}
