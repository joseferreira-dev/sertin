import { api } from './api';

export interface Budget {
  id: number;
  user_id: number;
  category_id: number;
  month: string;
  budgeted_amount: number;
  spent?: number;
  created_at: string;
  updated_at: string;
}

export const budgetService = {
  async getAll(token: string, filters?: { month?: string }): Promise<Budget[]> {
    const query = new URLSearchParams();
    if (filters?.month) query.append('month', filters.month);
    const url = `/budgets${query.toString() ? '?' + query.toString() : ''}`;
    return api.get<Budget[]>(url, token);
  },

  async create(
    data: { category_id: number; month: string; budgeted_amount: number },
    token: string
  ): Promise<Budget> {
    return api.post<Budget>('/budgets', data, token);
  },

  async update(id: number, data: Partial<Budget>, token: string): Promise<Budget> {
    return api.put<Budget>(`/budgets/${id}`, data, token);
  },

  async delete(id: number, token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/budgets/${id}`, token);
  },
};
