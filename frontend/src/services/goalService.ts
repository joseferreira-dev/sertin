import { api } from './api';

export interface Goal {
  id: number;
  user_id: number;
  name: string;
  type: 'emergency' | 'opportunity' | 'travel' | 'material' | 'education' | 'investment' | 'free';
  target_amount: number;
  current_amount: number;
  color: string;
  icon: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'active' | 'completed' | 'delayed' | 'archived';
  target_date?: string;
  description?: string;
  annual_yield: number;
  progress?: number;
  days_remaining?: number | null;
  created_at: string;
  updated_at: string;
}

export const goalService = {
  async getAll(
    token: string,
    filters?: { status?: string; type?: string; limit?: number }
  ): Promise<Goal[]> {
    const query = new URLSearchParams();
    if (filters?.status) query.append('status', filters.status);
    if (filters?.type) query.append('type', filters.type);
    if (filters?.limit) query.append('limit', String(filters.limit));
    const url = `/goals${query.toString() ? '?' + query.toString() : ''}`;
    return api.get<Goal[]>(url, token);
  },

  async getOne(id: number, token: string): Promise<Goal> {
    return api.get<Goal>(`/goals/${id}`, token);
  },

  async create(
    data: Omit<
      Goal,
      | 'id'
      | 'user_id'
      | 'created_at'
      | 'updated_at'
      | 'current_amount'
      | 'progress'
      | 'days_remaining'
    >,
    token: string
  ): Promise<Goal> {
    // Garantir que current_amount comece com 0
    const payload = { ...data, current_amount: 0 };
    return api.post<Goal>('/goals', payload, token);
  },

  async update(id: number, data: Partial<Goal>, token: string): Promise<Goal> {
    return api.put<Goal>(`/goals/${id}`, data, token);
  },

  async archive(id: number, token: string): Promise<Goal> {
    return api.patch<Goal>(`/goals/${id}/archive`, undefined, token);
  },

  async delete(id: number, token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/goals/${id}`, token);
  },
};
