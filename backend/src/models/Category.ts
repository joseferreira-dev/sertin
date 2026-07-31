import db from '../config/database';

export interface ICategory {
  id?: number;
  user_id: number;
  name: string;
  type: 'income' | 'expense';
  color?: string;
  icon?: string;
  parent_id?: number | null;
  created_at?: string;
  updated_at?: string;
  children?: ICategory[];
}

export class Category {
  static create(data: Omit<ICategory, 'id' | 'created_at' | 'updated_at'>): number {
    const stmt = db.prepare(`
      INSERT INTO categories (user_id, name, type, color, icon, parent_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.user_id,
      data.name,
      data.type,
      data.color || '#6366f1',
      data.icon || 'Tag',
      data.parent_id || null
    );
    return info.lastInsertRowid as number;
  }

  static findByUser(userId: number): ICategory[] {
    const stmt = db.prepare('SELECT * FROM categories WHERE user_id = ? ORDER BY type, name');
    return stmt.all(userId) as ICategory[];
  }

  static findWithChildren(userId: number): ICategory[] {
    const all = this.findByUser(userId);
    const parents = all.filter(c => !c.parent_id);
    const children = all.filter(c => c.parent_id);
    parents.forEach(p => {
      p.children = children.filter(c => c.parent_id === p.id);
    });
    return parents;
  }

  static findById(id: number, userId: number): ICategory | undefined {
    const stmt = db.prepare('SELECT * FROM categories WHERE id = ? AND user_id = ?');
    return stmt.get(id, userId) as ICategory | undefined;
  }

  static update(id: number, userId: number, data: Partial<ICategory>): void {
    const fields = Object.keys(data).filter(k => k !== 'id' && k !== 'user_id' && k !== 'created_at');
    if (fields.length === 0) return;
    const setClause = fields.map(f => `${f} = ?`).join(', ');
    const values = fields.map(f => data[f as keyof ICategory]);
    const stmt = db.prepare(`UPDATE categories SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?`);
    stmt.run(...values, id, userId);
  }

  static delete(id: number, userId: number): void {
    // Primeiro, verifica se há transações vinculadas
    const stmt = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE category_id = ? AND user_id = ?');
    const { count } = stmt.get(id, userId) as { count: number };
    if (count > 0) {
      throw new Error('Esta categoria possui transações vinculadas. Reatribua ou exclua-as primeiro.');
    }
    // Deleta a categoria e suas subcategorias (cascade)
    const delStmt = db.prepare('DELETE FROM categories WHERE id = ? AND user_id = ?');
    delStmt.run(id, userId);
  }
}