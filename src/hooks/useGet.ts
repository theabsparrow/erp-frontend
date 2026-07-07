import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";

interface UseGetOptions {
  id?: string | number;
  params?: Record<string, unknown>;
  enabled?: boolean;
  staleTime?: number;
}

export function useGet<TResponse>(
  queryKey: unknown[],
  route: string,
  options: UseGetOptions = {}
) {
  const { id, params, enabled = true, staleTime } = options;

  return useQuery<TResponse>({
    queryKey: [...queryKey, id, params],
    queryFn: () => apiGet<TResponse>(route, id, params),
    enabled,
    staleTime,
  });
}
