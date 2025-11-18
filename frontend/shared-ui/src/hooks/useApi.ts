import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../utils/api-client';

export const useApi = <T>(
  key: string[],
  url: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: key,
    queryFn: async () => {
      const response = await apiClient.get<T>(url);
      return response.data;
    },
    enabled: options?.enabled !== false,
  });
};

export const useApiMutation = <TData = unknown, TVariables = unknown>(
  url: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'POST',
  options?: {
    onSuccess?: (data: TData) => void;
    invalidateQueries?: string[][];
  }
) => {
  const queryClient = useQueryClient();

  return useMutation<TData, Error, TVariables>({
    mutationFn: async (variables: TVariables) => {
      let response;
      if (method === 'POST') {
        response = await apiClient.post<TData>(url, variables);
      } else if (method === 'PUT') {
        response = await apiClient.put<TData>(url, variables);
      } else if (method === 'PATCH') {
        response = await apiClient.patch<TData>(url, variables);
      } else if (method === 'DELETE') {
        response = await apiClient.delete<TData>(url);
      } else {
        response = await apiClient.post<TData>(url, variables);
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (options?.invalidateQueries) {
        options.invalidateQueries.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: key });
        });
      }
      options?.onSuccess?.(data);
    },
  });
};

