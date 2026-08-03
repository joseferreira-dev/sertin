import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middlewares/auth';

type TransactionStatus = 'pending' | 'confirmed' | 'cancelled';
type TransactionType = 'income' | 'expense' | 'transfer';

const validateStatus = (status: string): TransactionStatus => {
  if (status === 'pending' || status === 'confirmed' || status === 'cancelled') {
    return status;
  }
  return 'confirmed';
};

const validateType = (type: string): TransactionType => {
  if (type === 'income' || type === 'expense' || type === 'transfer') {
    return type;
  }
  throw new Error('Tipo de transação inválido');
};

export const transactionController = {
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

      let transactions = Transaction.findWithTags(userId, filters);
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
      const tags = Transaction.getTags(id);
      res.json({ ...transaction, tags });
    } catch (error: any) {
      console.error('Erro ao buscar transação:', error);
      res.status(500).json({ error: 'Erro ao buscar transação' });
    }
  },

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
        tagIds,
      } = req.body;

      if (!account_id || !type || !amount || !description || !date) {
        return res
          .status(400)
          .json({ error: 'Campos obrigatórios: account_id, type, amount, description, date' });
      }

      const validatedType = validateType(type);
      const validatedStatus = validateStatus(status);

      const id = Transaction.create({
        user_id: userId,
        account_id,
        category_id: category_id || null,
        dest_account_id: dest_account_id || null,
        type: validatedType,
        amount,
        description,
        date,
        status: validatedStatus,
        installment_total: installment_total || 1,
        installment_current: installment_current || 1,
        recurring_id: recurring_id || null,
        meta_id: meta_id || null,
        attachment_path: attachment_path || null,
      });

      if (tagIds && Array.isArray(tagIds)) {
        Transaction.setTags(id, tagIds);
      }

      Transaction.updateAccountBalance(account_id, userId);
      if (validatedType === 'transfer' && dest_account_id) {
        Transaction.updateAccountBalance(dest_account_id, userId);
      }

      const newTransaction = Transaction.findById(id, userId);
      const tags = Transaction.getTags(id);
      res.status(201).json({ ...newTransaction, tags });
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({ error: 'Erro ao criar transação' });
    }
  },

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

      if (existing.installment_id) {
        return res.status(403).json({
          error:
            'Não é possível editar uma parcela individualmente. Gerencie o parcelamento completo.',
        });
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
        tagIds,
      } = req.body;

      const oldAccountId = existing.account_id;
      const oldDestAccountId = existing.dest_account_id;
      const oldType = existing.type;

      const updateData: any = {};
      if (account_id !== undefined) updateData.account_id = account_id;
      if (category_id !== undefined) updateData.category_id = category_id || null;
      if (dest_account_id !== undefined) updateData.dest_account_id = dest_account_id || null;
      if (type !== undefined) updateData.type = validateType(type);
      if (amount !== undefined) updateData.amount = amount;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = date;
      if (status !== undefined) updateData.status = validateStatus(status);
      if (installment_total !== undefined) updateData.installment_total = installment_total;
      if (installment_current !== undefined) updateData.installment_current = installment_current;
      if (recurring_id !== undefined) updateData.recurring_id = recurring_id || null;
      if (meta_id !== undefined) updateData.meta_id = meta_id || null;
      if (attachment_path !== undefined) updateData.attachment_path = attachment_path || null;

      Transaction.update(id, userId, updateData);

      if (tagIds && Array.isArray(tagIds)) {
        Transaction.setTags(id, tagIds);
      }

      const newAccountId = updateData.account_id ?? oldAccountId;
      const newDestAccountId = updateData.dest_account_id ?? oldDestAccountId;
      const newType = updateData.type ?? oldType;

      const accountsToUpdate = new Set<number>();
      if (oldAccountId) accountsToUpdate.add(oldAccountId);
      if (newAccountId) accountsToUpdate.add(newAccountId);
      if (oldType === 'transfer' && oldDestAccountId) accountsToUpdate.add(oldDestAccountId);
      if (newType === 'transfer' && newDestAccountId) accountsToUpdate.add(newDestAccountId);

      for (const accId of accountsToUpdate) {
        Transaction.updateAccountBalance(accId, userId);
      }

      const updated = Transaction.findById(id, userId);
      const tags = Transaction.getTags(id);
      res.json({ ...updated, tags });
    } catch (error: any) {
      console.error('Erro ao atualizar transação:', error);
      res.status(500).json({ error: 'Erro ao atualizar transação' });
    }
  },

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

      if (existing.installment_id) {
        return res.status(403).json({
          error:
            'Não é possível excluir uma parcela individualmente. Gerencie o parcelamento completo.',
        });
      }

      const accountId = existing.account_id;
      const destAccountId = existing.dest_account_id;
      const type = existing.type;

      Transaction.setTags(id, []);
      Transaction.delete(id, userId);

      Transaction.updateAccountBalance(accountId, userId);
      if (type === 'transfer' && destAccountId) {
        Transaction.updateAccountBalance(destAccountId, userId);
      }

      res.json({ message: 'Transação excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir transação:', error);
      res.status(500).json({ error: 'Erro ao excluir transação' });
    }
  },
};
