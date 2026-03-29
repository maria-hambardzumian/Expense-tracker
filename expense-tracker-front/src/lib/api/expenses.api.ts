import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type {
  Expense,
  PaginatedExpenses,
  ExpenseSummary,
  CategoryBreakdownResponse,
  CustomCategoryBreakdownResponse,
} from '@/types';

export interface ExpenseFilters {
  from?: string;
  to?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}

export interface CreateExpensePayload {
  amount: string;
  date: string;
  categoryId: string;
  note?: string;
}

export const expensesApi = {
  getAll: (filters: ExpenseFilters = {}) =>
    api.get<PaginatedExpenses>(ENDPOINTS.expenses.list, { params: filters }),

  getDateRange: () =>
    api.get<{ earliest: string | null }>(ENDPOINTS.expenses.dateRange),

  getSummary: (from?: string, to?: string) =>
    api.get<ExpenseSummary>(ENDPOINTS.expenses.summary, { params: { from, to } }),

  getByCategory: (from?: string, to?: string) =>
    api.get<CategoryBreakdownResponse>(ENDPOINTS.expenses.byCategory, { params: { from, to } }),

  getByCustomCategory: (from?: string, to?: string) =>
    api.get<CustomCategoryBreakdownResponse>(ENDPOINTS.expenses.byCustomCategory, { params: { from, to } }),

  create: (payload: CreateExpensePayload) =>
    api.post<Expense>(ENDPOINTS.expenses.list, payload),

  update: (id: string, payload: Partial<CreateExpensePayload>) =>
    api.patch<Expense>(ENDPOINTS.expenses.byId(id), payload),

  remove: (id: string) =>
    api.delete(ENDPOINTS.expenses.byId(id)),
};
