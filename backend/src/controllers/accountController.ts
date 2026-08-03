import { Request, Response } from 'express';
import { Account } from '../models/Account';
import { AuthRequest } from '../middlewares/auth';
import { Transaction } from '../models/Transaction';

export const accountController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const onlyActive = req.query.onlyActive === 'true';
      const accounts = Account.findByUser(userId, onlyActive);
      res.json(accounts);
    } catch (error: any) {
      console.error('Erro ao listar contas:', error);
      res.status(500).json({ error: 'Erro ao buscar contas' });
    }
  },

  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const account = Account.findById(id, userId);
      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }
      res.json(account);
    } catch (error: any) {
      console.error('Erro ao buscar conta:', error);
      res.status(500).json({ error: 'Erro ao buscar conta' });
    }
  },

  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { name, type, balance, color, institution, icon, status } = req.body;

      if (!name || !type) {
        return res.status(400).json({ error: 'Nome e tipo são obrigatórios' });
      }

      const id = Account.create({
        user_id: userId,
        name,
        type,
        balance: balance || 0,
        color: color || '#10b981',
        institution: institution || '',
        icon: icon || 'Wallet',
        status: status || 'active',
      });

      const initialBalance = parseFloat(balance) || 0;
      if (initialBalance !== 0) {
        Transaction.create({
          user_id: userId,
          account_id: id,
          category_id: null,
          dest_account_id: null,
          type: 'income',
          amount: initialBalance,
          description: 'Saldo inicial',
          date: new Date().toISOString().slice(0, 10),
          status: 'confirmed',
          installment_total: 1,
          installment_current: 1,
          recurring_id: null,
          meta_id: null,
          attachment_path: null,
        });
        Transaction.updateAccountBalance(id, userId);
      }

      const newAccount = Account.findById(id, userId);
      res.status(201).json(newAccount);
    } catch (error: any) {
      console.error('Erro ao criar conta:', error);
      res.status(500).json({ error: 'Erro ao criar conta' });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const { name, color, institution, status } = req.body;

      const existing = Account.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      Account.update(id, userId, {
        name,
        color,
        institution,
        status,
      });

      const updated = Account.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar conta:', error);
      res.status(500).json({ error: 'Erro ao atualizar conta' });
    }
  },

  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Account.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      Account.delete(id, userId);
      res.json({ message: 'Conta excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir conta:', error);
      res.status(400).json({ error: error.message || 'Erro ao excluir conta' });
    }
  },

  async getNetWorth(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const netWorth = Account.getNetWorth(userId);
      res.json(netWorth);
    } catch (error: any) {
      console.error('Erro ao calcular Net Worth:', error);
      res.status(500).json({ error: 'Erro ao calcular Net Worth' });
    }
  },
};
