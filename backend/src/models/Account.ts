import db from '../config/database';

export interface IAccount {
  id?: number;
  user_id: number;
  name: string;
  type: 'checking' | 'savings' | 'cash' | 'digital' | 'goal';
  balance: number;
  color?: string;
  institution?: string;
  icon?: string;
  goal_id?: number | null;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export class Account {
  static create(data: Omit<IAccount, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO accounts (user_id, name, type, balance, color, institution, icon, goal_id, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.user_id,
      data.name,
      data.type,
      data.balance || 0,
      data.color || '#10b981',
      data.institution || null,
      data.icon || 'Wallet',
      data.goal_id || null,
      data.status || 'active'
    );
    return info.lastInsertRowid as number;
  }

  static findByUser(userId: number, onlyActive: boolean = false): IAccount[] {
    let sql = 'SELECT * FROM accounts WHERE user_id = ?';
    const params: any[] = [userId];
    if (onlyActive) {
      sql += " AND status = 'active'";
    }
    sql += ' ORDER BY type, name';
    const stmt = db.prepare(sql);
    return stmt.all(...params) as IAccount[];
  }

  static findById(id: number, userId: number): IAccount | undefined {
    const stmt = db.prepare('SELECT * FROM accounts WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId) as IAccount | undefined;
  }

  static findGoalAccount(goalId: number, userId: number): IAccount | undefined {
    const stmt = db.prepare('SELECT * FROM accounts WHERE goal_id = ? AND user_id = ?');
    return stmt.get(goalId, userId) as IAccount | undefined;
  }

  static update(id: number, userId: number, data: Partial<IAccount>): void {
    const fields = Object.keys(data).filter(
      (k) =>
        k !== 'id' &&
        k !== 'user_id' &&
        k !== 'created_at' &&
        k !== 'updated_at' &&
        data[k as keyof IAccount] !== undefined
    );
    if (fields.length === 0) return;
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f as keyof IAccount]);
    const stmt = db.prepare(
      `UPDATE accounts SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    );
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    const checkStmt = db.prepare(`
      SELECT COUNT(*) as count FROM transactions
      WHERE (account_id = ? OR dest_account_id = ?) AND user_id = ?
    `);
    const { count } = checkStmt.get(id, id, userId) as { count: number };
    if (count > 0) {
      throw new Error('Não é possível excluir a conta pois existem transações vinculadas a ela.');
    }
    const delStmt = db.prepare('DELETE FROM accounts WHERE id = ? AND user_id = ?');
    delStmt.run(id, userId);
  }

  static getNetWorth(userId: number): { assets: number; liabilities: number; netWorth: number } {
    const stmt = db.prepare(`
      SELECT
        SUM(CASE WHEN balance > 0 THEN balance ELSE 0 END) as assets,
        SUM(CASE WHEN balance < 0 THEN ABS(balance) ELSE 0 END) as liabilities
      FROM accounts WHERE user_id = ? AND status = 'active'
    `);
    const row = stmt.get(userId) as { assets: number; liabilities: number };
    return {
      assets: row.assets || 0,
      liabilities: row.liabilities || 0,
      netWorth: (row.assets || 0) - (row.liabilities || 0),
    };
  }
}
