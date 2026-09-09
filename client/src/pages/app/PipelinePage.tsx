import { useLiveQuery } from '@/hooks/useLiveQuery';
import { readList } from '@/services/liveData';
import {
  Page,
  QueryState,
  Table,
  name,
  vehicleName,
} from '@/components/common/LiveData';
import { Link } from 'react-router-dom';
export default function PipelinePage() {
  const leads = useLiveQuery(['pipeline-leads'], () => readList('/leads'));
  const stages = useLiveQuery(['stages'], () => readList('/pipeline/stages'));
  return (
    <Page title="Sales pipeline">
      <QueryState query={leads}>
        <QueryState query={stages}>
          <div className="grid lg:grid-cols-3 gap-4">
            {(stages.data || [])
              .filter((s) => s.type === 'standard')
              .map((s) => (
                <section key={s.id} className="space-y-3">
                  <h2
                    className="text-white"
                    style={{ borderBottom: `2px solid ${s.color}` }}
                  >
                    {s.name} (
                    {
                      (leads.data || []).filter(
                        (l) => l.pipelineStageId === s.id
                      ).length
                    }
                    )
                  </h2>
                  <Table
                    rows={(leads.data || []).filter(
                      (l) => l.pipelineStageId === s.id
                    )}
                    columns={[
                      {
                        label: 'Customer',
                        value: (r) => (
                          <Link to={`/leads/${r.id}`}>{name(r.customer)}</Link>
                        ),
                      },
                      {
                        label: 'Vehicle',
                        value: (r) => vehicleName(r.vehicle),
                      },
                    ]}
                  />
                </section>
              ))}
          </div>
        </QueryState>
      </QueryState>
    </Page>
  );
}
