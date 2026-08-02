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
    const password = 'Jose2569*';
    const hash = bcrypt.hashSync(password, 12);
    const stmt = db.prepare(`
      INSERT INTO users (name, email, password_hash, security_question, security_answer)
      VALUES (?, ?, ?, ?, ?)
    `);
    const info = stmt.run(
      'José Ferreira',
      'jose@sertin.app',
      hash,
      'Qual é o seu pokemon favorito?',
      'Gengar'
    );
    const userId = info.lastInsertRowid as number;

    // 2. Criar contas padrão
    const accounts = [
      {
        name: 'Nubank',
        type: 'digital',
        balance: 4230.5,
        color: '#8b5cf6',
        institution: 'Nubank',
        icon: 'Wallet',
        status: 'active',
      },
      {
        name: 'Bradesco CC',
        type: 'checking',
        balance: 12450.0,
        color: '#ef4444',
        institution: 'Bradesco',
        icon: 'Building2',
        status: 'active',
      },
      {
        name: 'Poupança Bradesco',
        type: 'savings',
        balance: 8900.0,
        color: '#3b82f6',
        institution: 'Bradesco',
        icon: 'PiggyBank',
        status: 'active',
      },
      {
        name: 'Cartão Inter',
        type: 'credit',
        balance: -3420.0,
        color: '#f97316',
        institution: 'Banco Inter',
        icon: 'CreditCard',
        limit_amount: 8000,
        closing_day: 15,
        due_day: 22,
        status: 'active',
      },
      {
        name: 'Carteira',
        type: 'cash',
        balance: 350.0,
        color: '#10b981',
        institution: '',
        icon: 'Banknote',
        status: 'active',
      },
    ];

    const accStmt = db.prepare(`
      INSERT INTO accounts (user_id, name, type, balance, color, institution, icon, limit_amount, closing_day, due_day, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
        acc.due_day || null,
        acc.status || 'active'
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
      { name: 'Freelance', type: 'income', color: '#22d3ee', icon: 'Laptop' },
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
      { parent: 'Lazer', name: 'Viagens' },
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

    // 4. Tags padrão
    const tags = [
      { name: 'Fixo', color: '#6366f1', description: 'Despesas fixas mensais' },
      { name: 'Parcelado', color: '#f59e0b', description: 'Compras parceladas' },
      { name: 'Trabalho', color: '#3b82f6', description: 'Gastos relacionados ao trabalho' },
      { name: 'Presente', color: '#ec4899', description: 'Presentes para outras pessoas' },
      { name: 'Viagem Europa', color: '#10b981', description: 'Economias para viagem à Europa' },
      { name: 'Marido', color: '#8b5cf6', description: 'Gastos compartilhados com o marido' },
      { name: 'Urgente', color: '#ef4444', description: 'Pagamentos urgentes' },
      { name: 'Família', color: '#f97316', description: 'Gastos com a família' },
    ];

    const tagStmt = db.prepare(`
      INSERT INTO tags (user_id, name, color, description)
      VALUES (?, ?, ?, ?)
    `);
    for (const tag of tags) {
      tagStmt.run(userId, tag.name, tag.color, tag.description);
    }

    console.log('✅ Dados iniciais inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
  }
}
