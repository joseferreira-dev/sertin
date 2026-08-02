import { api } from './api';

export interface Tag {
  id: number;
  user_id: number;
  name: string;
  color: string;
  description?: string;
  count?: number;
  created_at: string;
  updated_at: string;
}

export const tagService = {
  async getAll(token: string, includeDeleted?: boolean): Promise<Tag[]> {
    const url = `/tags${includeDeleted ? '?includeDeleted=true' : ''}`;
    return api.get<Tag[]>(url, token);
  },
  async create(
    data: { name: string; color?: string; description?: string },
    token: string
  ): Promise<Tag> {
    return api.post<Tag>('/tags', data, token);
  },
  async update(
    id: number,
    data: { name?: string; color?: string; description?: string },
    token: string
  ): Promise<Tag> {
    return api.put<Tag>(`/tags/${id}`, data, token);
  },
  async delete(id: number, token: string): Promise<{ message: string }> {
    return api.delete<{ message: string }>(`/tags/${id}`, token);
  },
};
