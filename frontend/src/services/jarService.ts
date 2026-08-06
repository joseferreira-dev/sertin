import { api } from './api';

export interface Jar {
  id: number;
  user_id: number;
  name: string;
  balance: number;
  color: string;
  icon: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const jarService = {
  async getAll(token: string, onlyActive?: boolean): Promise<Jar[]> {
    const url = onlyActive ? '/jars?onlyActive=true' : '/jars';
    return api.get<Jar[]>(url, token);
  },

  async getOne(id: number, token: string): Promise<Jar> {
    return api.get<Jar>(`/jars/${id}`, token);
  },

  async create(
    data: Omit<Jar, 'id' | 'user_id' | 'balance' | 'created_at' | 'updated_at'>,
    token: string
  ): Promise<Jar> {
    return api.post<Jar>('/jars', data, token);
  },

  async update(id: number, data: Partial<Jar>, token: string): Promise<Jar> {
    return api.put<Jar>(`/jars/${id}`, data, token);
  },

  async delete(id: number, token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/jars/${id}`, token);
  },
};
