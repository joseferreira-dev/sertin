import db from '../config/database';

export interface IJar {
  id?: number;
  user_id: number;
  name: string;
  balance: number;
  color?: string;
  icon?: string;
  description?: string;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
}

export class Jar {
  static create(data: Omit<IJar, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO jars (user_id, name, balance, color, icon, description, status)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.user_id,
      data.name,
      data.balance || 0,
      data.color || '#10b981',
      data.icon || '💰',
      data.description || null,
      data.status || 'active'
    );
    return info.lastInsertRowid as number;
  }

  static findById(id: number, userId: number): IJar | undefined {
    const stmt = db.prepare('SELECT * FROM jars WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId) as IJar | undefined;
  }

  static findByUser(userId: number, onlyActive: boolean = false): IJar[] {
    let sql = 'SELECT * FROM jars WHERE user_id = ?';
    const params: any[] = [userId];
    if (onlyActive) {
      sql += " AND status = 'active'";
    }
    sql += ' ORDER BY name';
    const stmt = db.prepare(sql);
    return stmt.all(...params) as IJar[];
  }

  static update(id: number, userId: number, data: Partial<IJar>): void {
    const fields = Object.keys(data).filter(
      (k) =>
        k !== 'id' &&
        k !== 'user_id' &&
        k !== 'created_at' &&
        k !== 'updated_at' &&
        data[k as keyof IJar] !== undefined
    );
    if (fields.length === 0) return;
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f as keyof IJar]);
    const stmt = db.prepare(
      `UPDATE jars SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    );
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    const checkStmt = db.prepare(`
      SELECT COUNT(*) as count FROM transactions WHERE (jar_id = ? OR dest_jar_id = ?) AND user_id = ?
    `);
    const { count } = checkStmt.get(id, id, userId) as { count: number };
    if (count > 0) {
      throw new Error('Não é possível excluir a caixinha pois existem transações associadas.');
    }
    const goalStmt = db.prepare(
      'SELECT COUNT(*) as count FROM goals WHERE jar_id = ? AND user_id = ? AND status != "archived"'
    );
    const { count: goalCount } = goalStmt.get(id, userId) as { count: number };
    if (goalCount > 0) {
      throw new Error('Não é possível excluir a caixinha pois está associada a uma meta ativa.');
    }
    const delStmt = db.prepare('DELETE FROM jars WHERE id = ? AND user_id = ?');
    delStmt.run(id, userId);
  }

  static updateBalance(jarId: number, userId: number): void {
    const stmt = db.prepare(`
      UPDATE jars
      SET balance = COALESCE((
        SELECT SUM(
          CASE
            WHEN type = 'transfer' AND dest_jar_id = ? THEN amount
            WHEN type = 'transfer' AND jar_id = ? THEN -amount
            ELSE 0
          END
        )
        FROM transactions
        WHERE (jar_id = ? OR dest_jar_id = ?) AND user_id = ? AND status = 'confirmed'
      ), 0)
      WHERE id = ? AND user_id = ?
    `);
    stmt.run(jarId, jarId, jarId, jarId, userId, jarId, userId);
  }
}
