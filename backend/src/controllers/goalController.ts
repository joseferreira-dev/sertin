// backend/src/controllers/goalController.ts
import { Request, Response } from 'express';
import { Goal } from '../models/Goal';
import { AuthRequest } from '../middlewares/auth';
import { Transaction } from '../models/Transaction';

export const goalController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, type, limit } = req.query;
      const filters: any = {};
      if (status) filters.status = String(status);
      if (type) filters.type = String(type);
      if (limit) filters.limit = Number(limit);
      const goals = Goal.findByUser(userId, filters);
      res.json(goals);
    } catch (error: any) {
      console.error('Erro ao listar metas:', error);
      res.status(500).json({ error: 'Erro ao buscar metas' });
    }
  },

  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const goal = Goal.findById(id, userId);
      if (!goal) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }
      res.json(goal);
    } catch (error: any) {
      console.error('Erro ao buscar meta:', error);
      res.status(500).json({ error: 'Erro ao buscar meta' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        name,
        type,
        target_amount,
        color,
        icon,
        priority,
        target_date,
        description,
        annual_yield,
      } = req.body;

      if (!name || target_amount === undefined) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, target_amount',
        });
      }

      const id = Goal.create({
        user_id: userId,
        name,
        type: type || 'free',
        target_amount,
        color: color || '#10b981',
        icon: icon || '🎯',
        priority: priority || 'medium',
        status: 'active',
        target_date: target_date || undefined,
        description: description || undefined,
        annual_yield: annual_yield || 0,
      });

      const newGoal = Goal.findById(id, userId);
      res.status(201).json(newGoal);
    } catch (error: any) {
      console.error('Erro ao criar meta:', error);
      res.status(500).json({ error: 'Erro ao criar meta' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Goal.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }

      const {
        name,
        type,
        target_amount,
        color,
        icon,
        priority,
        status,
        target_date,
        description,
        annual_yield,
      } = req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (type !== undefined) updateData.type = type;
      if (target_amount !== undefined) updateData.target_amount = target_amount;
      if (color !== undefined) updateData.color = color;
      if (icon !== undefined) updateData.icon = icon;
      if (priority !== undefined) updateData.priority = priority;
      if (status !== undefined) updateData.status = status;
      if (target_date !== undefined) updateData.target_date = target_date || undefined;
      if (description !== undefined) updateData.description = description;
      if (annual_yield !== undefined) updateData.annual_yield = annual_yield;

      Goal.update(id, userId, updateData);

      const updated = Goal.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar meta:', error);
      res.status(500).json({ error: 'Erro ao atualizar meta' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      Goal.delete(id, userId);
      res.json({ message: 'Meta excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir meta:', error);
      res.status(400).json({ error: error.message || 'Erro ao excluir meta' });
    }
  },

  async archive(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Goal.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Meta não encontrada' });
      }

      Goal.update(id, userId, { status: 'archived' });
      const updated = Goal.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao arquivar meta:', error);
      res.status(500).json({ error: 'Erro ao arquivar meta' });
    }
  },

  async unarchive(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      Goal.unarchive(id, userId);
      const updated = Goal.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao desarquivar meta:', error);
      res.status(500).json({ error: 'Erro ao desarquivar meta' });
    }
  },

  async addContribution(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const goalId = parseInt(String(req.params.id));
      if (isNaN(goalId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const { newTotal, amount, date, note } = req.body;
      let diff: number;

      if (newTotal !== undefined) {
        const total = parseFloat(newTotal);
        if (isNaN(total)) return res.status(400).json({ error: 'newTotal inválido' });
        const goal = Goal.findById(goalId, userId);
        if (!goal) return res.status(404).json({ error: 'Meta não encontrada' });
        diff = total - goal.current_amount;
      } else if (amount !== undefined) {
        diff = parseFloat(amount);
        if (isNaN(diff)) return res.status(400).json({ error: 'amount inválido' });
      } else {
        return res.status(400).json({ error: 'Forneça newTotal ou amount' });
      }

      if (diff === 0) {
        const goal = Goal.findById(goalId, userId);
        return res.json({ message: 'Nenhuma alteração no saldo', goal });
      }

      Goal.addContribution(goalId, userId, diff, date, note);
      const updatedGoal = Goal.findById(goalId, userId);
      res.json(updatedGoal);
    } catch (error: any) {
      console.error('Erro ao adicionar contribuição:', error);
      res.status(500).json({ error: error.message || 'Erro ao adicionar contribuição' });
    }
  },

  async getContributions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const goalId = parseInt(String(req.params.id));
      if (isNaN(goalId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const contributions = Goal.getContributions(goalId, userId);
      res.json(contributions);
    } catch (error: any) {
      console.error('Erro ao buscar contribuições:', error);
      res.status(500).json({ error: error.message || 'Erro ao buscar contribuições' });
    }
  },
};
