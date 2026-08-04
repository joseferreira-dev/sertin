import { Request, Response } from 'express';
import { Budget } from '../models/Budget';
import { AuthRequest } from '../middlewares/auth';
import { Category } from '../models/Category';

export const budgetController = {
  // GET /api/v1/budgets?month=2025-07
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const month = req.query.month as string | undefined;
      const budgets = Budget.findByUser(userId, { month });
      res.json(budgets);
    } catch (error: any) {
      console.error('Erro ao listar orçamentos:', error);
      res.status(500).json({ error: 'Erro ao buscar orçamentos' });
    }
  },

  // GET /api/v1/budgets/:id
  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const budget = Budget.findById(id, userId);
      if (!budget) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }
      res.json(budget);
    } catch (error: any) {
      console.error('Erro ao buscar orçamento:', error);
      res.status(500).json({ error: 'Erro ao buscar orçamento' });
    }
  },

  // POST /api/v1/budgets
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { category_id, month, budgeted_amount } = req.body;

      if (!category_id || !month || budgeted_amount === undefined) {
        return res.status(400).json({
          error: 'Campos obrigatórios: category_id, month, budgeted_amount',
        });
      }

      // Verificar se a categoria existe e pertence ao usuário
      const category = Category.findById(category_id, userId);
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }

      // Apenas categorias do tipo expense podem ter orçamento
      if (category.type !== 'expense') {
        return res
          .status(400)
          .json({ error: 'Orçamento só pode ser definido para categorias de despesa' });
      }

      const id = Budget.create({
        user_id: userId,
        category_id,
        month,
        budgeted_amount,
      });

      const newBudget = Budget.findById(id, userId);
      res.status(201).json(newBudget);
    } catch (error: any) {
      console.error('Erro ao criar orçamento:', error);
      if (error.message.includes('já existe um orçamento')) {
        return res.status(400).json({ error: error.message });
      }
      res.status(500).json({ error: 'Erro ao criar orçamento' });
    }
  },

  // PUT /api/v1/budgets/:id
  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Budget.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      const { budgeted_amount } = req.body;
      if (budgeted_amount === undefined) {
        return res.status(400).json({ error: 'budgeted_amount é obrigatório' });
      }

      Budget.update(id, userId, { budgeted_amount });

      const updated = Budget.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar orçamento:', error);
      res.status(500).json({ error: 'Erro ao atualizar orçamento' });
    }
  },

  // DELETE /api/v1/budgets/:id
  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Budget.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Orçamento não encontrado' });
      }

      Budget.delete(id, userId);
      res.json({ message: 'Orçamento removido com sucesso' });
    } catch (error: any) {
      console.error('Erro ao remover orçamento:', error);
      res.status(500).json({ error: 'Erro ao remover orçamento' });
    }
  },
};
