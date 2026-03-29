export const ENDPOINTS = {
  auth: {
    register: '/auth/register',
    login: '/auth/login',
    logout: '/auth/logout',
    checkUsername: (username: string) =>
      `/auth/check-username/${encodeURIComponent(username)}`,
    me: '/auth/me',
  },
  expenses: {
    list: '/expenses',
    dateRange: '/expenses/date-range',
    summary: '/expenses/summary',
    byCategory: '/expenses/by-category',
    byCustomCategory: '/expenses/by-custom-category',
    byId: (id: string) => `/expenses/${id}`,
  },
  categories: {
    list: '/categories',
    byId: (id: string) => `/categories/${id}`,
    expenseCount: (id: string) => `/categories/${id}/expense-count`,
    remove: (id: string) => `/categories/${id}/remove`,
  },
};
