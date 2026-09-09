import { useEffect, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import api from '@/services/api';
export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  const tenant = useAuthStore((s) => s.activeDealershipId);
  const client = useQueryClient();
  useEffect(() => {
    let active = true;
    async function restore() {
      try {
        const token = (await api.post('/auth/refresh')).data.data.accessToken;
        useAuthStore.getState().setAccessToken(token);
        const data = (await api.get('/auth/me')).data.data;
        if (active)
          useAuthStore.getState().setAuth({ ...data, accessToken: token });
      } catch {
        if (active) useAuthStore.getState().logout();
      } finally {
        if (active) setReady(true);
      }
    }
    restore();
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    client.removeQueries({
      predicate: (query) => query.queryKey[0] !== tenant,
    });
  }, [tenant, client]);
  useEffect(() => {
    const refresh = () => {
      void client.invalidateQueries();
    };
    window.addEventListener('crm:data-changed', refresh);
    return () => window.removeEventListener('crm:data-changed', refresh);
  }, [client]);
  return ready ? (
    <>{children}</>
  ) : (
    <div className="p-8 text-gray-400">Restoring session…</div>
  );
}
