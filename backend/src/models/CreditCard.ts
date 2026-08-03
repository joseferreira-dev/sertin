import db from '../config/database';

export interface ICreditCard {
  id?: number;
  user_id: number;
  name: string;
  institution?: string;
  limit_amount: number;
  closing_day: number;
  due_day: number;
  color: string;
  icon: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export class CreditCard {
  static create(data: Omit<ICreditCard, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO credit_cards (
        user_id, name, institution, limit_amount, closing_day, due_day, color, icon, status
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.user_id,
      data.name,
      data.institution || null,
      data.limit_amount,
      data.closing_day,
      data.due_day,
      data.color || '#10b981',
      data.icon || 'CreditCard',
      data.status || 'active'
    );
    return info.lastInsertRowid as number;
  }

  static findById(id: number, userId: number): ICreditCard | undefined {
    const stmt = db.prepare('SELECT * FROM credit_cards WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId) as ICreditCard | undefined;
  }

  static findByUser(userId: number, onlyActive: boolean = false): ICreditCard[] {
    let sql = 'SELECT * FROM credit_cards WHERE user_id = ?';
    const params: any[] = [userId];
    if (onlyActive) {
      sql += " AND status = 'active'";
    }
    sql += ' ORDER BY name';
    const stmt = db.prepare(sql);
    return stmt.all(...params) as ICreditCard[];
  }

  static update(id: number, userId: number, data: Partial<ICreditCard>): void {
    const fields = Object.keys(data).filter(
      (k) =>
        k !== 'id' &&
        k !== 'user_id' &&
        k !== 'created_at' &&
        k !== 'updated_at' &&
        data[k as keyof ICreditCard] !== undefined
    );
    if (fields.length === 0) return;
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f as keyof ICreditCard]);
    const stmt = db.prepare(
      `UPDATE credit_cards SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    );
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    const checkStmt = db.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE credit_card_id = ? AND user_id = ?'
    );
    const { count } = checkStmt.get(id, userId) as { count: number };
    if (count > 0) {
      throw new Error('Não é possível excluir o cartão pois existem transações associadas a ele.');
    }
    const delStmt = db.prepare('DELETE FROM credit_cards WHERE id = ? AND user_id = ?');
    delStmt.run(id, userId);
  }

  static getCurrentBalance(cardId: number, userId: number): number {
    const stmt = db.prepare(`
      SELECT COALESCE(SUM(amount), 0) as balance
      FROM transactions
      WHERE credit_card_id = ? AND user_id = ? AND type = 'expense' AND status IN ('confirmed', 'pending')
    `);
    const row = stmt.get(cardId, userId) as { balance: number };
    return Math.abs(row.balance);
  }
}
