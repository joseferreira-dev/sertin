import db from '../config/database';
import { GoalContribution, IGoalContribution } from './GoalContribution';

export interface IGoal {
  id?: number;
  user_id: number;
  name: string;
  type?: 'emergency' | 'opportunity' | 'travel' | 'material' | 'education' | 'investment' | 'free';
  target_amount: number;
  color?: string;
  icon?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  status?: 'active' | 'completed' | 'delayed' | 'archived';
  target_date?: string;
  description?: string;
  annual_yield?: number;
  created_at?: string;
  updated_at?: string;
  current_amount?: number;
  progress?: number;
  days_remaining?: number | null;
}

export class Goal {
  static create(data: Omit<IGoal, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO goals (
        user_id, name, type, target_amount, color, icon,
        priority, status, target_date, description, annual_yield
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.user_id,
      data.name,
      data.type || 'free',
      data.target_amount,
      data.color || '#10b981',
      data.icon || '🎯',
      data.priority || 'medium',
      data.status || 'active',
      data.target_date || null,
      data.description || null,
      data.annual_yield || 0
    );
    return info.lastInsertRowid as number;
  }

  static findByUser(
    userId: number,
    filters?: { status?: string; type?: string; limit?: number }
  ): (IGoal & { current_amount: number; progress: number; days_remaining: number | null })[] {
    let sql = `
      SELECT g.*,
        COALESCE(
          (SELECT SUM(amount)
           FROM transactions t
           WHERE t.user_id = g.user_id
             AND t.meta_id = g.id
             AND t.type = 'income'
             AND t.status = 'confirmed'
          ), 0
        ) as current_amount,
        CASE WHEN g.target_amount > 0
          THEN ROUND((COALESCE(
            (SELECT SUM(amount)
             FROM transactions t
             WHERE t.user_id = g.user_id
               AND t.meta_id = g.id
               AND t.type = 'income'
               AND t.status = 'confirmed'
            ), 0) / g.target_amount) * 100, 1)
          ELSE 0
        END as progress,
        CASE WHEN g.target_date IS NOT NULL
          THEN ROUND(JULIANDAY(g.target_date) - JULIANDAY('now'))
          ELSE NULL
        END as days_remaining
      FROM goals g
      WHERE g.user_id = ?
    `;
    const params: any[] = [userId];
    if (filters?.status) {
      sql += ' AND g.status = ?';
      params.push(filters.status);
    }
    if (filters?.type) {
      sql += ' AND g.type = ?';
      params.push(filters.type);
    }
    sql += ' ORDER BY g.priority DESC, g.target_date ASC, g.created_at DESC';
    if (filters?.limit) {
      sql += ' LIMIT ?';
      params.push(filters.limit);
    }
    const stmt = db.prepare(sql);
    return stmt.all(...params) as (IGoal & {
      current_amount: number;
      progress: number;
      days_remaining: number | null;
    })[];
  }

  static findById(
    id: number,
    userId: number
  ):
    | (IGoal & { current_amount: number; progress: number; days_remaining: number | null })
    | undefined {
    const stmt = db.prepare(`
      SELECT g.*,
        COALESCE(
          (SELECT SUM(amount)
           FROM transactions t
           WHERE t.user_id = g.user_id
             AND t.meta_id = g.id
             AND t.type = 'income'
             AND t.status = 'confirmed'
          ), 0
        ) as current_amount,
        CASE WHEN g.target_amount > 0
          THEN ROUND((COALESCE(
            (SELECT SUM(amount)
             FROM transactions t
             WHERE t.user_id = g.user_id
               AND t.meta_id = g.id
               AND t.type = 'income'
               AND t.status = 'confirmed'
            ), 0) / g.target_amount) * 100, 1)
          ELSE 0
        END as progress,
        CASE WHEN g.target_date IS NOT NULL
          THEN ROUND(JULIANDAY(g.target_date) - JULIANDAY('now'))
          ELSE NULL
        END as days_remaining
      FROM goals g
      WHERE g.id = ? AND g.user_id = ?
    `);
    return stmt.get(id, userId) as
      | (IGoal & { current_amount: number; progress: number; days_remaining: number | null })
      | undefined;
  }

  static update(id: number, userId: number, data: Partial<IGoal>): void {
    const fields = Object.keys(data).filter(
      (k) =>
        k !== 'id' &&
        k !== 'user_id' &&
        k !== 'created_at' &&
        k !== 'updated_at' &&
        data[k as keyof IGoal] !== undefined
    );
    if (fields.length === 0) return;
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f as keyof IGoal]);
    const stmt = db.prepare(
      `UPDATE goals SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    );
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    // Só permite excluir se status for 'archived'
    const goal = this.findById(id, userId);
    if (!goal) throw new Error('Meta não encontrada');
    if (goal.status !== 'archived') {
      throw new Error('Apenas metas arquivadas podem ser excluídas.');
    }
    // Remove associação de transações (meta_id fica NULL)
    db.prepare('UPDATE transactions SET meta_id = NULL WHERE meta_id = ? AND user_id = ?').run(
      id,
      userId
    );
    const stmt = db.prepare('DELETE FROM goals WHERE id = ? AND user_id = ?');
    stmt.run(id, userId);
  }

  static archive(id: number, userId: number): void {
    this.update(id, userId, { status: 'archived' });
  }

  static unarchive(id: number, userId: number): void {
    this.update(id, userId, { status: 'active' });
  }

  // Adicione estes métodos à classe Goal existente

  static addContribution(
    goalId: number,
    userId: number,
    amount: number,
    date?: string,
    note?: string
  ): void {
    const goal = this.findById(goalId, userId);
    if (!goal) throw new Error('Meta não encontrada');

    const newCurrent = goal.current_amount + amount;
    if (newCurrent < 0) throw new Error('Saldo não pode ficar negativo');

    const insertContribution = db.prepare(`
    INSERT INTO goal_contributions (goal_id, amount, date, note)
    VALUES (?, ?, ?, ?)
  `);
    const updateGoal = db.prepare(`
    UPDATE goals SET current_amount = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ? AND user_id = ?
  `);

    const transaction = db.transaction(() => {
      insertContribution.run(
        goalId,
        amount,
        date || new Date().toISOString().slice(0, 10),
        note || null
      );
      updateGoal.run(newCurrent, goalId, userId);
    });

    transaction();
    console.log(
      `Contribuição registrada: meta ${goalId}, valor ${amount}, novo saldo ${newCurrent}`
    );
  }

  static getContributions(goalId: number, userId: number): IGoalContribution[] {
    // Verifica se a meta pertence ao usuário
    const goal = this.findById(goalId, userId);
    if (!goal) throw new Error('Meta não encontrada');
    return GoalContribution.findByGoal(goalId);
  }
}
