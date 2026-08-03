import { api } from './api';

export interface Installment {
  id: number;
  user_id: number;
  account_id: number;
  category_id?: number | null;
  description: string;
  total_amount: number;
  installment_count: number;
  start_date: string;
  status: 'active' | 'completed' | 'canceled';
  paid_installments?: number;
  total_installments?: number;
  created_at: string;
  updated_at: string;
}

export const installmentService = {
  async getAll(token: string, filters?: any): Promise<Installment[]> {
    const query = new URLSearchParams(filters).toString();
    const url = `/installments${query ? '?' + query : ''}`;
    return api.get<Installment[]>(url, token);
  },

  async getOne(id: number, token: string): Promise<Installment & { transactions: any[] }> {
    return api.get<any>(`/installments/${id}`, token);
  },

  async create(data: any, token: string): Promise<Installment> {
    return api.post<Installment>('/installments', data, token);
  },

  async update(id: number, data: any, token: string): Promise<Installment> {
    return api.put<Installment>(`/installments/${id}`, data, token);
  },

  async delete(id: number, token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/installments/${id}`, token);
  },

  async payInstallment(
    installmentId: number,
    installmentNumber: number,
    token: string
  ): Promise<{ message: string }> {
    return api.patch<{ message: string }>(
      `/installments/${installmentId}/pay/${installmentNumber}`,
      undefined,
      token
    );
  },
};
