import { useState } from 'react';
import { saveData } from '@/services/liveData';
export function StatusAction({
  path,
  current,
  options,
  refresh,
}: {
  path: string;
  current: string;
  options: string[];
  refresh: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  return (
    <span onClick={(e) => e.stopPropagation()}>
      <select
        aria-label="Change status"
        disabled={busy}
        value={current}
        className="bg-black border border-white/20 p-1 rounded"
        onChange={async (e) => {
          setBusy(true);
          setError('');
          try {
            await saveData(path, { status: e.target.value }, 'patch');
            refresh();
          } catch (e: any) {
            setError(e.response?.data?.message || e.message);
          } finally {
            setBusy(false);
          }
        }}
      >
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
      {error && (
        <span role="alert" className="block text-red-400 text-xs">
          {error}
        </span>
      )}
    </span>
  );
}
