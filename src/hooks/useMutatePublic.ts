import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiPost, apiPatch, apiDelete } from "@/lib/api";

type Method = "POST" | "PATCH" | "DELETE";

interface MutateVariables<TBody> {
  id?: string | number;
  body?: TBody;
}

interface UseMutateOptions {
  invalidateKeys?: unknown[][];
  onSuccess?: (data: unknown) => void;
  onError?: (error: unknown) => void;
}

export function useMutatePublic<TResponse = unknown, TBody = unknown>(
  method: Method,
  route: string,
  options: UseMutateOptions = {}
) {
  const queryClient = useQueryClient();
  const { invalidateKeys = [], onSuccess, onError } = options;

  return useMutation<TResponse, unknown, MutateVariables<TBody>>({
    mutationFn: ({ id, body }: MutateVariables<TBody>) => {
      if (method === "POST") return apiPost<TResponse, TBody>(route, body, id);
      if (method === "PATCH") return apiPatch<TResponse, TBody>(route, id, body);
      return apiDelete<TResponse>(route, id, body);
    },
    onSuccess: (data) => {
      invalidateKeys.forEach((key) => {
        queryClient.invalidateQueries({ queryKey: key });
      });
      onSuccess?.(data);
    },
    onError,
  });
}
