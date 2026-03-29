export interface User {
  id: string;
  username: string;
  name: string | null;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
  userId: string | null;
}

export interface Expense {
  id: string;
  amount: string;
  note: string | null;
  date: string;
  userId: string;
  categoryId: string;
  category: Category;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedExpenses {
  data: Expense[];
  total: number;
  page: number;
  limit: number;
}

export interface ExpenseSummary {
  total: string | number;
}

export interface AuthTokens {
  accessToken: string;
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  isDefault: boolean;
  total: number;
}

export interface CategoryBreakdownResponse {
  data: CategoryBreakdown[];
  grandTotal: number;
}

export interface CustomCategoryBreakdown {
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  total: number;
}

export interface CustomCategoryBreakdownResponse {
  data: CustomCategoryBreakdown[];
}
