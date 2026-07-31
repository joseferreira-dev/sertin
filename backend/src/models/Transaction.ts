import db from '../config/database';

export interface ITransaction {
  id?: number;
  user_id: number;
  account_id: number;
  category_id?: number | null;
  dest_account_id?: number | null;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  description: string;
  date: string;
  status?: 'pending' | 'confirmed' | 'cancelled';
  installment_total?: number;
  installment_current?: number;
  recurring_id?: number | null;
  meta_id?: number | null;
  attachment_path?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class Transaction {
  static create(data: Omit<ITransaction, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO transactions (
        user_id, account_id, category_id, dest_account_id, type, amount,
        description, date, status, installment_total, installment_current,
        recurring_id, meta_id, attachment_path
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.user_id,
      data.account_id,
      data.category_id || null,
      data.dest_account_id || null,
      data.type,
      data.amount,
      data.description,
      data.date,
      data.status || 'confirmed',
      data.installment_total || 1,
      data.installment_current || 1,
      data.recurring_id || null,
      data.meta_id || null,
      data.attachment_path || null
    );
    return info.lastInsertRowid as number;
  }

  static findByUser(userId: number, filters?: any): ITransaction[] {
    let sql = 'SELECT * FROM transactions WHERE user_id = ?';
    const params: any[] = [userId];
    // Aqui podemos adicionar filtros dinâmicos (período, conta, categoria, etc.)
    if (filters) {
      if (filters.startDate) {
        sql += ' AND date >= ?';
        params.push(filters.startDate);
      }
      if (filters.endDate) {
        sql += ' AND date <= ?';
        params.push(filters.endDate);
      }
      if (filters.accountId) {
        sql += ' AND account_id = ?';
        params.push(filters.accountId);
      }
      if (filters.categoryId) {
        sql += ' AND category_id = ?';
        params.push(filters.categoryId);
      }
      if (filters.type) {
        sql += ' AND type = ?';
        params.push(filters.type);
      }
    }
    sql += ' ORDER BY date DESC, id DESC';
    const stmt = db.prepare(sql);
    return stmt.all(...params) as ITransaction[];
  }

  static findById(id: number, userId: number): ITransaction | undefined {
    const stmt = db.prepare('SELECT * FROM transactions WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId) as ITransaction | undefined;
  }

  static update(id: number, userId: number, data: Partial<ITransaction>): void {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'user_id' && k !== 'created_at');
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => data[f as keyof ITransaction]);
    const stmt = db.prepare(`UPDATE transactions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`);
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
  }

  // Método para buscar transações com tags
  static findWithTags(userId: number, filters?: any): any[] {
    const txns = this.findByUser(userId, filters);
    // Para cada transação, buscar tags associadas
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      JOIN transaction_tags tt ON tt.tag_id = t.id
      WHERE tt.transaction_id = ?
    `);
    return txns.map(txn => {
      const tags = stmt.all(txn.id) as any[];
      return { ...txn, tags };
    });
  }

  // Atualizar saldo da conta após inserção/edição/exclusão de transação
  static updateAccountBalance(accountId: number, userId: number) {
    const stmt = db.prepare(`
      UPDATE accounts
      SET balance = COALESCE((
        SELECT SUM(
          CASE type
            WHEN 'income' THEN amount
            WHEN 'expense' THEN -amount
            WHEN 'transfer' AND dest_account_id = account_id THEN amount
            WHEN 'transfer' AND account_id = account_id THEN -amount
          END
        )
        FROM transactions
        WHERE account_id = ? AND user_id = ? AND status = 'confirmed'
      ), 0)
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(accountId, userId, accountId, userId);
  }
}