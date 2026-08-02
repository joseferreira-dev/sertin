import db from '../config/database';

export interface ITag {
  id?: number;
  user_id: number;
  name: string;
  color: string;
  description?: string;
  deleted_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export class Tag {
  static create(data: Omit<ITag, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO tags (user_id, name, color, description)
      VALUES (?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.user_id,
      data.name,
      data.color || '#6366f1',
      data.description || null
    );
    return info.lastInsertRowid as number;
  }

  static findByUser(userId: number, includeDeleted: boolean = false): ITag[] {
    let sql = 'SELECT * FROM tags WHERE user_id = ?';
    if (!includeDeleted) {
      sql += ' AND deleted_at IS NULL';
    }
    sql += ' ORDER BY name';
    const stmt = db.prepare(sql);
    return stmt.all(userId) as ITag[];
  }

  static findById(id: number, userId: number): ITag | undefined {
    const stmt = db.prepare(
      'SELECT * FROM tags WHERE id = ? AND user_id = ? AND deleted_at IS NULL'
    );
    return stmt.get(id, userId) as ITag | undefined;
  }

  static update(id: number, userId: number, data: Partial<ITag>): void {
    const fields = Object.keys(data).filter(
      (k) =>
        k !== 'id' &&
        k !== 'user_id' &&
        k !== 'created_at' &&
        k !== 'updated_at' &&
        k !== 'deleted_at' &&
        data[k as keyof ITag] !== undefined
    );
    if (fields.length === 0) return;
    const setClause = fields.map((f) => `${f} = ?`).join(', ');
    const values = fields.map((f) => data[f as keyof ITag]);
    const stmt = db.prepare(
      `UPDATE tags SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`
    );
    stmt.run(...values, id, userId);
  }

  // Soft delete
  static delete(id: number, userId: number): void {
    const stmt = db.prepare(
      'UPDATE tags SET deleted_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?'
    );
    stmt.run(id, userId);
  }

  // Remover associações com transações
  static removeTransactionAssociations(tagId: number): void {
    const stmt = db.prepare('DELETE FROM transaction_tags WHERE tag_id = ?');
    stmt.run(tagId);
  }

  // Contar quantas transações usam a tag
  static countTransactions(tagId: number): number {
    const stmt = db.prepare('SELECT COUNT(*) as count FROM transaction_tags WHERE tag_id = ?');
    const row = stmt.get(tagId) as { count: number };
    return row.count;
  }

  // Métodos para associar tags a uma transação
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
}
