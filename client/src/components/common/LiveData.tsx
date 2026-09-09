import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from '@/hooks/useLiveQuery';
import { readList, saveData } from '@/services/liveData';
export const money = (value: unknown) =>
  value == null
    ? '—'
    : Number(value).toLocaleString('en-US', {
        style: 'currency',
        currency: 'USD',
      });
export const date = (value: unknown) =>
  value ? new Date(String(value)).toLocaleString() : '—';
export const name = (person: any) =>
  person
    ? `${person.firstName || ''} ${person.lastName || ''}`.trim()
    : 'Unassigned';
export const vehicleName = (v: any) =>
  v
    ? `${v.year || ''} ${v.make || ''} ${v.model || ''}`.trim()
    : 'No vehicle selected';
export function QueryState({
  query,
  children,
}: {
  query: any;
  children: React.ReactNode;
}) {
  if (query.isPending)
    return <p className="p-6 text-gray-400">Loading records…</p>;
  if (query.isError)
    return (
      <div
        role="alert"
        className="p-6 rounded-xl border border-red-500/40 text-red-300"
      >
        {query.error?.response?.data?.message ||
          query.error?.message ||
          'Unable to load records.'}
        <button className="btn-secondary ml-4" onClick={() => query.refetch()}>
          Retry
        </button>
      </div>
    );
  return <>{children}</>;
}
export function Page({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-5 max-w-7xl mx-auto pb-12">
      <div className="border-b border-white/10 pb-4">
        <h1 className="text-2xl font-semibold text-white">{title}</h1>
        <p className="text-xs text-gray-400 mt-1">
          Live dealership records · refreshes every 15 seconds
        </p>
      </div>
      {children}
    </div>
  );
}
export type Column = { label: string; value: (row: any) => React.ReactNode };
export function Table({
  rows,
  columns,
  onRow,
}: {
  rows: any[];
  columns: Column[];
  onRow?: (row: any) => void;
}) {
  if (!rows.length)
    return (
      <div className="rounded-xl border border-white/10 p-10 text-center text-gray-400">
        No records yet.
      </div>
    );
  return (
    <div className="overflow-x-auto border border-white/10 rounded-xl">
      <table className="w-full text-sm text-left">
        <thead className="bg-white/5 text-gray-400">
          <tr>
            {columns.map((c) => (
              <th key={c.label} className="p-3">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={r.id || r.managerId || i}
              className={`border-t border-white/5 ${onRow ? 'cursor-pointer hover:bg-white/5' : ''}`}
              onClick={() => onRow?.(r)}
            >
              {columns.map((c) => (
                <td className="p-3 text-gray-200" key={c.label}>
                  {c.value(r) ?? '—'}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export type Field = {
  key: string;
  label: string;
  type?: string;
  required?: boolean;
  options?: Array<string | { value: string; label: string }>;
};
export function RecordForm({
  fields,
  onSave,
  onCancel,
}: {
  fields: Field[];
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}) {
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  return (
    <form
      className="p-5 bg-[#111] border border-white/15 rounded-xl space-y-4"
      onSubmit={async (event) => {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const data: any = {};
        fields.forEach((f) => {
          const v = form.get(f.key);
          if (v !== null && v !== '')
            data[f.key] =
              f.type === 'number'
                ? Number(v)
                : f.type === 'datetime-local'
                  ? new Date(String(v)).toISOString()
                  : v;
        });
        setSaving(true);
        setError('');
        try {
          await onSave(data);
        } catch (e: any) {
          setError(e.response?.data?.message || e.message);
        } finally {
          setSaving(false);
        }
      }}
    >
      <div className="grid sm:grid-cols-2 gap-3">
        {fields.map((f) => (
          <label key={f.key} className="text-sm text-gray-300">
            {f.label}
            {f.options ? (
              <select
                name={f.key}
                required={f.required}
                className="block w-full bg-black border border-white/20 rounded p-2"
              >
                {!f.required && <option value="">Not selected</option>}
                {f.options.map((o) =>
                  typeof o === 'string' ? (
                    <option key={o}>{o}</option>
                  ) : (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  )
                )}
              </select>
            ) : (
              <input
                name={f.key}
                type={f.type || 'text'}
                required={f.required}
                className="block w-full bg-black border border-white/20 rounded p-2"
              />
            )}
          </label>
        ))}
      </div>
      {error && (
        <p role="alert" className="text-red-400">
          {error}
        </p>
      )}
      <button disabled={saving} className="btn-primary">
        {saving ? 'Saving…' : 'Save'}
      </button>
      <button type="button" className="btn-secondary ml-2" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}
export function CollectionPage({
  title,
  path,
  columns,
  fields,
  detail,
  transform,
  actions,
}: {
  title: string;
  path: string;
  columns: Column[];
  fields?: Field[];
  detail?: (row: any) => string;
  transform?: (data: any) => any;
  actions?: (row: any, refresh: () => void) => React.ReactNode;
}) {
  const query = useLiveQuery([path], () => readList(path));
  const [search, setSearch] = useState('');
  const [create, setCreate] = useState(false);
  const navigate = useNavigate();
  const rows = (query.data || []).filter((r) =>
    JSON.stringify(r).toLowerCase().includes(search.toLowerCase())
  );
  const customers = useLiveQuery(
    ['customers'],
    () => readList('/customers'),
    Boolean(fields) && ['/tasks', '/appointments'].includes(path)
  );
  const formFields =
    fields && ['/tasks', '/appointments'].includes(path)
      ? [
          ...fields,
          {
            key: 'customerId',
            label: 'Customer',
            options: (customers.data || []).map((c) => ({
              value: c.id,
              label: name(c),
            })),
          },
        ]
      : fields;
  const allColumns = actions
    ? [
        ...columns,
        {
          label: 'Actions',
          value: (r: any) =>
            actions(r, () => {
              void query.refetch();
            }),
        },
      ]
    : columns;
  return (
    <Page title={title}>
      <div className="flex gap-3">
        <input
          aria-label="Search records"
          className="bg-black border border-white/20 rounded p-2 flex-1"
          placeholder="Search records"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        {fields && (
          <button className="btn-primary" onClick={() => setCreate(true)}>
            Add record
          </button>
        )}
      </div>
      {create && fields && (
        <RecordForm
          fields={formFields!}
          onCancel={() => setCreate(false)}
          onSave={async (data) => {
            await saveData(path, transform ? transform(data) : data);
            setCreate(false);
            await query.refetch();
          }}
        />
      )}
      <QueryState query={query}>
        <Table
          rows={rows}
          columns={allColumns}
          onRow={detail ? (r) => navigate(detail(r)) : undefined}
        />
      </QueryState>
    </Page>
  );
}
