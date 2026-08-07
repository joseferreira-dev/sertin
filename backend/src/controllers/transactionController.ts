import { Response } from 'express';
import { Transaction } from '../models/Transaction';
import { AuthRequest } from '../middlewares/auth';
import { Account } from '../models/Account';
import { Jar } from '../models/Jar';
import { CreditCard } from '../models/CreditCard';

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

async function validateSourceActive(
  userId: number,
  accountId?: number | null,
  jarId?: number | null,
  creditCardId?: number | null
): Promise<void> {
  if (accountId) {
    const account = Account.findById(accountId, userId);
    if (!account || account.status !== 'active') {
      throw new Error('A conta selecionada está inativa. Não é possível realizar transações.');
    }
  }
  if (jarId) {
    const jar = Jar.findById(jarId, userId);
    if (!jar || jar.status !== 'active') {
      throw new Error('A caixinha selecionada está inativa. Não é possível realizar transações.');
    }
  }
  if (creditCardId) {
    const card = CreditCard.findById(creditCardId, userId);
    if (!card || card.status !== 'active') {
      throw new Error('O cartão selecionado está inativo. Não é possível realizar transações.');
    }
  }
}

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
        credit_card_id,
        category_id,
        dest_account_id,
        dest_jar_id,
        jar_id,
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

      if (!type || amount === undefined || !description || !date) {
        return res
          .status(400)
          .json({ error: 'Campos obrigatórios: type, amount, description, date' });
      }

      const validatedType = validateType(type);
      const validatedStatus = validateStatus(status || 'pending');

      if (validatedStatus !== 'pending' && !account_id && !jar_id && !credit_card_id) {
        return res.status(400).json({
          error:
            'Transações confirmadas ou canceladas devem ter uma conta, caixinha ou cartão vinculado.',
        });
      }

      // Valida se a fonte está ativa (quando status = confirmed ou cancelled)
      if (validatedStatus !== 'pending') {
        await validateSourceActive(userId, account_id, jar_id, credit_card_id);
      }

      const id = Transaction.create({
        user_id: userId,
        account_id: account_id || null,
        jar_id: jar_id || null,
        credit_card_id: credit_card_id || null,
        category_id: category_id || null,
        dest_account_id: dest_account_id || null,
        dest_jar_id: dest_jar_id || null,
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

      // Atualiza saldos se confirmada
      if (account_id && validatedStatus === 'confirmed') {
        Transaction.updateAccountBalance(account_id, userId);
        if (validatedType === 'transfer' && dest_account_id) {
          Transaction.updateAccountBalance(dest_account_id, userId);
        }
        if (jar_id) {
          Transaction.updateJarBalance(jar_id, userId);
        }
        if (dest_jar_id) {
          Transaction.updateJarBalance(dest_jar_id, userId);
        }
      }

      const newTransaction = Transaction.findById(id, userId);
      const tags = Transaction.getTags(id);
      res.status(201).json({ ...newTransaction, tags });
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      res.status(500).json({ error: error.message || 'Erro ao criar transação' });
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

      // Se for parcela, permitir apenas alterar status e data
      if (existing.installment_id) {
        const allowedFields = ['status', 'date'];
        const requestedFields = Object.keys(req.body);
        const hasOnlyAllowed = requestedFields.every((f) => allowedFields.includes(f));
        if (!hasOnlyAllowed) {
          return res.status(403).json({
            error: 'Para parcelas, só é permitido alterar status (para desfazer pagamento) e data.',
          });
        }
      }

      const {
        account_id,
        jar_id,
        credit_card_id,
        category_id,
        dest_account_id,
        dest_jar_id,
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
      const oldJarId = existing.jar_id;
      const oldDestJarId = existing.dest_jar_id;
      const oldType = existing.type;
      const newStatus = status ? validateStatus(status) : existing.status;

      if (newStatus !== 'pending') {
        const newAccountId = account_id !== undefined ? account_id : existing.account_id;
        const newJarId = jar_id !== undefined ? jar_id : existing.jar_id;
        const newCreditCardId =
          credit_card_id !== undefined ? credit_card_id : existing.credit_card_id;
        if (!newAccountId && !newJarId && !newCreditCardId) {
          return res.status(400).json({
            error:
              'Transações confirmadas ou canceladas devem ter uma conta, caixinha ou cartão vinculado.',
          });
        }
        // Valida se a fonte está ativa
        await validateSourceActive(userId, newAccountId, newJarId, newCreditCardId);
      }

      const updateData: any = {};
      if (account_id !== undefined) updateData.account_id = account_id || null;
      if (jar_id !== undefined) updateData.jar_id = jar_id || null;
      if (credit_card_id !== undefined) updateData.credit_card_id = credit_card_id || null;
      if (category_id !== undefined) updateData.category_id = category_id || null;
      if (dest_account_id !== undefined) updateData.dest_account_id = dest_account_id || null;
      if (dest_jar_id !== undefined) updateData.dest_jar_id = dest_jar_id || null;
      if (type !== undefined) updateData.type = validateType(type);
      if (amount !== undefined) updateData.amount = amount;
      if (description !== undefined) updateData.description = description;
      if (date !== undefined) updateData.date = date;
      if (status !== undefined) updateData.status = newStatus;
      if (installment_total !== undefined) updateData.installment_total = installment_total;
      if (installment_current !== undefined) updateData.installment_current = installment_current;
      if (recurring_id !== undefined) updateData.recurring_id = recurring_id || null;
      if (meta_id !== undefined) updateData.meta_id = meta_id || null;
      if (attachment_path !== undefined) updateData.attachment_path = attachment_path || null;

      Transaction.update(id, userId, updateData);

      if (tagIds && Array.isArray(tagIds)) {
        Transaction.setTags(id, tagIds);
      }

      const finalAccountId = updateData.account_id ?? oldAccountId;
      const finalDestAccountId = updateData.dest_account_id ?? oldDestAccountId;
      const finalJarId = updateData.jar_id ?? oldJarId;
      const finalDestJarId = updateData.dest_jar_id ?? oldDestJarId;
      const finalType = updateData.type ?? oldType;
      const finalStatus = updateData.status ?? existing.status;

      const accountsToUpdate = new Set<number>();
      const jarsToUpdate = new Set<number>();

      if (oldAccountId) accountsToUpdate.add(oldAccountId);
      if (finalAccountId && finalStatus === 'confirmed') accountsToUpdate.add(finalAccountId);
      if (oldType === 'transfer' && oldDestAccountId) accountsToUpdate.add(oldDestAccountId);
      if (finalType === 'transfer' && finalDestAccountId && finalStatus === 'confirmed')
        accountsToUpdate.add(finalDestAccountId);

      if (oldJarId) jarsToUpdate.add(oldJarId);
      if (finalJarId && finalStatus === 'confirmed') jarsToUpdate.add(finalJarId);
      if (oldType === 'transfer' && oldDestJarId) jarsToUpdate.add(oldDestJarId);
      if (finalType === 'transfer' && finalDestJarId && finalStatus === 'confirmed')
        jarsToUpdate.add(finalDestJarId);

      for (const accId of accountsToUpdate) {
        Transaction.updateAccountBalance(accId, userId);
      }
      for (const jarId of jarsToUpdate) {
        Transaction.updateJarBalance(jarId, userId);
      }

      const updated = Transaction.findById(id, userId);
      const tags = Transaction.getTags(id);
      res.json({ ...updated, tags });
    } catch (error: any) {
      console.error('Erro ao atualizar transação:', error);
      res.status(500).json({ error: error.message || 'Erro ao atualizar transação' });
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
      const jarId = existing.jar_id;
      const destJarId = existing.dest_jar_id;
      const type = existing.type;

      Transaction.setTags(id, []);
      Transaction.delete(id, userId);

      if (accountId) {
        Transaction.updateAccountBalance(accountId, userId);
        if (type === 'transfer' && destAccountId) {
          Transaction.updateAccountBalance(destAccountId, userId);
        }
        if (jarId) {
          Transaction.updateJarBalance(jarId, userId);
        }
        if (type === 'transfer' && destJarId) {
          Transaction.updateJarBalance(destJarId, userId);
        }
      }

      res.json({ message: 'Transação excluída com sucesso' });
    } catch (error: any) {
      console.error('Erro ao excluir transação:', error);
      res.status(500).json({ error: 'Erro ao excluir transação' });
    }
  },
};
