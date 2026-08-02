export const mockUser = {
  id: 1,
  name: 'Lucas Ferreira',
  email: 'lucas@sertin.app',
  initials: 'LF',
};

export const mockAccounts = [
  { id: 1, name: 'Nubank', type: 'digital', balance: 4230.50, color: '#8b5cf6', institution: 'Nubank', icon: 'Wallet', status: 'active' },
  { id: 2, name: 'Bradesco CC', type: 'checking', balance: 12450.00, color: '#ef4444', institution: 'Bradesco', icon: 'Building2', status: 'active' },
  { id: 3, name: 'Poupança Bradesco', type: 'savings', balance: 8900.00, color: '#3b82f6', institution: 'Bradesco', icon: 'PiggyBank', status: 'active' },
  { id: 4, name: 'Cartão Inter', type: 'credit', balance: -3420.00, limit_amount: 8000, color: '#f97316', institution: 'Banco Inter', icon: 'CreditCard', closing_day: 15, due_day: 22, status: 'active' },
  { id: 5, name: 'Nubank Roxinho', type: 'credit', balance: -1280.00, limit_amount: 5000, color: '#a855f7', institution: 'Nubank', icon: 'CreditCard', closing_day: 10, due_day: 17, status: 'active' },
  { id: 6, name: 'Carteira', type: 'cash', balance: 350.00, color: '#10b981', institution: '', icon: 'Banknote', status: 'active' },
];

export const mockCategories = [
  { id: 1, name: 'Moradia', type: 'expense', color: '#6366f1', icon: 'Home', children: [
    { id: 11, name: 'Aluguel', parentId: 1 },
    { id: 12, name: 'Condomínio', parentId: 1 },
    { id: 13, name: 'IPTU', parentId: 1 },
    { id: 14, name: 'Energia', parentId: 1 },
    { id: 15, name: 'Água', parentId: 1 },
  ]},
  { id: 2, name: 'Alimentação', type: 'expense', color: '#f59e0b', icon: 'UtensilsCrossed', children: [
    { id: 21, name: 'Supermercado', parentId: 2 },
    { id: 22, name: 'Restaurante', parentId: 2 },
    { id: 23, name: 'Delivery', parentId: 2 },
    { id: 24, name: 'Padaria', parentId: 2 },
  ]},
  { id: 3, name: 'Transporte', type: 'expense', color: '#3b82f6', icon: 'Car', children: [
    { id: 31, name: 'Combustível', parentId: 3 },
    { id: 32, name: 'Uber/99', parentId: 3 },
    { id: 33, name: 'Estacionamento', parentId: 3 },
    { id: 34, name: 'Manutenção', parentId: 3 },
  ]},
  { id: 4, name: 'Saúde', type: 'expense', color: '#ef4444', icon: 'Heart', children: [
    { id: 41, name: 'Farmácia', parentId: 4 },
    { id: 42, name: 'Consulta', parentId: 4 },
    { id: 43, name: 'Plano de Saúde', parentId: 4 },
    { id: 44, name: 'Academia', parentId: 4 },
  ]},
  { id: 5, name: 'Lazer', type: 'expense', color: '#ec4899', icon: 'Gamepad2', children: [
    { id: 51, name: 'Cinema', parentId: 5 },
    { id: 52, name: 'Streaming', parentId: 5 },
    { id: 53, name: 'Viagens', parentId: 5 },
    { id: 54, name: 'Eventos', parentId: 5 },
  ]},
  { id: 6, name: 'Educação', type: 'expense', color: '#06b6d4', icon: 'BookOpen', children: [
    { id: 61, name: 'Cursos', parentId: 6 },
    { id: 62, name: 'Livros', parentId: 6 },
  ]},
  { id: 7, name: 'Vestuário', type: 'expense', color: '#8b5cf6', icon: 'ShoppingBag', children: [
    { id: 71, name: 'Roupas', parentId: 7 },
    { id: 72, name: 'Calçados', parentId: 7 },
  ]},
  { id: 8, name: 'Salário', type: 'income', color: '#10b981', icon: 'Banknote', children: [] },
  { id: 9, name: 'Freelance', type: 'income', color: '#22d3ee', icon: 'Laptop', children: [] },
  { id: 10, name: 'Investimentos', type: 'income', color: '#a3e635', icon: 'TrendingUp', children: [] },
]

export const mockTags = [
  { id: 1, name: 'Fixo', color: '#6366f1', description: 'Despesas fixas mensais', count: 12 },
  { id: 2, name: 'Parcelado', color: '#f59e0b', description: 'Compras parceladas', count: 8 },
  { id: 3, name: 'Trabalho', color: '#3b82f6', description: 'Gastos relacionados ao trabalho', count: 5 },
  { id: 4, name: 'Presente', color: '#ec4899', description: 'Presentes para outras pessoas', count: 3 },
  { id: 5, name: 'Viagem Europa', color: '#10b981', description: 'Economias para viagem à Europa', count: 7 },
  { id: 6, name: 'Marido', color: '#8b5cf6', description: 'Gastos compartilhados com o marido', count: 15 },
  { id: 7, name: 'Urgente', color: '#ef4444', description: 'Pagamentos urgentes', count: 2 },
  { id: 8, name: 'Família', color: '#f97316', description: 'Gastos com a família', count: 9 },
]

export const mockTransactions = [
  { id: 1, date: '2025-07-28', desc: 'Salário — Empresa ABC', category: 'Salário', categoryId: 8, account: 'Bradesco CC', accountId: 2, amount: 7500.00, type: 'income', status: 'confirmed', tags: [] },
  { id: 2, date: '2025-07-27', desc: 'iFood — Sushi Mais', category: 'Delivery', categoryId: 23, account: 'Nubank', accountId: 1, amount: -68.90, type: 'expense', status: 'confirmed', tags: [{ id: 6, name: 'Marido', color: '#8b5cf6' }] },
  { id: 3, date: '2025-07-26', desc: 'Uber — Trabalho', category: 'Uber/99', categoryId: 32, account: 'Nubank', accountId: 1, amount: -23.40, type: 'expense', status: 'confirmed', tags: [{ id: 3, name: 'Trabalho', color: '#3b82f6' }] },
  { id: 4, date: '2025-07-25', desc: 'Pão de Açúcar', category: 'Supermercado', categoryId: 21, account: 'Cartão Inter', accountId: 4, amount: -342.80, type: 'expense', status: 'confirmed', tags: [{ id: 6, name: 'Marido', color: '#8b5cf6' }, { id: 8, name: 'Família', color: '#f97316' }] },
  { id: 5, date: '2025-07-24', desc: 'Netflix', category: 'Streaming', categoryId: 52, account: 'Cartão Inter', accountId: 4, amount: -39.90, type: 'expense', status: 'confirmed', tags: [{ id: 1, name: 'Fixo', color: '#6366f1' }] },
  { id: 6, date: '2025-07-23', desc: 'Smart Fit', category: 'Academia', categoryId: 44, account: 'Bradesco CC', accountId: 2, amount: -99.90, type: 'expense', status: 'confirmed', tags: [{ id: 1, name: 'Fixo', color: '#6366f1' }] },
  { id: 7, date: '2025-07-22', desc: 'Conta de Luz — ENEL', category: 'Energia', categoryId: 14, account: 'Bradesco CC', accountId: 2, amount: -187.40, type: 'expense', status: 'confirmed', tags: [{ id: 1, name: 'Fixo', color: '#6366f1' }] },
  { id: 8, date: '2025-07-20', desc: 'Aluguel Julho', category: 'Aluguel', categoryId: 11, account: 'Bradesco CC', accountId: 2, amount: -2200.00, type: 'expense', status: 'confirmed', tags: [{ id: 1, name: 'Fixo', color: '#6366f1' }] },
  { id: 9, date: '2025-07-19', desc: 'Droga Raia', category: 'Farmácia', categoryId: 41, account: 'Nubank', accountId: 1, amount: -45.60, type: 'expense', status: 'confirmed', tags: [] },
  { id: 10, date: '2025-07-18', desc: 'Combustível BR Mania', category: 'Combustível', categoryId: 31, account: 'Bradesco CC', accountId: 2, amount: -180.00, type: 'expense', status: 'confirmed', tags: [] },
  { id: 11, date: '2025-07-17', desc: 'Freelance — Projeto Loja', category: 'Freelance', categoryId: 9, account: 'Nubank', accountId: 1, amount: 2800.00, type: 'income', status: 'confirmed', tags: [{ id: 3, name: 'Trabalho', color: '#3b82f6' }] },
  { id: 12, date: '2025-07-15', desc: 'Condomínio', category: 'Condomínio', categoryId: 12, account: 'Bradesco CC', accountId: 2, amount: -420.00, type: 'expense', status: 'confirmed', tags: [{ id: 1, name: 'Fixo', color: '#6366f1' }] },
  { id: 13, date: '2025-07-14', desc: 'Cinema — Kinoplex', category: 'Cinema', categoryId: 51, account: 'Cartão Inter', accountId: 4, amount: -72.00, type: 'expense', status: 'confirmed', tags: [{ id: 6, name: 'Marido', color: '#8b5cf6' }] },
  { id: 14, date: '2025-07-12', desc: 'Curso Udemy — React Avançado', category: 'Cursos', categoryId: 61, account: 'Cartão Inter', accountId: 4, amount: -149.90, type: 'expense', status: 'confirmed', tags: [{ id: 3, name: 'Trabalho', color: '#3b82f6' }, { id: 2, name: 'Parcelado', color: '#f59e0b' }] },
  { id: 15, date: '2025-07-10', desc: 'Transferência → Poupança', category: 'Transferência', categoryId: null, account: 'Bradesco CC', accountId: 2, destAccount: 'Poupança Bradesco', destAccountId: 3, amount: -1000.00, type: 'transfer', status: 'confirmed', tags: [] },
  { id: 16, date: '2025-07-08', desc: 'Zara — Roupa de Inverno (3x)', category: 'Roupas', categoryId: 71, account: 'Nubank Roxinho', accountId: 5, amount: -489.00, type: 'expense', status: 'confirmed', tags: [{ id: 2, name: 'Parcelado', color: '#f59e0b' }], installment: '1/3' },
  { id: 17, date: '2025-07-05', desc: 'Plano de Saúde — Unimed', category: 'Plano de Saúde', categoryId: 43, account: 'Bradesco CC', accountId: 2, amount: -380.00, type: 'expense', status: 'confirmed', tags: [{ id: 1, name: 'Fixo', color: '#6366f1' }] },
  { id: 18, date: '2025-07-03', desc: 'Spotify', category: 'Streaming', categoryId: 52, account: 'Cartão Inter', accountId: 4, amount: -21.90, type: 'expense', status: 'confirmed', tags: [{ id: 1, name: 'Fixo', color: '#6366f1' }] },
  { id: 19, date: '2025-07-02', desc: 'Consulta Dentista', category: 'Consulta', categoryId: 42, account: 'Bradesco CC', accountId: 2, amount: -220.00, type: 'expense', status: 'pending', tags: [] },
  { id: 20, date: '2025-07-01', desc: 'Internet Vivo Fibra', category: 'Moradia', categoryId: 1, account: 'Bradesco CC', accountId: 2, amount: -119.90, type: 'expense', status: 'confirmed', tags: [{ id: 1, name: 'Fixo', color: '#6366f1' }] },
]

export const mockBudgets = [
  { id: 1, category: 'Moradia', categoryId: 1, budgeted: 2800, spent: 2987.30, color: '#6366f1', month: '2025-07' },
  { id: 2, category: 'Alimentação', categoryId: 2, budgeted: 800, spent: 650.00, color: '#f59e0b', month: '2025-07' },
  { id: 3, category: 'Transporte', categoryId: 3, budgeted: 400, spent: 379.40, color: '#3b82f6', month: '2025-07' },
  { id: 4, category: 'Saúde', categoryId: 4, budgeted: 600, spent: 745.50, color: '#ef4444', month: '2025-07' },
  { id: 5, category: 'Lazer', categoryId: 5, budgeted: 300, spent: 421.90, color: '#ec4899', month: '2025-07' },
  { id: 6, category: 'Educação', categoryId: 6, budgeted: 200, spent: 149.90, color: '#06b6d4', month: '2025-07' },
]

export const mockGoals = [
  { id: 1, name: 'Viagem para Europa', type: 'travel', target: 15000, current: 8430, color: '#10b981', icon: '✈️', priority: 'high', status: 'active', targetDate: '2025-12-15', description: 'Roteiro de 15 dias pela Europa — Paris, Roma, Lisboa', accounts: ['Poupança Bradesco'] },
  { id: 2, name: 'Fundo de Emergência', type: 'emergency', target: 25000, current: 8900, color: '#6366f1', icon: '🛡️', priority: 'urgent', status: 'active', targetDate: '2026-04-01', description: '6 meses de despesas para emergências', accounts: ['Poupança Bradesco'] },
  { id: 3, name: 'MacBook Pro M4', type: 'material', target: 14000, current: 3200, color: '#8b5cf6', icon: '💻', priority: 'medium', status: 'active', targetDate: '2025-11-01', description: 'Upgrade do equipamento de trabalho', accounts: ['Nubank'] },
  { id: 4, name: 'Reserva de Oportunidade', type: 'opportunity', target: 50000, current: 18750, color: '#f59e0b', icon: '📈', priority: 'low', status: 'active', targetDate: null, description: 'Reserva para oportunidades de investimento', accounts: ['Bradesco CC'] },
]

export const monthlyData = [
  { month: 'Jan', income: 8200, expenses: 6800 },
  { month: 'Fev', income: 7800, expenses: 7100 },
  { month: 'Mar', income: 10300, expenses: 6200 },
  { month: 'Abr', income: 7500, expenses: 7800 },
  { month: 'Mai', income: 9200, expenses: 6900 },
  { month: 'Jun', income: 8800, expenses: 7200 },
  { month: 'Jul', income: 10300, expenses: 5100 },
]

export const patrimonyData = [
  { month: 'Jan', value: 28400 },
  { month: 'Fev', value: 29100 },
  { month: 'Mar', value: 33200 },
  { month: 'Abr', value: 32900 },
  { month: 'Mai', value: 35200 },
  { month: 'Jun', value: 36600 },
  { month: 'Jul', value: 39230 },
]

export const topCategoriesData = [
  { name: 'Moradia', value: 2987.30, color: '#6366f1' },
  { name: 'Alimentação', value: 650.00, color: '#f59e0b' },
  { name: 'Transporte', value: 379.40, color: '#3b82f6' },
  { name: 'Saúde', value: 745.50, color: '#ef4444' },
  { name: 'Lazer', value: 421.90, color: '#ec4899' },
]

export const auditLogs = [
  { id: 1, datetime: '2025-07-28 09:14:32', user: 'Lucas Ferreira', action: 'Login', detail: 'Autenticação bem-sucedida', ip: '127.0.0.1' },
  { id: 2, datetime: '2025-07-28 09:16:01', user: 'Lucas Ferreira', action: 'Criação de transação', detail: 'ID 1 — Salário R$ 7.500,00', ip: '127.0.0.1' },
  { id: 3, datetime: '2025-07-27 14:22:10', user: 'Lucas Ferreira', action: 'Edição de transação', detail: 'ID 2 — Valor alterado de R$ 72,00 para R$ 68,90', ip: '127.0.0.1' },
  { id: 4, datetime: '2025-07-25 18:05:44', user: 'Lucas Ferreira', action: 'Exclusão de transação', detail: 'ID 8 — Aluguel Junho R$ 2.200,00', ip: '127.0.0.1' },
  { id: 5, datetime: '2025-07-22 11:30:00', user: 'Lucas Ferreira', action: 'Alteração de senha', detail: 'Senha redefinida via pergunta de segurança', ip: '127.0.0.1' },
  { id: 6, datetime: '2025-07-20 08:00:12', user: 'Lucas Ferreira', action: 'Backup realizado', detail: 'Backup manual em ~/Documents/Sertin/Backups', ip: '127.0.0.1' },
]

export const formatBRL = (value: number) => {
  const abs = Math.abs(value)
  const formatted = abs.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return `R$ ${formatted}`
}

export const netWorth = () => {
  const assets = mockAccounts.filter(a => a.balance > 0).reduce((s, a) => s + a.balance, 0)
  const liabilities = mockAccounts.filter(a => a.balance < 0).reduce((s, a) => s + Math.abs(a.balance), 0)
  return assets - liabilities
}
