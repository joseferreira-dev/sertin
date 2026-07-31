import db from '../config/database';
import bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

export interface IUser {
  id?: number;
  name: string;
  email: string;
  password_hash: string;
  security_question?: string;
  security_answer?: string;
  created_at?: string;
  updated_at?: string;
}

export class User {
  static async create(data: Omit<IUser, 'id' | 'created_at' | 'updated_at'>): Promise<number> {
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, security_question, security_answer)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      data.name,
      data.email,
      data.password_hash,
      data.security_question || null,
      data.security_answer || null
    );
    return info.lastInsertRowid as number;
  }

  static findByEmail(email: string): IUser | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
    return stmt.get(email) as IUser | undefined;
  }

  static findById(id: number): IUser | undefined {
    const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
    return stmt.get(id) as IUser | undefined;
  }

  static async updatePassword(id: number, newPassword: string): Promise<void> {
    const hash = await bcrypt.hash(newPassword, 12);
    const stmt = db.prepare('UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?');
    stmt.run(hash, id);
  }

  static async comparePassword(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}