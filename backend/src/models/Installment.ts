import db from '../config/database';

export interface IInstallment {
  id?: number;
  user_id: number;
  account_id?: number | null;
  credit_card_id?: number | null;
  category_id?: number | null;
  description: string;
  total_amount: number;
  installment_count: number;
  start_date: string;
  status: 'active' | 'completed' | 'canceled';
  created_at?: string;
  updated_at?: string;
}

export class Installment {
  static create(data: Omit<IInstallment, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO installments (user_id, account_id, credit_card_id, category_id, description, total_amount, installment_count, start_date, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.user_id,
      data.account_id || null,
      data.credit_card_id || null,
      data.category_id || null,
      data.description,
      data.total_amount,
      data.installment_count,
      data.start_date,
      data.status || 'active'
    );
    return info.lastInsertRowid as number;
  }

  static findById(id: number, userId: number): IInstallment | undefined {
    const stmt = db.prepare('SELECT * FROM installments WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId) as IInstallment | undefined;
  }

  static findByUser(
    userId: number,
    filters?: {
      status?: string;
      startDate?: string;
      endDate?: string;
      accountId?: number;
      creditCardId?: number;
    }
  ): IInstallment[] {
    let sql = 'SELECT * FROM installments WHERE user_id = ?';
    const params: any[] = [userId];
    if (filters?.status) {
      sql += ' AND status = ?';
      params.push(filters.status);
    }
    if (filters?.startDate) {
      sql += ' AND start_date >= ?';
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      sql += ' AND start_date <= ?';
      params.push(filters.endDate);
    }
    if (filters?.accountId) {
      sql += ' AND account_id = ?';
      params.push(filters.accountId);
    }
    if (filters?.creditCardId) {
      sql += ' AND credit_card_id = ?';
      params.push(filters.creditCardId);
    }
    sql += ' ORDER BY start_date DESC, id DESC';
    const stmt = db.prepare(sql);
    return stmt.all(...params) as IInstallment[];
  }

  static update(id: number, userId: number, data: Partial<IInstallment>): void {
    const fields = Object.keys(data).filter(
      (k) =>
        k !== 'id' &&
        k !== 'user_id' &&
        k !== 'created_at' &&
        data[k as keyof IInstallment] !== undefined
    );
    if (fields.length === 0) return;
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f as keyof IInstallment]);
    const stmt = db.prepare(
      `UPDATE installments SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    );
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    const stmt = db.prepare(
      "SELECT COUNT(*) as count FROM transactions WHERE installment_id = ? AND user_id = ? AND status = 'confirmed'"
    );
    const { count } = stmt.get(id, userId) as { count: number };
    if (count > 0) {
      throw new Error('Não é possível excluir o parcelamento pois há parcelas já pagas.');
    }
    const delStmt = db.prepare('DELETE FROM installments WHERE id = ? AND user_id = ?');
    delStmt.run(id, userId);
  }

  static generateTransactions(installmentId: number, userId: number): void {
    const installment = this.findById(installmentId, userId);
    if (!installment) throw new Error('Parcelamento não encontrado');

    const amountPerInstallment = installment.total_amount / installment.installment_count;
    const startDate = new Date(installment.start_date);
    const month = startDate.getMonth();
    const year = startDate.getFullYear();
    const day = startDate.getDate();

    const txnStmt = db.prepare(`
      INSERT INTO transactions (
        user_id, account_id, credit_card_id, category_id, type, amount, description, date, status,
        installment_id, installment_number, installment_total, installment_current
      ) VALUES (?, ?, ?, ?, 'expense', ?, ?, ?, 'pending', ?, ?, ?, ?)
    `);

    const insertTxn = db.transaction(() => {
      for (let i = 0; i < installment.installment_count; i++) {
        let currentDate = new Date(year, month + i, day);
        const targetMonth = (month + i) % 12;
        const targetYear = year + Math.floor((month + i) / 12);
        const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
        if (day > lastDay) {
          currentDate = new Date(targetYear, targetMonth, lastDay);
        }
        const dateStr = currentDate.toISOString().slice(0, 10);
        const description =
          installment.description + ` (${i + 1}/${installment.installment_count})`;
        txnStmt.run(
          userId,
          installment.account_id || null,
          installment.credit_card_id || null,
          installment.category_id || null,
          amountPerInstallment,
          description,
          dateStr,
          installmentId,
          i + 1,
          installment.installment_count,
          i + 1
        );
      }
    });
    insertTxn();
  }

  static updateStatus(installmentId: number, userId: number): void {
    const stmt = db.prepare(`
      SELECT COUNT(*) as total, SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as paid
      FROM transactions WHERE installment_id = ? AND user_id = ?
    `);
    const row = stmt.get(installmentId, userId) as { total: number; paid: number };
    if (row.total === row.paid && row.total > 0) {
      this.update(installmentId, userId, { status: 'completed' });
    }
  }

  static payInstallment(installmentId: number, installmentNumber: number, userId: number): void {
    const txnStmt = db.prepare(`
      UPDATE transactions SET status = 'confirmed', updated_at = CURRENT_TIMESTAMP
      WHERE installment_id = ? AND installment_number = ? AND user_id = ? AND status = 'pending'
    `);
    const info = txnStmt.run(installmentId, installmentNumber, userId);
    if (info.changes === 0) {
      throw new Error('Parcela não encontrada ou já paga');
    }
    this.updateStatus(installmentId, userId);
  }

  static unpayInstallment(installmentId: number, installmentNumber: number, userId: number): void {
    const txnStmt = db.prepare(`
      UPDATE transactions SET status = 'pending', updated_at = CURRENT_TIMESTAMP
      WHERE installment_id = ? AND installment_number = ? AND user_id = ? AND status = 'confirmed'
    `);
    const info = txnStmt.run(installmentId, installmentNumber, userId);
    if (info.changes === 0) {
      throw new Error('Parcela não encontrada ou não está paga');
    }
    const stmt = db.prepare(`
      SELECT COUNT(*) as total, SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as paid
      FROM transactions WHERE installment_id = ? AND user_id = ?
    `);
    const row = stmt.get(installmentId, userId) as { total: number; paid: number };
    if (row.paid === 0) {
      this.update(installmentId, userId, { status: 'active' });
    } else {
      this.update(installmentId, userId, { status: 'active' });
    }
  }

  static cancelInstallment(installmentId: number, userId: number): void {
    const txnStmt = db.prepare(`
      UPDATE transactions SET status = 'cancelled', updated_at = CURRENT_TIMESTAMP
      WHERE installment_id = ? AND user_id = ? AND status = 'pending'
    `);
    txnStmt.run(installmentId, userId);
    const stmt = db.prepare(`
      SELECT COUNT(*) as total, SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) as paid
      FROM transactions WHERE installment_id = ? AND user_id = ?
    `);
    const row = stmt.get(installmentId, userId) as { total: number; paid: number };
    if (row.paid === 0) {
      this.update(installmentId, userId, { status: 'canceled' });
    } else {
      this.update(installmentId, userId, { status: 'active' });
    }
  }
}
