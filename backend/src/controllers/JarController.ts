import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { Jar } from '../models/Jar';

export const jarController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const onlyActive = req.query.onlyActive === 'true';
      const jars = Jar.findByUser(userId, onlyActive);
      res.json(jars);
    } catch (error: any) {
      console.error('Erro ao listar caixinhas:', error);
      res.status(500).json({ error: 'Erro ao buscar caixinhas' });
    }
  },

  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
      const jar = Jar.findById(id, userId);
      if (!jar) return res.status(404).json({ error: 'Caixinha não encontrada' });
      res.json(jar);
    } catch (error: any) {
      console.error('Erro ao buscar caixinha:', error);
      res.status(500).json({ error: 'Erro ao buscar caixinha' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, color, icon, description, status } = req.body;
      if (!name) return res.status(400).json({ error: 'Nome é obrigatório' });
      const id = Jar.create({
        user_id: userId,
        name,
        balance: 0,
        color: color || '#10b981',
        icon: icon || '💰',
        description: description || null,
        status: status || 'active',
      });
      const newJar = Jar.findById(id, userId);
      res.status(201).json(newJar);
    } catch (error: any) {
      console.error('Erro ao criar caixinha:', error);
      res.status(500).json({ error: 'Erro ao criar caixinha' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
      const { name, color, icon, description, status } = req.body;
      const existing = Jar.findById(id, userId);
      if (!existing) return res.status(404).json({ error: 'Caixinha não encontrada' });
      Jar.update(id, userId, { name, color, icon, description, status });
      const updated = Jar.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar caixinha:', error);
      res.status(500).json({ error: 'Erro ao atualizar caixinha' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) return res.status(400).json({ error: 'ID inválido' });
      const existing = Jar.findById(id, userId);
      if (!existing) return res.status(404).json({ error: 'Caixinha não encontrada' });
      Jar.delete(id, userId);
      res.json({ message: 'Caixinha excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir caixinha:', error);
      res.status(400).json({ error: error.message || 'Erro ao excluir caixinha' });
    }
  },
};
