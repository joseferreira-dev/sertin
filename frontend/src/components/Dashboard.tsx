import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart,
} from 'recharts'
import { TrendingUp, TrendingDown, ArrowRight, ArrowLeftRight, Pencil, Trash2, Target, Plus } from 'lucide-react'
import { mockTransactions, mockGoals, mockAccounts, monthlyData, patrimonyData, topCategoriesData, formatBRL, netWorth } from '../data/mock'

const totalIncome = 10300
const totalExpenses = 5100
const monthBalance = totalIncome - totalExpenses

export default function Dashboard({ onNavigate }: { onNavigate: (page: string) => void }) {
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAmount, setQuickAmount] = useState('')
  const [quickDesc, setQuickDesc] = useState('')
  const [activeSlice, setActiveSlice] = useState<number | null>(null)
  const nw = netWorth()

  const kpis = [
    { label: 'Patrimônio Líquido', value: nw, prefix: 'R$', up: true, delta: '+R$ 2.630' },
    { label: 'Receitas do Mês', value: totalIncome, prefix: 'R$', up: true, delta: '+17% vs jun' },
    { label: 'Despesas do Mês', value: totalExpenses, prefix: 'R$', up: false, delta: '-29% vs jun' },
    { label: 'Saldo Líquido', value: monthBalance, prefix: 'R$', up: true, delta: 'Jul/2025' },
  ]

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) {
      return (
        <div className="p-3 rounded-lg text-xs" style={{ background: '#111827', border: '1px solid var(--border)' }}>
          <p className="font-semibold mb-1">{label}</p>
          {payload.map((p: any) => (
            <p key={p.name} style={{ color: p.color }}>
              {p.name === 'income' ? 'Receitas' : 'Despesas'}: {formatBRL(p.value)}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload?.length) {
      const total = topCategoriesData.reduce((s, d) => s + d.value, 0)
      return (
        <div className="p-2.5 rounded-lg text-xs" style={{ background: '#111827', border: '1px solid var(--border)' }}>
          <p className="font-semibold">{payload[0].name}</p>
          <p>{formatBRL(payload[0].value)}</p>
          <p style={{ color: 'var(--muted-foreground)' }}>{((payload[0].value / total) * 100).toFixed(1)}%</p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs font-medium mb-3" style={{ color: 'var(--muted-foreground)' }}>{kpi.label}</p>
            <p className="text-2xl font-bold mono mb-1.5" style={{
              letterSpacing: '-0.04em',
              color: i === 2 ? 'var(--danger)' : i === 3 ? 'var(--primary)' : 'var(--foreground)',
            }}>
              {i === 2 ? '-' : i === 3 ? '+' : ''}{formatBRL(kpi.value)}
            </p>
            <div className="flex items-center gap-1">
              {kpi.up ? <TrendingUp size={11} color="var(--primary)" /> : <TrendingDown size={11} color="var(--danger)" />}
              <span className="text-xs" style={{ color: kpi.up ? 'var(--primary)' : 'var(--danger)' }}>{kpi.delta}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-5 gap-4 mb-6">
        {/* Monthly Comparison */}
        <div className="col-span-3 rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold">Comparativo Mensal</h3>
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Receitas vs Despesas — 2025</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'var(--primary)' }} /> Receitas</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: 'var(--danger)' }} /> Despesas</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={3}>
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Bar dataKey="income" fill="var(--primary)" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" fill="var(--danger)" radius={[3, 3, 0, 0]} opacity={0.8} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Categories */}
        <div className="col-span-2 rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Top Categorias</h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Despesas de Julho</p>
          </div>
          <div className="flex items-center justify-center">
            <PieChart width={140} height={140}>
              <Pie
                data={topCategoriesData}
                cx={65} cy={65}
                innerRadius={40} outerRadius={65}
                dataKey="value"
                onMouseEnter={(_, i) => setActiveSlice(i)}
                onMouseLeave={() => setActiveSlice(null)}
              >
                {topCategoriesData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} opacity={activeSlice === null || activeSlice === i ? 1 : 0.4} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<PieTooltip />} />
            </PieChart>
          </div>
          <div className="flex flex-col gap-1.5 mt-1">
            {topCategoriesData.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: d.color }} />
                  {d.name}
                </span>
                <span className="mono" style={{ color: 'var(--muted-foreground)' }}>{formatBRL(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-5 gap-4">
        {/* Patrimony Chart */}
        <div className="col-span-2 rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="mb-3">
            <h3 className="text-sm font-semibold">Evolução Patrimonial</h3>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Últimos 7 meses</p>
          </div>
          <div className="text-2xl font-bold mono mb-3" style={{ letterSpacing: '-0.04em', color: 'var(--primary)' }}>
            {formatBRL(nw)}
          </div>
          <ResponsiveContainer width="100%" height={120}>
            <AreaChart data={patrimonyData}>
              <defs>
                <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v: any) => formatBRL(Number(v))} contentStyle={{ background: '#111827', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="value" stroke="var(--primary)" strokeWidth={2} fill="url(#netGrad)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Goals Card */}
        <div className="col-span-1 rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold">Suas Metas</h3>
            <button onClick={() => onNavigate('goals')} style={{ color: 'var(--muted-foreground)' }} className="hover:opacity-70 transition-opacity">
              <ArrowRight size={14} />
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {mockGoals.slice(0, 3).map(g => {
              const pct = Math.min((g.current / g.target) * 100, 100)
              const r = 18, circ = 2 * Math.PI * r
              const offset = circ - (pct / 100) * circ
              return (
                <div key={g.id} className="flex items-center gap-3">
                  <div className="relative w-10 h-10 flex-shrink-0">
                    <svg className="progress-ring" width="40" height="40">
                      <circle cx="20" cy="20" r={r} fill="none" stroke="var(--border)" strokeWidth="3" />
                      <circle cx="20" cy="20" r={r} fill="none" stroke={g.color} strokeWidth="3" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
                    </svg>
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{Math.round(pct)}%</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{g.name}</p>
                    <p className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>{formatBRL(g.current)}</p>
                  </div>
                </div>
              )
            })}
          </div>
          <button
            onClick={() => onNavigate('goals')}
            className="mt-4 w-full text-xs py-2 rounded-lg transition-opacity hover:opacity-80 text-center"
            style={{ background: 'rgba(16,185,129,0.08)', color: 'var(--primary)', border: '1px solid rgba(16,185,129,0.2)' }}
          >
            Ver todas as metas
          </button>
        </div>

        {/* Recent Transactions */}
        <div className="col-span-2 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold">Últimas Transações</h3>
            <button onClick={() => onNavigate('transactions')} className="text-xs transition-opacity hover:opacity-70" style={{ color: 'var(--primary)' }}>
              Ver todas →
            </button>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--border)' }}>
            {mockTransactions.slice(0, 6).map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-5 py-3 group hover:bg-secondary/30 transition-colors">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0"
                  style={{
                    background: tx.type === 'income' ? 'rgba(16,185,129,0.12)' : tx.type === 'transfer' ? 'rgba(99,102,241,0.12)' : 'rgba(239,68,68,0.12)',
                  }}
                >
                  {tx.type === 'transfer' ? <ArrowLeftRight size={11} style={{ color: 'var(--accent)' }} /> : tx.type === 'income' ? <TrendingUp size={11} style={{ color: 'var(--primary)' }} /> : <TrendingDown size={11} style={{ color: 'var(--danger)' }} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{tx.desc}</p>
                  <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>
                    {tx.category} · {tx.date.slice(5).split('-').reverse().join('/')}
                  </p>
                </div>
                <span
                  className="text-xs font-semibold mono flex-shrink-0"
                  style={{ color: tx.type === 'income' ? 'var(--primary)' : tx.type === 'transfer' ? 'var(--muted-foreground)' : 'var(--danger)' }}
                >
                  {tx.type === 'income' ? '+' : ''}{formatBRL(Math.abs(tx.amount))}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Add FAB */}
      <div className="fixed bottom-8 right-8">
        {showQuickAdd && (
          <div className="mb-3 p-4 rounded-xl flex flex-col gap-3 shadow-2xl" style={{ background: 'var(--card)', border: '1px solid var(--border)', width: 280 }}>
            <p className="text-sm font-semibold">Lançamento Rápido</p>
            <input placeholder="Valor (ex: 45,90)" value={quickAmount} onChange={e => setQuickAmount(e.target.value)} className="w-full" />
            <input placeholder="Descrição" value={quickDesc} onChange={e => setQuickDesc(e.target.value)} className="w-full" />
            <button
              className="w-full py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)', color: '#fff' }}
              onClick={() => { setShowQuickAdd(false); setQuickAmount(''); setQuickDesc('') }}
            >
              Salvar despesa
            </button>
          </div>
        )}
        <button
          onClick={() => setShowQuickAdd(!showQuickAdd)}
          className="w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all hover:scale-105 active:scale-95"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <Plus size={20} />
        </button>
      </div>
    </div>
  )
}
