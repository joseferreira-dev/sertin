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
    const fields = Object.keys(data).filter(
      (k) => k !== 'id' && k !== 'user_id' && k !== 'created_at'
    );
    if (fields.length === 0) return;
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f as keyof ITransaction]);
    const stmt = db.prepare(
      `UPDATE transactions SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    );
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    const stmt = db.prepare('DELETE FROM transactions WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
  }

  static findWithTags(userId: number, filters?: any): any[] {
    const txns = this.findByUser(userId, filters);
    return txns.map((txn) => {
      const tags = this.getTags(txn.id!);
      return { ...txn, tags };
    });
  }

  static getTags(transactionId: number): any[] {
    const stmt = db.prepare(`
      SELECT t.* FROM tags t
      JOIN transaction_tags tt ON tt.tag_id = t.id
      WHERE tt.transaction_id = ?
    `);
    return stmt.all(transactionId);
  }

  static addTags(transactionId: number, tagIds: number[]): void {
    if (!tagIds.length) return;
    const stmt = db.prepare(
      'INSERT OR IGNORE INTO transaction_tags (transaction_id, tag_id) VALUES (?, ?)'
    );
    const insert = db.transaction((ids: number[]) => {
      for (const tagId of ids) {
        stmt.run(transactionId, tagId);
      }
    });
    insert(tagIds);
  }

  static setTags(transactionId: number, tagIds: number[]): void {
    const delStmt = db.prepare('DELETE FROM transaction_tags WHERE transaction_id = ?');
    delStmt.run(transactionId);
    if (tagIds.length > 0) {
      this.addTags(transactionId, tagIds);
    }
  }

  static updateAccountBalance(accountId: number, userId: number) {
    const stmt = db.prepare(`
      UPDATE accounts
      SET balance = COALESCE((
        SELECT SUM(
          CASE
            WHEN type = 'income' THEN amount
            WHEN type = 'expense' THEN amount
            WHEN type = 'transfer' AND dest_account_id = ? THEN amount
            WHEN type = 'transfer' AND account_id = ? THEN -amount
          END
        )
        FROM transactions
        WHERE (account_id = ? OR dest_account_id = ?) AND user_id = ? AND status = 'confirmed'
      ), 0)
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(accountId, accountId, accountId, accountId, userId, accountId, userId);
  }
}
