import { api } from './api';
export interface Goal {
  id: number;
  name: string;
  target: number;
  current: number;
  color?: string;
}
export const goalService = {
  async getAll(token: string): Promise<Goal[]> {
    return api.get<Goal[]>('/goals', token);
  },
};
