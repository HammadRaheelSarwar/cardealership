import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Page,
  QueryState,
  Table,
  RecordForm,
  money,
  name,
  date,
  vehicleName,
} from '@/components/common/LiveData';
import { useLiveQuery } from '@/hooks/useLiveQuery';
import { readData, readList, saveData } from '@/services/liveData';
import { markLeadSold, markLeadLost } from '@/services/workspaceService';
export function CustomerDetail() {
  const { id } = useParams();
  const query = useLiveQuery(['customer', id], () =>
    readData(`/customers/${id}`)
  );
  const d = query.data;
  return (
    <Page title="Customer details">
      <Link to="/customers">← Customers</Link>
      <QueryState query={query}>
        {d && (
          <>
            <h2 className="text-xl text-white">{name(d.customer)}</h2>
            <p>
              {d.customer.email || 'No email recorded'} ·{' '}
              {d.customer.phone || 'No phone recorded'}
            </p>
            <p>{d.customer.location}</p>
            <h3 className="text-lg text-white">Leads</h3>
            <Table
              rows={d.leads || []}
              columns={[
                {
                  label: 'Lead',
                  value: (r) => (
                    <Link to={`/leads/${r.id}`}>
                      {r.title || r.stage?.name || 'View lead'}
                    </Link>
                  ),
                },
                { label: 'Status', value: (r) => r.status },
                { label: 'Created', value: (r) => date(r.createdAt) },
              ]}
            />
            <h3 className="text-lg text-white">Tasks</h3>
            <Table
              rows={d.tasks || []}
              columns={[
                { label: 'Task', value: (r) => r.title },
                { label: 'Due', value: (r) => date(r.dueAt) },
                { label: 'Status', value: (r) => r.status },
              ]}
            />
            <h3 className="text-lg text-white">Appointments</h3>
            <Table
              rows={d.appointments || []}
              columns={[
                { label: 'Start', value: (r) => date(r.startsAt) },
                { label: 'Status', value: (r) => r.status },
              ]}
            />
          </>
        )}
      </QueryState>
    </Page>
  );
}
export function VehicleDetail() {
  const { id } = useParams();
  const query = useLiveQuery(['vehicle', id], () =>
    readData(`/vehicles/${id}`)
  );
  const v = query.data?.vehicle;
  const [edit, setEdit] = useState(false);
  return (
    <Page title="Vehicle details">
      <Link to="/vehicles">← Inventory</Link>
      <QueryState query={query}>
        {v && (
          <>
            <h2 className="text-xl text-white">
              {vehicleName(v)} {v.trim}
            </h2>
            <p>
              {money(v.price)} · {v.status}
            </p>
            <div className="grid sm:grid-cols-3 gap-3">
              {(v.images || []).map((img: any) => (
                <img
                  key={img.id}
                  src={img.url}
                  alt={vehicleName(v)}
                  className="rounded-xl w-full"
                />
              ))}
            </div>
            {!v.images?.length && (
              <p className="text-gray-400">No photos uploaded.</p>
            )}
            <Table
              rows={[v]}
              columns={[
                { label: 'VIN', value: (r) => r.vin },
                { label: 'Stock', value: (r) => r.stockNumber },
                { label: 'Mileage', value: (r) => r.mileage },
                { label: 'Color', value: (r) => r.exteriorColor },
                { label: 'Fuel', value: (r) => r.fuelType },
              ]}
            />
            <p>{v.description || 'No description recorded.'}</p>
            <button className="btn-secondary" onClick={() => setEdit(true)}>
              Update price or status
            </button>
            {edit && (
              <RecordForm
                fields={[
                  { key: 'price', label: 'Price', type: 'number' },
                  {
                    key: 'status',
                    label: 'Status',
                    options: ['available', 'pending', 'sold', 'archived'],
                  },
                ]}
                onCancel={() => setEdit(false)}
                onSave={async (data) => {
                  await saveData(`/vehicles/${id}`, data, 'patch');
                  setEdit(false);
                  await query.refetch();
                }}
              />
            )}
          </>
        )}
      </QueryState>
    </Page>
  );
}
export function LeadDetail() {
  const { id } = useParams();
  const query = useLiveQuery(['lead', id], () => readData(`/leads/${id}`));
  const activities = useLiveQuery(['lead-activity', id], () =>
    readData(`/leads/${id}/activity`)
  );
  const stages = useLiveQuery(['stages'], () => readList('/pipeline/stages'));
  const tasks = useLiveQuery(['tasks'], () => readList('/tasks'));
  const [form, setForm] = useState<
    'sold' | 'lost' | 'task' | 'appointment' | null
  >(null);
  const [error, setError] = useState('');
  const l = query.data?.lead;
  return (
    <Page title="Lead details">
      <Link to="/leads">← Leads</Link>
      <QueryState query={query}>
        {l && (
          <>
            <h2 className="text-xl text-white">{name(l.customer)}</h2>
            <p>
              {vehicleName(l.vehicle)} · {l.stage?.name || 'No stage'} ·{' '}
              {l.status}
            </p>
            <p>
              {l.customer?.phone} · {l.customer?.email}
            </p>
            <p>{l.notes || 'No notes recorded.'}</p>
            {error && (
              <p role="alert" className="text-red-400">
                {error}
              </p>
            )}
            <div className="flex gap-3 flex-wrap">
              <select
                aria-label="Pipeline stage"
                value={l.pipelineStageId || ''}
                className="bg-black border border-white/20 rounded p-2"
                onChange={async (e) => {
                  setError('');
                  try {
                    await saveData(
                      `/leads/${id}/stage`,
                      { pipelineStageId: e.target.value },
                      'patch'
                    );
                    await query.refetch();
                  } catch (e: any) {
                    setError(e.response?.data?.message || e.message);
                  }
                }}
              >
                <option value="" disabled>
                  Select stage
                </option>
                {(stages.data || [])
                  .filter((s) => s.type === 'standard')
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
              <button
                className="btn-primary"
                onClick={() => setForm('sold')}
                disabled={l.status === 'won'}
              >
                Mark sold
              </button>
              <button
                className="btn-secondary"
                onClick={() => setForm('lost')}
                disabled={l.status === 'lost'}
              >
                Mark lost
              </button>
              <button className="btn-secondary" onClick={() => setForm('task')}>
                Add follow-up
              </button>
              <button
                className="btn-secondary"
                onClick={() => setForm('appointment')}
              >
                Book appointment
              </button>
              <Link className="btn-secondary" to="/inbox">
                Open inbox
              </Link>
            </div>
            {form && (
              <RecordForm
                key={form}
                fields={
                  form === 'sold'
                    ? [
                        {
                          key: 'saleValue',
                          label: 'Sale value',
                          type: 'number',
                          required: true,
                        },
                        {
                          key: 'grossProfit',
                          label: 'Gross profit',
                          type: 'number',
                        },
                        {
                          key: 'netProfit',
                          label: 'Net profit',
                          type: 'number',
                        },
                      ]
                    : form === 'lost'
                      ? [
                          {
                            key: 'lostReason',
                            label: 'Reason',
                            options: [
                              'purchased_elsewhere',
                              'price',
                              'financing',
                              'vehicle_unavailable',
                              'no_response',
                              'not_interested',
                              'other',
                            ],
                            required: true,
                          },
                        ]
                      : form === 'appointment'
                        ? [
                            {
                              key: 'startsAt',
                              label: 'Start',
                              type: 'datetime-local',
                              required: true,
                            },
                            {
                              key: 'endsAt',
                              label: 'End',
                              type: 'datetime-local',
                              required: true,
                            },
                            { key: 'location', label: 'Location' },
                          ]
                        : [
                            {
                              key: 'title',
                              label: 'Follow-up title',
                              required: true,
                            },
                            {
                              key: 'dueAt',
                              label: 'Due',
                              type: 'datetime-local',
                              required: true,
                            },
                          ]
                }
                onCancel={() => setForm(null)}
                onSave={async (data) => {
                  if (form === 'sold') await markLeadSold(id!, data);
                  else if (form === 'lost') await markLeadLost(id!, data);
                  else
                    await saveData(
                      form === 'appointment' ? '/appointments' : '/tasks',
                      {
                        ...data,
                        leadId: id,
                        customerId: l.customerId,
                        vehicleId: l.vehicleId,
                      }
                    );
                  setForm(null);
                  await query.refetch();
                  await activities.refetch();
                  await tasks.refetch();
                }}
              />
            )}
            <h3 className="text-lg text-white">Follow-ups</h3>
            <QueryState query={tasks}>
              <Table
                rows={(tasks.data || []).filter((t) => t.leadId === id)}
                columns={[
                  { label: 'Task', value: (r) => r.title },
                  { label: 'Due', value: (r) => date(r.dueAt) },
                  { label: 'Status', value: (r) => r.status },
                ]}
              />
            </QueryState>
            <h3 className="text-lg text-white">Activity history</h3>
            <QueryState query={activities}>
              <Table
                rows={activities.data?.activities || []}
                columns={[
                  { label: 'When', value: (r) => date(r.createdAt) },
                  { label: 'Activity', value: (r) => r.title },
                  { label: 'Details', value: (r) => r.description },
                  { label: 'User', value: (r) => name(r.user) },
                ]}
              />
            </QueryState>
          </>
        )}
      </QueryState>
    </Page>
  );
}
