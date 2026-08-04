import db from '../config/database';

export interface IGoalContribution {
  id?: number;
  goal_id: number;
  amount: number;
  date: string;
  note?: string;
  created_at?: string;
}

export class GoalContribution {
  static create(data: Omit<IGoalContribution, 'id' | 'created_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO goal_contributions (goal_id, amount, date, note)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.goal_id,
      data.amount,
      data.date || new Date().toISOString().slice(0, 10),
      data.note || null
    );
    return info.lastInsertRowid as number;
  }

  static findByGoal(goalId: number): IGoalContribution[] {
    const stmt = db.prepare(
      'SELECT * FROM goal_contributions WHERE goal_id = ? ORDER BY date DESC, id DESC'
    );
    return stmt.all(goalId) as IGoalContribution[];
  }
}
