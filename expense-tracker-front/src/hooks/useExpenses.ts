import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { expensesApi, type ExpenseFilters, type CreateExpensePayload } from '@/lib/api/expenses.api';
import { useAuthStore } from '@/store/authStore';

export function useExpenseDateRange() {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['expenses', 'date-range'],
    queryFn: () => expensesApi.getDateRange(),
    staleTime: 5 * 60 * 1000,
    enabled: !!accessToken,
  });
}

export function useExpenses(filters: ExpenseFilters) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['expenses', filters],
    queryFn: () => expensesApi.getAll(filters),
    enabled: !!accessToken,
  });
}

export function useExpenseSummary(from?: string, to?: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['expenses', 'summary', from, to],
    queryFn: () => expensesApi.getSummary(from, to),
    enabled: !!accessToken,
  });
}

export function useExpensesByCategory(from?: string, to?: string) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['expenses', 'by-category', from ?? 'all', to ?? 'all'],
    queryFn: () => expensesApi.getByCategory(from, to),
    enabled: !!accessToken,
  });
}

export function useExpensesByCustomCategory(from?: string, to?: string, enabled = false) {
  const accessToken = useAuthStore((s) => s.accessToken);
  return useQuery({
    queryKey: ['expenses', 'by-custom-category', from ?? 'all', to ?? 'all'],
    queryFn: () => expensesApi.getByCustomCategory(from, to),
    enabled: !!accessToken && enabled,
  });
}

export function useCreateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateExpensePayload) => expensesApi.create(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useUpdateExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: Partial<CreateExpensePayload>;
    }) => expensesApi.update(id, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}

export function useDeleteExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expensesApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['expenses'] }),
  });
}
