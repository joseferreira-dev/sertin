import { Request, Response } from 'express';
import { Account } from '../models/Account';
import { AuthRequest } from '../middlewares/auth';
import { Transaction } from '../models/Transaction';
import db from '../config/database';

export const accountController = {
  async getAll(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, type } = req.query;
      const filters: { status?: 'active' | 'inactive'; type?: string } = {};
      if (status === 'active' || status === 'inactive') filters.status = status;
      if (type) filters.type = String(type);
      const accounts = Account.findByUser(userId, filters);
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

  async getTransactions(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const accountId = parseInt(String(req.params.id));
      if (isNaN(accountId)) {
        return res.status(400).json({ error: 'ID inválido' });
      }

      const account = Account.findById(accountId, userId);
      if (!account) {
        return res.status(404).json({ error: 'Conta não encontrada' });
      }

      // Filtros via query string
      const { startDate, endDate, type } = req.query;

      let sql = `
        SELECT t.*,
          json_group_array(DISTINCT json_object(
            'id', tg.id,
            'name', tg.name,
            'color', tg.color
          )) as tags
        FROM transactions t
        LEFT JOIN transaction_tags tt ON tt.transaction_id = t.id
        LEFT JOIN tags tg ON tg.id = tt.tag_id
        WHERE t.user_id = ?
          AND t.status = 'confirmed'
          AND (
            t.account_id = ?
            OR t.dest_account_id = ?
          )
          AND t.type IN ('income', 'expense', 'transfer')
      `;

      const params: any[] = [userId, accountId, accountId];

      if (startDate) {
        sql += ' AND t.date >= ?';
        params.push(startDate);
      }
      if (endDate) {
        sql += ' AND t.date <= ?';
        params.push(endDate);
      }
      if (type && ['income', 'expense', 'transfer'].includes(String(type))) {
        sql += ' AND t.type = ?';
        params.push(type);
      }

      sql += ' GROUP BY t.id ORDER BY t.date DESC, t.id DESC';

      const stmt = db.prepare(sql);
      const rows = stmt.all(...params) as any[];

      const txs = rows.map((row: any) => {
        let tags: any[] = [];
        if (row.tags) {
          try {
            tags = JSON.parse(row.tags);
            tags = tags.filter((t: any) => t !== null);
          } catch {
            tags = [];
          }
        }

        let impact = 0;
        if (row.type === 'income') {
          impact = row.amount;
        } else if (row.type === 'expense') {
          impact = -Math.abs(row.amount);
        } else if (row.type === 'transfer') {
          if (row.account_id === accountId) {
            impact = -Math.abs(row.amount);
          } else if (row.dest_account_id === accountId) {
            impact = Math.abs(row.amount);
          }
        }

        delete row.tags;
        return { ...row, tags, impact };
      });

      // Calcula saldo acumulado (do mais antigo para o mais novo)
      const txsAsc = [...txs].reverse();
      let running = account.balance; // saldo atual da conta
      for (const tx of txsAsc) {
        running -= tx.impact;
      }
      // running agora é o saldo anterior à primeira transação (saldo inicial do período)

      const result: any[] = [];
      let balance = running;
      for (const tx of txsAsc) {
        balance += tx.impact;
        result.push({
          ...tx,
          running_balance: balance,
        });
      }
      result.reverse();

      res.json({
        account,
        transactions: result,
        initial_balance: running,
        final_balance: account.balance,
      });
    } catch (error: any) {
      console.error('Erro ao buscar extrato da conta:', error);
      res.status(500).json({ error: 'Erro ao buscar extrato da conta' });
    }
  },
};
