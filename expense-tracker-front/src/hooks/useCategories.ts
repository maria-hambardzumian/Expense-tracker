import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  categoriesApi,
  type CreateCategoryPayload,
  type UpdateCategoryPayload,
  type RemoveAction,
} from '@/lib/api/categories.api';
import { useAuthStore } from '@/store/authStore';

export function useCategories() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => categoriesApi.getAll(),
    staleTime: 5 * 60 * 1000,
    enabled: !!accessToken,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => categoriesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['categories'] }),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateCategoryPayload }) =>
      categoriesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: RemoveAction }) =>
      categoriesApi.remove(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
    },
  });
}

export function useCategoryExpenseCount() {
  return useMutation({
    mutationFn: (id: string) =>
      categoriesApi.getExpenseCount(id).then((result) => result.count),
  });
}
