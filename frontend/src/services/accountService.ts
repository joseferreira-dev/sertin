import { api } from './api';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'digital';
  balance: number;
  color: string;
  institution: string;
  icon: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const accountService = {
  async getAll(token: string, includeInactive: boolean = true): Promise<Account[]> {
    const url = includeInactive ? '/accounts' : '/accounts?onlyActive=true';
    return api.get<Account[]>(url, token);
  },

  async getOne(id: number, token: string): Promise<Account> {
    return api.get<Account>(`/accounts/${id}`, token);
  },

  async create(
    data: Omit<Account, 'id' | 'user_id' | 'created_at' | 'updated_at'>,
    token: string
  ): Promise<Account> {
    return api.post<Account>('/accounts', data, token);
  },

  async update(id: number, data: Partial<Account>, token: string): Promise<Account> {
    return api.put<Account>(`/accounts/${id}`, data, token);
  },

  async delete(id: number, token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/accounts/${id}`, token);
  },

  async getNetWorth(
    token: string
  ): Promise<{ assets: number; liabilities: number; netWorth: number }> {
    return api.get<{ assets: number; liabilities: number; netWorth: number }>(
      '/accounts/net-worth',
      token
    );
  },
};
