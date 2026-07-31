import { api } from './api';

export interface Category {
  id: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  color: string;
  icon: string;
  parent_id?: number | null;
  children?: Category[];
  created_at: string;
  updated_at: string;
}

export const categoryService = {
  async getAll(token: string): Promise<Category[]> {
    return api.get<Category[]>('/categories', token);
  },

  async getOne(id: number, token: string): Promise<Category> {
    return api.get<Category>(`/categories/${id}`, token);
  },

  async create(
    data: Omit<Category, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    token: string
  ): Promise<Category> {
    return api.post<Category>('/categories', data, token);
  },

  async update(id: number, data: Partial<Category>, token: string): Promise<Category> {
    return api.put<Category>(`/categories/${id}`, data, token);
  },

  async delete(id: number, token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/categories/${id}`, token);
  },
};
