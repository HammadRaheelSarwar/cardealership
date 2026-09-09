import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
export function useLiveQuery<T>(
  key: readonly unknown[],
  queryFn: () => Promise<T>,
  enabled = true
) {
  const tenant = useAuthStore((s) => s.activeDealershipId);
  return useQuery({
    queryKey: [tenant, ...key],
    queryFn,
    enabled: enabled && Boolean(tenant),
    refetchInterval: 15000,
    refetchOnWindowFocus: true,
  });
}
