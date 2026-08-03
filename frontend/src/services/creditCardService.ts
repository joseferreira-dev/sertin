import { api } from './api';

export interface CreditCard {
  id: number;
  user_id: number;
  name: string;
  institution: string;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  color: string;
  icon: string;
  status: 'active' | 'inactive';
  current_balance?: number;
  created_at: string;
  updated_at: string;
}

export const creditCardService = {
  async getAll(token: string, onlyActive?: boolean): Promise<CreditCard[]> {
    const url = onlyActive ? '/credit-cards?onlyActive=true' : '/credit-cards';
    return api.get<CreditCard[]>(url, token);
  },

  async getOne(id: number, token: string): Promise<CreditCard> {
    return api.get<CreditCard>(`/credit-cards/${id}`, token);
  },

  async create(
    data: Omit<CreditCard, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'current_balance'>,
    token: string
  ): Promise<CreditCard> {
    return api.post<CreditCard>('/credit-cards', data, token);
  },

  async update(id: number, data: Partial<CreditCard>, token: string): Promise<CreditCard> {
    return api.put<CreditCard>(`/credit-cards/${id}`, data, token);
  },

  async delete(id: number, token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/credit-cards/${id}`, token);
  },
};
