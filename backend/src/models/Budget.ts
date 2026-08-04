import db from '../config/database';

export interface IBudget {
  id?: number;
  user_id: number;
  category_id: number;
  month: string; // "YYYY-MM"
  budgeted_amount: number;
  created_at?: string;
  updated_at?: string;
  spent?: number; // calculado dinamicamente
}

export class Budget {
  static create(data: Omit<IBudget, 'id' | 'created_at' | 'updated_at'>): number {
    // Verifica se já existe um orçamento para a categoria e mês
    const existing = db
      .prepare('SELECT id FROM budgets WHERE user_id = ? AND category_id = ? AND month = ?')
      .get(data.user_id, data.category_id, data.month);
    if (existing) {
      throw new Error('Já existe um orçamento para esta categoria neste mês.');
    }

    const stmt = db.prepare(`
      INSERT INTO budgets (user_id, category_id, month, budgeted_amount)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(data.user_id, data.category_id, data.month, data.budgeted_amount);
    return info.lastInsertRowid as number;
  }

  static findByUser(userId: number, filters?: { month?: string }): (IBudget & { spent: number })[] {
    let sql = `
      SELECT b.*,
        COALESCE(
          (SELECT SUM(t.amount)
           FROM transactions t
           WHERE t.user_id = b.user_id
             AND t.category_id = b.category_id
             AND t.type = 'expense'
             AND t.status = 'confirmed'
             AND strftime('%Y-%m', date(t.date)) = b.month
          ), 0
        ) as spent
      FROM budgets b
      WHERE b.user_id = ?
    `;
    const params: any[] = [userId];
    if (filters?.month) {
      sql += ' AND b.month = ?';
      params.push(filters.month);
    }
    sql += ' ORDER BY b.category_id, b.month DESC';
    const stmt = db.prepare(sql);
    return stmt.all(...params) as (IBudget & { spent: number })[];
  }

  static findById(id: number, userId: number): (IBudget & { spent: number }) | undefined {
    const stmt = db.prepare(`
      SELECT b.*,
        COALESCE(
          (SELECT SUM(t.amount)
           FROM transactions t
           WHERE t.user_id = b.user_id
             AND t.category_id = b.category_id
             AND t.type = 'expense'
             AND t.status = 'confirmed'
             AND strftime('%Y-%m', date(t.date)) = b.month
          ), 0
        ) as spent
      FROM budgets b
      WHERE b.id = ? AND b.user_id = ?
    `);
    return stmt.get(id, userId) as (IBudget & { spent: number }) | undefined;
  }

  static update(id: number, userId: number, data: Partial<IBudget>): void {
    const fields = Object.keys(data).filter(
      (k) =>
        k !== 'id' &&
        k !== 'user_id' &&
        k !== 'created_at' &&
        k !== 'updated_at' &&
        data[k as keyof IBudget] !== undefined
    );
    if (fields.length === 0) return;
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f as keyof IBudget]);
    const stmt = db.prepare(
      `UPDATE budgets SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    );
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    const stmt = db.prepare('DELETE FROM budgets WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
  }
}
