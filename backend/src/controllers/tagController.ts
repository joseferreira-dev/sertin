import { Response } from 'express';
import { Tag } from '../models/Tag';
import { AuthRequest } from '../middlewares/auth';

export const tagController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const includeDeleted = req.query.includeDeleted === 'true';
      const tags = Tag.findByUser(userId, includeDeleted);
      const tagsWithCount = tags.map((tag) => ({
        ...tag,
        count: Tag.countTransactions(tag.id!),
      }));
      res.json(tagsWithCount);
    } catch (error: any) {
      console.error('Erro ao listar tags:', error);
      res.status(500).json({ error: 'Erro ao buscar tags' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, color, description } = req.body;
      if (!name) {
        return res.status(400).json({ error: 'Nome da tag é obrigatório' });
      }
      const id = Tag.create({ user_id: userId, name, color: color || '#6366f1', description });
      const newTag = Tag.findById(id, userId);
      res.status(201).json(newTag);
    } catch (error: any) {
      console.error('Erro ao criar tag:', error);
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Já existe uma tag com este nome' });
      }
      res.status(500).json({ error: 'Erro ao criar tag' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const { name, color, description } = req.body;
      const existing = Tag.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Tag não encontrada' });
      }
      Tag.update(id, userId, { name, color, description });
      const updated = Tag.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar tag:', error);
      if (error.message.includes('UNIQUE constraint failed')) {
        return res.status(400).json({ error: 'Já existe uma tag com este nome' });
      }
      res.status(500).json({ error: 'Erro ao atualizar tag' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const existing = Tag.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Tag não encontrada' });
      }
      Tag.removeTransactionAssociations(id);
      Tag.delete(id, userId);
      res.json({ message: 'Tag excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir tag:', error);
      res.status(500).json({ error: 'Erro ao excluir tag' });
    }
  },
};
