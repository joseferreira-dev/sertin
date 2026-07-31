import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from 'recharts';
import { TrendingUp, TrendingDown, ArrowRight, ArrowLeftRight, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { accountService, Account } from '../services/accountService';
import { transactionService, Transaction } from '../services/transactionService';
import { goalService, Goal } from '../services/goalService';
import { formatBRL } from '../data/mock';

// Função para agrupar transações por categoria (simulada)
const aggregateByCategory = (transactions: Transaction[]) => {
  const map: Record<string, number> = {};
  transactions.forEach((tx) => {
    if (tx.type === 'expense' && tx.category_id) {
      // Idealmente buscar o nome da categoria via API, mas por enquanto usamos ID
      const key = String(tx.category_id);
      map[key] = (map[key] || 0) + Math.abs(tx.amount);
    }
  });
  return Object.entries(map).map(([category, value]) => ({
    name: `Categoria ${category}`, // substituir depois por nome real
    value,
    color: '#6366f1', // cores aleatórias
  }));
};

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const [accs, txns] = await Promise.all([
          accountService.getAll(token, false),
          transactionService.getAll(token, { limit: 10, sort: 'date_desc' }),
        ]);
        setAccounts(accs);
        setTransactions(Array.isArray(txns) ? txns : []);
        // setGoals(goalsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [token]);

  // Net Worth (ativos - passivos)
  const netWorth = accounts.reduce((s, a) => s + a.balance, 0);
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Math.abs(t.amount), 0);
  const monthBalance = totalIncome - totalExpenses;

  // Dados para gráficos (mock para exemplo – substituir com dados reais)
  const monthlyData = [
    { month: 'Jan', income: 8200, expenses: 6800 },
    { month: 'Fev', income: 7800, expenses: 7100 },
    { month: 'Mar', income: 10300, expenses: 6200 },
    { month: 'Abr', income: 7500, expenses: 7800 },
    { month: 'Mai', income: 9200, expenses: 6900 },
    { month: 'Jun', income: 8800, expenses: 7200 },
    { month: 'Jul', income: totalIncome, expenses: totalExpenses },
  ];

  const patrimonyData = [
    { month: 'Jan', value: 28400 },
    { month: 'Fev', value: 29100 },
    { month: 'Mar', value: 33200 },
    { month: 'Abr', value: 32900 },
    { month: 'Mai', value: 35200 },
    { month: 'Jun', value: 36600 },
    { month: 'Jul', value: netWorth },
  ];

  const topCategoriesData = aggregateByCategory(transactions);

  // Reuse tooltips etc.

  if (loading) return <div>Carregando...</div>;

  return (
    <div className="max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KPICard label="Patrimônio Líquido" value={netWorth} up color="var(--primary)" />
        <KPICard label="Receitas do Mês" value={totalIncome} up color="var(--primary)" />
        <KPICard label="Despesas do Mês" value={totalExpenses} up={false} color="var(--danger)" />
        <KPICard
          label="Saldo Líquido"
          value={monthBalance}
          up={monthBalance >= 0}
          color={monthBalance >= 0 ? 'var(--primary)' : 'var(--danger)'}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Monthly Comparison */}
        <div
          className="col-span-3 rounded-xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Comparativo Mensal</h3>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                Receitas vs Despesas — 2025
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ background: 'var(--primary)' }}
                />{' '}
                Receitas
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-sm inline-block"
                  style={{ background: 'var(--danger)' }}
                />{' '}
                Despesas
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={3}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="income" fill="var(--primary)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--danger)" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Categories */}
        <div
          className="col-span-2 rounded-xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Top Categorias</h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Despesas de Julho
            </p>
          </div>
          <div className="flex items-center justify-center">
            <PieChart width={140} height={140}>
              <Pie
                data={topCategoriesData}
                cx={65}
                cy={65}
                innerRadius={40}
                outerRadius={65}
                dataKey="value"
              >
                {topCategoriesData.map((entry, i) => (
                  <Cell key={i} fill={entry.color || '#6366f1'} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip formatter={(v: any) => formatBRL(Number(v))} />
            </PieChart>
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {topCategoriesData.slice(0, 5).map((d, i) => (
              <div key={i} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ background: d.color || '#6366f1' }}
                  />
                  {d.name}
                </span>
                <span className="mono" style={{ color: 'var(--muted-foreground)' }}>
                  {formatBRL(d.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Patrimony Chart */}
        <div
          className="col-span-2 rounded-xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Evolução Patrimonial</h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              Últimos 7 meses
            </p>
          </div>
          <div
            className="text-2xl font-bold mono mb-3"
            style={{ letterSpacing: '-0.04em', color: 'var(--primary)' }}
          >
            {formatBRL(netWorth)}
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={patrimonyData}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                formatter={(v: any) => formatBRL(Number(v))}
                contentStyle={{
                  background: '#111827',
                  border: '1px solid var(--border)',
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="var(--primary)"
                strokeWidth={2}
                fill="url(#netGrad)"
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Goals Card */}
        <div
          className="col-span-1 rounded-xl p-5"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Suas Metas</h3>
            <button
              onClick={() => onNavigate('goals')}
              style={{ color: 'var(--muted-foreground)' }}
              className="hover:opacity-70 transition-opacity"
            >
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {goals.slice(0, 3).map((g) => (
              <div key={g.id} className="flex items-center gap-3">
                <div className="relative w-10 h-10 flex-shrink-0">
                  <svg className="progress-ring" width="40" height="40">
                    <circle
                      cx="20"
                      cy="20"
                      r={18}
                      fill="none"
                      stroke="var(--border)"
                      strokeWidth="3"
                    />
                    <circle
                      cx="20"
                      cy="20"
                      r={18}
                      fill="none"
                      stroke={g.color || '#10b981'}
                      strokeWidth="3"
                      strokeDasharray={2 * Math.PI * 18}
                      strokeDashoffset={(1 - g.current / g.target) * 2 * Math.PI * 18}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">
                    {Math.round((g.current / g.target) * 100)}%
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{g.name}</p>
                  <p className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>
                    {formatBRL(g.current)}
                  </p>
                </div>
              </div>
            ))}
          </div>
          <button
            onClick={() => onNavigate('goals')}
            className="mt-4 w-full text-xs py-2 rounded-lg transition-opacity hover:opacity-80 text-center"
            style={{
              background: 'rgba(16,185,129,0.08)',
              color: 'var(--primary)',
              border: '1px solid rgba(16,185,129,0.2)',
            }}
          >
            Ver todas as metas
          </button>
        </div>

        {/* Recent Transactions */}
        <div
          className="col-span-2 rounded-xl"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div
            className="flex items-center justify-between px-5 py-4 border-b"
            style={{ borderColor: 'var(--border)' }}
          >
            <h3 className="text-sm font-semibold">Últimas Transações</h3>
            <button
              onClick={() => onNavigate('transactions')}
              className="text-xs transition-opacity hover:opacity-70"
              style={{ color: 'var(--primary)' }}
            >
              Ver todas →
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {transactions.slice(0, 6).map((tx) => (
              <div
                key={tx.id}
                className="flex items-center gap-3 px-5 py-3 group hover:bg-secondary/30 transition-colors"
              >
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                  style={{
                    background:
                      tx.type === 'income'
                        ? 'rgba(16,185,129,0.12)'
                        : tx.type === 'transfer'
                          ? 'rgba(99,102,241,0.12)'
                          : 'rgba(239,68,68,0.12)',
                  }}
                >
                  {tx.type === 'transfer' ? (
                    <ArrowLeftRight size={11} style={{ color: 'var(--accent)' }} />
                  ) : tx.type === 'income' ? (
                    <TrendingUp size={11} style={{ color: 'var(--primary)' }} />
                  ) : (
                    <TrendingDown size={11} style={{ color: 'var(--danger)' }} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{tx.description}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                    Categoria {tx.category_id} ·{' '}
                    {tx.date.slice(5, 10).split('-').reverse().join('/')}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold mono flex-shrink-0"
                  style={{
                    color:
                      tx.type === 'income'
                        ? 'var(--primary)'
                        : tx.type === 'transfer'
                          ? 'var(--muted-foreground)'
                          : 'var(--danger)',
                  }}
                >
                  {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                  {formatBRL(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add FAB */}
      <div className="fixed bottom-8 right-8">
        <button
          onClick={() => onNavigate('transactions')}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  );
}

// Componentes auxiliares
function KPICard({ label, value, up, color }: any) {
  return (
    <div
      className="rounded-xl p-5"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <p className="text-xs font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>
        {label}
      </p>
      <p className="text-2xl font-bold mono mb-1.5" style={{ letterSpacing: '-0.04em', color }}>
        {formatBRL(value)}
      </p>
      <div className="flex items-center gap-1">
        {up ? (
          <TrendingUp size={11} color="var(--primary)" />
        ) : (
          <TrendingDown size={11} color="var(--danger)" />
        )}
        <span className="text-xs" style={{ color: up ? 'var(--primary)' : 'var(--danger)' }}>
          {up ? '+' : '-'} vs mês anterior
        </span>
      </div>
    </div>
  );
}

function CustomTooltip({ active, payload, label }: any) {
  if (active && payload?.length) {
    return (
      <div
        className="p-3 rounded-lg text-xs"
        style={{ background: '#111827', border: '1px solid var(--border)' }}
      >
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name === 'income' ? 'Receitas' : 'Despesas'}: {formatBRL(p.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
}
