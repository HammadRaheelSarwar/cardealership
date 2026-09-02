import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store/authStore';

export function useRealtimeSubscription(
  table: string,
  onPayload: (payload: any) => void
) {
  const { activeDealershipId } = useAuthStore();

  useEffect(() => {
    if (!activeDealershipId) return;

    const channel = supabase
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
      supabase.removeChannel(channel);
    };
  }, [table, activeDealershipId, onPayload]);
}
