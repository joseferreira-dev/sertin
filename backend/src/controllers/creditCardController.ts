import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth';
import { CreditCard } from '../models/CreditCard';

export const creditCardController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const onlyActive = req.query.onlyActive === 'true';
      const cards = CreditCard.findByUser(userId, onlyActive);
      // Adiciona saldo atual a cada cartão
      const cardsWithBalance = cards.map((card) => ({
        ...card,
        current_balance: CreditCard.getCurrentBalance(card.id!, userId),
      }));
      res.json(cardsWithBalance);
    } catch (error: any) {
      console.error('Erro ao listar cartões:', error);
      res.status(500).json({ error: 'Erro ao buscar cartões' });
    }
  },

  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const card = CreditCard.findById(id, userId);
      if (!card) {
        return res.status(404).json({ error: 'Cartão não encontrado' });
      }
      const balance = CreditCard.getCurrentBalance(id, userId);
      res.json({ ...card, current_balance: balance });
    } catch (error: any) {
      console.error('Erro ao buscar cartão:', error);
      res.status(500).json({ error: 'Erro ao buscar cartão' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, institution, limit_amount, closing_day, due_day, color, icon, status } =
        req.body;

      if (!name || !limit_amount || !closing_day || !due_day) {
        return res.status(400).json({
          error: 'Campos obrigatórios: name, limit_amount, closing_day, due_day',
        });
      }

      const id = CreditCard.create({
        user_id: userId,
        name,
        institution: institution || '',
        limit_amount,
        closing_day,
        due_day,
        color: color || '#10b981',
        icon: icon || 'CreditCard',
        status: status || 'active',
      });

      const newCard = CreditCard.findById(id, userId);
      const balance = CreditCard.getCurrentBalance(id, userId);
      res.status(201).json({ ...newCard, current_balance: balance });
    } catch (error: any) {
      console.error('Erro ao criar cartão:', error);
      res.status(500).json({ error: 'Erro ao criar cartão' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = CreditCard.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Cartão não encontrado' });
      }

      const { name, institution, limit_amount, closing_day, due_day, color, icon, status } =
        req.body;

      const updateData: any = {};
      if (name !== undefined) updateData.name = name;
      if (institution !== undefined) updateData.institution = institution;
      if (limit_amount !== undefined) updateData.limit_amount = limit_amount;
      if (closing_day !== undefined) updateData.closing_day = closing_day;
      if (due_day !== undefined) updateData.due_day = due_day;
      if (color !== undefined) updateData.color = color;
      if (icon !== undefined) updateData.icon = icon;
      if (status !== undefined) updateData.status = status;

      CreditCard.update(id, userId, updateData);

      const updated = CreditCard.findById(id, userId);
      const balance = CreditCard.getCurrentBalance(id, userId);
      res.json({ ...updated, current_balance: balance });
    } catch (error: any) {
      console.error('Erro ao atualizar cartão:', error);
      res.status(500).json({ error: 'Erro ao atualizar cartão' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = CreditCard.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Cartão não encontrado' });
      }

      CreditCard.delete(id, userId);
      res.json({ message: 'Cartão excluído com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir cartão:', error);
      res.status(400).json({ error: error.message || 'Erro ao excluir cartão' });
    }
  },
};
