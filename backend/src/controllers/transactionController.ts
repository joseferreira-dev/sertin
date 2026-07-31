import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middlewares/auth';

export const transactionController = {
  // Listar transações do usuário com filtros opcionais
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { startDate, endDate, accountId, categoryId, type, limit } = req.query;

      const filters: any = {};
      if (startDate) filters.startDate = String(startDate);
      if (endDate) filters.endDate = String(endDate);
      if (accountId) filters.accountId = Number(accountId);
      if (categoryId) filters.categoryId = Number(categoryId);
      if (type) filters.type = String(type);

      let transactions = Transaction.findByUser(userId, filters);

      // Limitar número de resultados, se especificado
      if (limit) {
        const limitNum = Number(limit);
        if (!isNaN(limitNum) && limitNum > 0) {
          transactions = transactions.slice(0, limitNum);
        }
      }

      res.json(transactions);
    } catch (error: any) {
      console.error('Erro ao listar transações:', error);
      res.status(500).json({ error: 'Erro ao buscar transações' });
    }
  },

  // Obter uma transação específica
  async getOne(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }
      const transaction = Transaction.findById(id, userId);
      if (!transaction) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }
      res.json(transaction);
    } catch (error: any) {
      console.error('Erro ao buscar transação:', error);
      res.status(500).json({ error: 'Erro ao buscar transação' });
    }
  },

  // Criar nova transação
  async create(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const {
        account_id,
        category_id,
        dest_account_id,
        type,
        amount,
        description,
        date,
        status,
        installment_total,
        installment_current,
        recurring_id,
        meta_id,
        attachment_path,
      } = req.body;

      if (!account_id || !type || !amount || !description || !date) {
        return res
          .status(400)
          .json({ error: 'Campos obrigatórios: account_id, type, amount, description, date' });
      }

      const id = Transaction.create({
        user_id: userId,
        account_id,
        category_id: category_id || null,
        dest_account_id: dest_account_id || null,
        type,
        amount,
        description,
        date,
        status: status || 'confirmed',
        installment_total: installment_total || 1,
        installment_current: installment_current || 1,
        recurring_id: recurring_id || null,
        meta_id: meta_id || null,
        attachment_path: attachment_path || null,
      });

      // Atualizar saldo da conta
      Transaction.updateAccountBalance(account_id, userId);

      const newTransaction = Transaction.findById(id, userId);
      res.status(201).json(newTransaction);
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({ error: 'Erro ao criar transação' });
    }
  },

  // Atualizar transação
  async update(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Transaction.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      const {
        account_id,
        category_id,
        dest_account_id,
        type,
        amount,
        description,
        date,
        status,
        installment_total,
        installment_current,
        recurring_id,
        meta_id,
        attachment_path,
      } = req.body;

      // Se a conta de origem for alterada, atualizar saldo da conta antiga e da nova
      const oldAccountId = existing.account_id;

      Transaction.update(id, userId, {
        account_id,
        category_id,
        dest_account_id,
        type,
        amount,
        description,
        date,
        status,
        installment_total,
        installment_current,
        recurring_id,
        meta_id,
        attachment_path,
      });

      // Atualizar saldos
      if (oldAccountId !== account_id) {
        Transaction.updateAccountBalance(oldAccountId, userId);
        Transaction.updateAccountBalance(account_id, userId);
      } else {
        Transaction.updateAccountBalance(account_id, userId);
      }

      const updated = Transaction.findById(id, userId);
      res.json(updated);
    } catch (error: any) {
      console.error('Erro ao atualizar transação:', error);
      res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
  },

  // Excluir transação
  async remove(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const id = parseInt(String(req.params.id));
      if (isNaN(id)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const existing = Transaction.findById(id, userId);
      if (!existing) {
        return res.status(404).json({ error: 'Transação não encontrada' });
      }

      const accountId = existing.account_id;
      Transaction.delete(id, userId);

      // Atualizar saldo da conta
      Transaction.updateAccountBalance(accountId, userId);

      res.json({ message: 'Transação excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir transação:', error);
      res.status(500).json({ error: 'Erro ao excluir transação' });
    }
  },
};
