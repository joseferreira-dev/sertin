import db from './config/database';
import bcrypt from 'bcrypt';

export function seed() {
  try {
    // Verificar se já existem usuários
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (count.count > 0) {
      console.log('Banco já possui dados. Pulando seed.');
      return;
    }

    console.log('Inserindo dados iniciais...');

    // 1. Criar usuário
    const password = '123456';
    const hash = bcrypt.hashSync(password, 12);
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, security_question, security_answer)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run('Lucas Ferreira', 'lucas@sertin.app', hash, 'Qual é o nome do seu primeiro animal de estimação?', 'Luna');
    const userId = info.lastInsertRowid as number;

    // 2. Criar contas padrão
    const accounts = [
      { name: 'Nubank', type: 'digital', balance: 4230.50, color: '#8b5cf6', institution: 'Nubank', icon: 'Wallet' },
      { name: 'Bradesco CC', type: 'checking', balance: 12450.00, color: '#ef4444', institution: 'Bradesco', icon: 'Building2' },
      { name: 'Poupança Bradesco', type: 'savings', balance: 8900.00, color: '#3b82f6', institution: 'Bradesco', icon: 'PiggyBank' },
      { name: 'Cartão Inter', type: 'credit', balance: -3420.00, color: '#f97316', institution: 'Banco Inter', icon: 'CreditCard', limit_amount: 8000, closing_day: 15, due_day: 22 },
      { name: 'Carteira', type: 'cash', balance: 350.00, color: '#10b981', institution: '', icon: 'Banknote' }
    ];

    const accStmt = db.prepare(`
      INSERT INTO accounts (user_id, name, type, balance, color, institution, icon, limit_amount, closing_day, due_day)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    for (const acc of accounts) {
      accStmt.run(
        userId,
        acc.name,
        acc.type,
        acc.balance,
        acc.color,
        acc.institution,
        acc.icon,
        acc.limit_amount || null,
        acc.closing_day || null,
        acc.due_day || null
      );
    }

    // 3. Categorias padrão
    const categories = [
      { name: 'Moradia', type: 'expense', color: '#6366f1', icon: 'Home' },
      { name: 'Alimentação', type: 'expense', color: '#f59e0b', icon: 'UtensilsCrossed' },
      { name: 'Transporte', type: 'expense', color: '#3b82f6', icon: 'Car' },
      { name: 'Saúde', type: 'expense', color: '#ef4444', icon: 'Heart' },
      { name: 'Lazer', type: 'expense', color: '#ec4899', icon: 'Gamepad2' },
      { name: 'Educação', type: 'expense', color: '#06b6d4', icon: 'BookOpen' },
      { name: 'Salário', type: 'income', color: '#10b981', icon: 'Banknote' },
      { name: 'Freelance', type: 'income', color: '#22d3ee', icon: 'Laptop' }
    ];

    const catStmt = db.prepare(`
      INSERT INTO categories (user_id, name, type, color, icon, parent_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    const parentIds: Record<string, number> = {};
    for (const cat of categories) {
      const info = catStmt.run(userId, cat.name, cat.type, cat.color, cat.icon, null);
      parentIds[cat.name] = info.lastInsertRowid as number;
    }

    // Subcategorias
    const subcategories = [
      { parent: 'Moradia', name: 'Aluguel' },
      { parent: 'Moradia', name: 'Condomínio' },
      { parent: 'Moradia', name: 'IPTU' },
      { parent: 'Moradia', name: 'Energia' },
      { parent: 'Moradia', name: 'Água' },
      { parent: 'Alimentação', name: 'Supermercado' },
      { parent: 'Alimentação', name: 'Restaurante' },
      { parent: 'Alimentação', name: 'Delivery' },
      { parent: 'Transporte', name: 'Combustível' },
      { parent: 'Transporte', name: 'Uber/99' },
      { parent: 'Saúde', name: 'Farmácia' },
      { parent: 'Saúde', name: 'Consulta' },
      { parent: 'Saúde', name: 'Plano de Saúde' },
      { parent: 'Lazer', name: 'Streaming' },
      { parent: 'Lazer', name: 'Viagens' }
    ];
    const subStmt = db.prepare(`
      INSERT INTO categories (user_id, name, type, color, icon, parent_id)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    for (const sub of subcategories) {
      const parentId = parentIds[sub.parent];
      if (parentId) {
        subStmt.run(userId, sub.name, 'expense', '#6366f1', 'Tag', parentId);
      }
    }

    console.log('✅ Dados iniciais inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
  }
}