import db from '../config/database';
import { GoalContribution, IGoalContribution } from './GoalContribution';
import { Account, IAccount } from './Account';
import { Transaction } from './Transaction';

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
    const goalId = info.lastInsertRowid as number;

    const accountStmt = db.prepare(`
      INSERT INTO accounts (user_id, name, type, balance, color, icon, goal_id, status)
      VALUES (?, ?, 'goal', 0, ?, ?, ?, 'active')
    `);
    accountStmt.run(data.user_id, data.name, data.color || '#10b981', data.icon || '💰', goalId);

    return goalId;
  }

  static findByUser(
    userId: number,
    filters?: { status?: string; type?: string; limit?: number }
  ): (IGoal & { current_amount: number; progress: number; days_remaining: number | null })[] {
    let sql = `
      SELECT g.*,
        COALESCE(
          (SELECT balance
           FROM accounts a
           WHERE a.goal_id = g.id AND a.user_id = g.user_id
          ), 0
        ) as current_amount,
        CASE WHEN g.target_amount > 0
          THEN ROUND(
            (COALESCE(
              (SELECT balance
               FROM accounts a
               WHERE a.goal_id = g.id AND a.user_id = g.user_id
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
          (SELECT balance
           FROM accounts a
           WHERE a.goal_id = g.id AND a.user_id = g.user_id
          ), 0
        ) as current_amount,
        CASE WHEN g.target_amount > 0
          THEN ROUND(
            (COALESCE(
              (SELECT balance
               FROM accounts a
               WHERE a.goal_id = g.id AND a.user_id = g.user_id
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
    const goal = this.findById(id, userId);
    if (!goal) throw new Error('Meta não encontrada');
    if (goal.status !== 'archived') {
      throw new Error('Apenas metas arquivadas podem ser excluídas.');
    }
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

  static getGoalAccount(goalId: number, userId: number): IAccount | undefined {
    const stmt = db.prepare('SELECT * FROM accounts WHERE goal_id = ? AND user_id = ?');
    return stmt.get(goalId, userId) as IAccount | undefined;
  }

  static addContribution(
    goalId: number,
    userId: number,
    amount: number,
    sourceAccountId: number,
    date?: string,
    note?: string
  ): void {
    const goal = this.findById(goalId, userId);
    if (!goal) throw new Error('Meta não encontrada');

    const goalAccount = this.getGoalAccount(goalId, userId);
    if (!goalAccount) throw new Error('Conta da meta não encontrada');

    const sourceAccount = Account.findById(sourceAccountId, userId);
    if (!sourceAccount) throw new Error('Conta de origem não encontrada');

    if (sourceAccount.balance < amount) {
      throw new Error('Saldo insuficiente na conta de origem');
    }

    const txnId = Transaction.create({
      user_id: userId,
      account_id: sourceAccountId,
      dest_account_id: goalAccount.id!,
      type: 'transfer',
      amount: amount,
      description: `Aporte para meta "${goal.name}"${note ? ` - ${note}` : ''}`,
      date: date || new Date().toISOString().slice(0, 10),
      status: 'confirmed',
      installment_total: 1,
      installment_current: 1,
      recurring_id: null,
      meta_id: goalId,
      attachment_path: null,
    });

    Transaction.updateAccountBalance(sourceAccountId, userId);
    Transaction.updateAccountBalance(goalAccount.id!, userId);

    const updatedGoalAccount = Account.findById(goalAccount.id!, userId);
    const newCurrent = updatedGoalAccount ? updatedGoalAccount.balance : 0;

    this.update(goalId, userId, { current_amount: newCurrent });

    const insertContribution = db.prepare(`
      INSERT INTO goal_contributions (goal_id, amount, date, note)
      VALUES (?, ?, ?, ?)
    `);
    insertContribution.run(
      goalId,
      amount,
      date || new Date().toISOString().slice(0, 10),
      note || null
    );
  }

  static getContributions(goalId: number, userId: number): IGoalContribution[] {
    const goal = this.findById(goalId, userId);
    if (!goal) throw new Error('Meta não encontrada');
    return GoalContribution.findByGoal(goalId);
  }
}
