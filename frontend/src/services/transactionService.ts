import { api } from './api';

export interface Transaction {
  id: number;
  user_id: number;
  account_id: number;
  category_id?: number | null;
  dest_account_id?: number | null;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  date: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  installment_total?: number;
  installment_current?: number;
  tags?: any[];
}

export const transactionService = {
  async getAll(token: string, filters?: any): Promise<Transaction[]> {
    const query = new URLSearchParams(filters).toString();
    const url = `/transactions${query ? '?' + query : ''}`;
    return api.get<Transaction[]>(url, token);
  },
  async create(data: any, token: string): Promise<Transaction> {
    return api.post<Transaction>('/transactions', data, token);
  },
  async update(id: number, data: any, token: string): Promise<Transaction> {
    return api.put<Transaction>(`/transactions/${id}`, data, token);
  },
  async delete(id: number, token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/transactions/${id}`, token);
  },
};
