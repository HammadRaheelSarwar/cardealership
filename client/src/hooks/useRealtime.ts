import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useRealtimeSubscription(
  table: string,
  onPayload: (payload: any) => void
) {
  const { activeDealershipId } = useAuthStore();

  useEffect(() => {
    const realtime = supabase;
    if (!activeDealershipId || !realtime) return;

    const channel = realtime
      .channel(`realtime:${table}:${activeDealershipId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table,
          filter: `dealership_id=eq.${activeDealershipId}`,
        },
        (payload) => {
          onPayload(payload);
        }
      )
      .subscribe();

    return () => {
      realtime.removeChannel(channel);
    };
  }, [table, activeDealershipId, onPayload]);
}
