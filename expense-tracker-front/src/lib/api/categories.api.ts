import { api } from './client';
import { ENDPOINTS } from './endpoints';
import type { Category } from '@/types';

export interface CreateCategoryPayload {
  name: string;
  color?: string;
}

export interface UpdateCategoryPayload {
  name?: string;
  color?: string;
}

export type RemoveAction = 'deleteExpenses' | 'reassignToOther' | 'keepUnchanged';

export const categoriesApi = {
  getAll: () =>
    api.get<Category[]>(ENDPOINTS.categories.list),

  create: (payload: CreateCategoryPayload) =>
    api.post<Category>(ENDPOINTS.categories.list, payload),

  update: (id: string, payload: UpdateCategoryPayload) =>
    api.patch<Category>(ENDPOINTS.categories.byId(id), payload),

  getExpenseCount: (id: string) =>
    api.get<{ count: number }>(ENDPOINTS.categories.expenseCount(id)),

  remove: (id: string, action: RemoveAction) =>
    api.post(ENDPOINTS.categories.remove(id), { action }),
};
