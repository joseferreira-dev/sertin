import db from './config/database';
import bcrypt from 'bcrypt';

export function seed() {
  try {
    const count = db.prepare('SELECT COUNT(*) as count FROM users').get() as { count: number };
    if (count.count > 0) {
      console.log('Banco já possui dados. Pulando seed.');
      return;
    }

    console.log('Inserindo dados iniciais...');

    // 1. Usuário
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

    // 2. Contas
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
        name: 'Carteira',
        type: 'cash',
        balance: 350.0,
        color: '#10b981',
        institution: '',
        icon: 'Banknote',
        status: 'active',
      },
      {
        name: 'Conta Salário',
        type: 'checking',
        balance: 12000.0,
        color: '#3b82f6',
        institution: 'Banco do Brasil',
        icon: 'Building2',
        status: 'active',
      },
    ];

    const accStmt = db.prepare(`
      INSERT INTO accounts (user_id, name, type, balance, color, institution, icon, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const initTxStmt = db.prepare(`
      INSERT INTO transactions (user_id, account_id, type, amount, description, date, status, installment_total, installment_current)
      VALUES (?, ?, 'income', ?, 'Saldo inicial', date('now'), 'confirmed', 1, 1)
    `);

    const accountIds: number[] = [];
    for (const acc of accounts) {
      const info = accStmt.run(
        userId,
        acc.name,
        acc.type,
        acc.balance,
        acc.color,
        acc.institution,
        acc.icon,
        acc.status
      );
      const accountId = info.lastInsertRowid as number;
      accountIds.push(accountId);
      if (acc.balance !== 0) {
        initTxStmt.run(userId, accountId, acc.balance);
      }
    }

    // 3. Cartão de crédito
    const cardStmt = db.prepare(`
      INSERT INTO credit_cards (user_id, name, institution, limit_amount, closing_day, due_day, color, icon, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const cardInfo = cardStmt.run(
      userId,
      'Cartão Inter',
      'Banco Inter',
      8000,
      15,
      22,
      '#f97316',
      'CreditCard',
      'active'
    );
    const cardId = cardInfo.lastInsertRowid as number;

    // 4. Categorias padrão
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

    // Tags padrão
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
    const tagIds: number[] = [];
    for (const tag of tags) {
      const info = tagStmt.run(userId, tag.name, tag.color, tag.description);
      tagIds.push(info.lastInsertRowid as number);
    }

    // 5. Orçamentos de exemplo
    const sampleBudgets = [
      { category: 'Moradia', amount: 2800 },
      { category: 'Alimentação', amount: 800 },
      { category: 'Saúde', amount: 600 },
      { category: 'Transporte', amount: 400 },
      { category: 'Lazer', amount: 300 },
      { category: 'Educação', amount: 200 },
    ];

    const budgetStmt = db.prepare(`
      INSERT INTO budgets (user_id, category_id, month, budgeted_amount)
      VALUES (?, ?, ?, ?)
    `);
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"

    for (const sb of sampleBudgets) {
      const catId = parentIds[sb.category];
      if (catId) {
        budgetStmt.run(userId, catId, currentMonth, sb.amount);
      }
    }

    // 6. Metas de exemplo (AGORA COM CRIAÇÃO DE CONTA ASSOCIADA)
    const sampleGoals = [
      {
        name: 'Fundo de Emergência',
        type: 'emergency',
        target_amount: 12000,
        current_amount: 4500,
        color: '#3b82f6',
        icon: '🛡️',
        priority: 'urgent',
        target_date: '2026-12-31',
        description: 'Reserva para 6 meses de despesas',
      },
      {
        name: 'Viagem para Europa',
        type: 'travel',
        target_amount: 15000,
        current_amount: 3200,
        color: '#f59e0b',
        icon: '✈️',
        priority: 'high',
        target_date: '2026-07-15',
        description: 'Pacote de viagem + gastos',
      },
    ];

    const goalStmt = db.prepare(`
      INSERT INTO goals (
        user_id, name, type, target_amount, current_amount, color, icon,
        priority, status, target_date, description, annual_yield
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Para criar a conta da meta, usamos a mesma lógica do modelo Goal.create
    const goalAccountStmt = db.prepare(`
      INSERT INTO accounts (user_id, name, type, balance, color, icon, goal_id, status)
      VALUES (?, ?, 'goal', 0, ?, ?, ?, 'active')
    `);

    const goalIds: number[] = [];
    for (const g of sampleGoals) {
      // Insere a meta
      const info = goalStmt.run(
        userId,
        g.name,
        g.type,
        g.target_amount,
        g.current_amount,
        g.color,
        g.icon,
        g.priority,
        'active',
        g.target_date,
        g.description,
        0
      );
      const goalId = info.lastInsertRowid as number;
      goalIds.push(goalId);

      // Cria a conta associada do tipo 'goal'
      goalAccountStmt.run(userId, g.name, g.color, g.icon || '💰', goalId);
    }

    // 7. Transações adicionais (despesas e receitas)
    const txnStmt = db.prepare(`
      INSERT INTO transactions (
        user_id, account_id, category_id, type, amount, description, date, status,
        installment_total, installment_current
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // Datas
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();

    const dateStr = (day: number, m: number = month, y: number = year) => {
      const d = new Date(y, m, day);
      return d.toISOString().slice(0, 10);
    };

    const expenseCategories = [
      'Moradia',
      'Alimentação',
      'Transporte',
      'Saúde',
      'Lazer',
      'Educação',
    ];
    const descriptions = [
      'Supermercado Extra',
      'Aluguel',
      'Uber',
      'Farmácia',
      'Cinema',
      'Curso de Inglês',
      'Restaurante',
      'Posto de Gasolina',
      'Plano de Saúde',
      'Streaming Netflix',
      'Energia elétrica',
      'Água',
      'Condomínio',
    ];

    for (let m = month - 2; m <= month; m++) {
      const monthIndex = ((m % 12) + 12) % 12;
      const yearIndex = year + Math.floor(m / 12) - (m < 0 ? 1 : 0);
      const numDays = 20 + Math.floor(Math.random() * 8);
      for (let d = 1; d <= numDays; d += 2) {
        const cat = expenseCategories[Math.floor(Math.random() * expenseCategories.length)];
        const catId = parentIds[cat];
        if (!catId) continue;
        const accountId = accountIds[Math.floor(Math.random() * accountIds.length)];
        const amount = (10 + Math.random() * 200).toFixed(2);
        const desc = descriptions[Math.floor(Math.random() * descriptions.length)];
        const date = dateStr(d, monthIndex, yearIndex);
        txnStmt.run(
          userId,
          accountId,
          catId,
          'expense',
          -parseFloat(amount),
          desc,
          date,
          'confirmed',
          1,
          1
        );
      }
    }

    // Receitas
    const incomeDates = [5, 20];
    for (const day of incomeDates) {
      const catId = parentIds['Salário'];
      if (catId) {
        txnStmt.run(
          userId,
          accountIds[2],
          catId,
          'income',
          7500,
          'Salário',
          dateStr(day),
          'confirmed',
          1,
          1
        );
      }
    }
    const freelanceCatId = parentIds['Freelance'];
    if (freelanceCatId) {
      txnStmt.run(
        userId,
        accountIds[0],
        freelanceCatId,
        'income',
        1200,
        'Freelance - Site',
        dateStr(15),
        'confirmed',
        1,
        1
      );
    }

    // Transferência
    const transferStmt = db.prepare(`
      INSERT INTO transactions (
        user_id, account_id, dest_account_id, type, amount, description, date, status,
        installment_total, installment_current
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    transferStmt.run(
      userId,
      accountIds[2],
      accountIds[0],
      'transfer',
      1000,
      'Transferência para Nubank',
      dateStr(10),
      'confirmed',
      1,
      1
    );

    // 8. Parcelamento
    const installmentStmt = db.prepare(`
      INSERT INTO installments (
        user_id, account_id, credit_card_id, category_id, description, total_amount, installment_count, start_date, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const installmentInfo = installmentStmt.run(
      userId,
      null,
      cardId,
      parentIds['Lazer'],
      'Viagem para Europa - Parcelado',
      5000,
      10,
      dateStr(1, month - 1),
      'active'
    );
    const installmentId = installmentInfo.lastInsertRowid as number;

    // Gerar parcelas - CORRIGIDO: garantindo 13 placeholders
    const parcelStmt = db.prepare(`
      INSERT INTO transactions (
        user_id, account_id, credit_card_id, category_id, type, amount, description, date, status,
        installment_id, installment_number, installment_total, installment_current
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    const totalParcelas = 10;
    const valorParcela = 500;
    for (let i = 1; i <= totalParcelas; i++) {
      const dataParcela = new Date(year, month - 1 + i, 22);
      const dateStrParcela = dataParcela.toISOString().slice(0, 10);
      parcelStmt.run(
        userId,
        null,
        cardId,
        parentIds['Lazer'],
        'expense',
        -valorParcela,
        `Parcela ${i}/${totalParcelas} - Viagem Europa`,
        dateStrParcela,
        'pending',
        installmentId,
        i,
        totalParcelas,
        i
      );
    }
    const updateParcelaStmt = db.prepare(`
      UPDATE transactions SET status = 'confirmed' WHERE installment_id = ? AND installment_number <= ?
    `);
    updateParcelaStmt.run(installmentId, 3);

    // 9. Aportes em metas (contribuições) - usando a tabela goal_contributions
    const contributionStmt = db.prepare(`
      INSERT INTO goal_contributions (goal_id, amount, date, note)
      VALUES (?, ?, ?, ?)
    `);
    contributionStmt.run(goalIds[0], 1000, dateStr(5), 'Aporte mensal');
    contributionStmt.run(goalIds[0], 500, dateStr(20), 'Bônus');
    contributionStmt.run(goalIds[1], 1500, dateStr(10), 'Poupança viagem');

    // Atualizar current_amount das metas (somar aportes)
    const updateGoalStmt = db.prepare(`
      UPDATE goals SET current_amount = (
        SELECT COALESCE(SUM(amount), 0) FROM goal_contributions WHERE goal_id = goals.id
      ) WHERE id = ?
    `);
    for (const gid of goalIds) {
      updateGoalStmt.run(gid);
    }

    // 10. Logs
    const logStmt = db.prepare(`
      INSERT INTO logs (user_id, action, detail, ip)
      VALUES (?, ?, ?, ?)
    `);
    logStmt.run(userId, 'Seed', 'Dados iniciais inseridos', '127.0.0.1');

    console.log('✅ Dados iniciais inseridos com sucesso!');
  } catch (error) {
    console.error('Erro ao executar seed:', error);
  }
}
