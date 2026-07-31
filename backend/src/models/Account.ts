import db from '../config/database';

export interface IAccount {
  id?: number;
  user_id: number;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'credit' | 'digital';
  balance: number;
  color?: string;
  institution?: string;
  icon?: string;
  limit_amount?: number;
  closing_day?: number;
  due_day?: number;
  hidden?: boolean;
  created_at?: string;
  updated_at?: string;
}

export class Account {
  static create(data: Omit<IAccount, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO accounts (user_id, name, type, balance, color, institution, icon, limit_amount, closing_day, due_day, hidden)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.user_id,
      data.name,
      data.type,
      data.balance || 0,
      data.color || '#10b981',
      data.institution || null,
      data.icon || 'Wallet',
      data.limit_amount || null,
      data.closing_day || null,
      data.due_day || null,
      data.hidden || 0
    );
    return info.lastInsertRowid as number;
  }

  static findByUser(userId: number): IAccount[] {
    const stmt = db.prepare('SELECT * FROM accounts WHERE user_id = ? AND hidden = 0 ORDER BY type, name');
    return stmt.all(userId) as IAccount[];
  }

  static findById(id: number, userId: number): IAccount | undefined {
    const stmt = db.prepare('SELECT * FROM accounts WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId) as IAccount | undefined;
  }

  static update(id: number, userId: number, data: Partial<IAccount>): void {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'user_id' && k !== 'created_at');
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => data[f as keyof IAccount]);
    const stmt = db.prepare(`UPDATE accounts SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`);
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    const stmt = db.prepare('UPDATE accounts SET hidden = 1 WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
  }

  static getNetWorth(userId: number): { assets: number; liabilities: number; netWorth: number } {
    const stmt = db.prepare(`
      SELECT 
        SUM(CASE WHEN type != 'credit' AND balance > 0 THEN balance ELSE 0 END) as assets,
        SUM(CASE WHEN type = 'credit' THEN ABS(balance) ELSE 0 END) as liabilities
      FROM accounts WHERE user_id = ? AND hidden = 0
    `);
    const row = stmt.get(userId) as { assets: number; liabilities: number };
    return {
      assets: row.assets || 0,
      liabilities: row.liabilities || 0,
      netWorth: (row.assets || 0) - (row.liabilities || 0)
    };
  }
}