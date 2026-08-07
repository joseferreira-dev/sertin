import { api } from './api';
import { Transaction } from './transactionService';

export interface Account {
  id: number;
  user_id: number;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'digital' | 'goal';
  balance: number;
  color: string;
  institution: string;
  icon: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at: string;
}

export const accountService = {
  async getAll(
    token: string,
    filters?: { status?: 'active' | 'inactive'; type?: string }
  ): Promise<Account[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.type) query.append('type', filters.type);
    const url = `/accounts${query.toString() ? '?' + query.toString() : ''}`;
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

  async getTransactions(
    id: number,
    token: string,
    filters?: { startDate?: string; endDate?: string; type?: string }
  ): Promise<{
    account: Account;
    transactions: (Transaction & { running_balance: number; impact: number })[];
    initial_balance: number;
    final_balance: number;
  }> {
    const query = new URLSearchParams();
    if (filters?.startDate) query.append('startDate', filters.startDate);
    if (filters?.endDate) query.append('endDate', filters.endDate);
    if (filters?.type) query.append('type', filters.type);
    const url = `/accounts/${id}/transactions${query.toString() ? '?' + query.toString() : ''}`;
    return api.get(url, token);
  },
};
