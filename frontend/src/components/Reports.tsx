import { useState } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line,
} from 'recharts'
import { Download, FileText, TrendingUp, TrendingDown } from 'lucide-react'
import { monthlyData, topCategoriesData, patrimonyData, formatBRL } from '../data/mock'

const catSpendData = [
  { category: 'Moradia', budget: 2800, spent: 2987, pct: 107 },
  { category: 'Alimentação', budget: 800, spent: 650, pct: 81 },
  { category: 'Saúde', budget: 600, spent: 745, pct: 124 },
  { category: 'Transporte', budget: 400, spent: 379, pct: 95 },
  { category: 'Lazer', budget: 300, spent: 422, pct: 141 },
  { category: 'Educação', budget: 200, spent: 150, pct: 75 },
]

export default function Reports() {
  const [activeReport, setActiveReport] = useState<'categories' | 'dre' | 'cashflow'>('categories')
  const [period, setPeriod] = useState('2025-07')

  const totalIncome = 10300
  const totalExpenses = 5100 + 2987 + 650 + 745 + 379 + 422 + 150

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload?.length) return (
      <div className="p-3 rounded-lg text-xs" style={{ background: '#111827', border: '1px solid var(--border)' }}>
        <p className="font-semibold mb-1">{label}</p>
        {payload.map((p: any) => <p key={p.name} style={{ color: p.color }}>{p.name}: {formatBRL(p.value)}</p>)}
      </div>
    )
    return null
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>Relatórios</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Análise financeira detalhada</p>
        </div>
        <div className="flex items-center gap-3">
          <input type="month" value={period} onChange={e => setPeriod(e.target.value)} className="text-sm" />
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-80" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--secondary-foreground)' }}>
            <Download size={13} /> Exportar PDF
          </button>
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-80" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--secondary-foreground)' }}>
            <Download size={13} /> Exportar CSV
          </button>
        </div>
      </div>

      {/* Report tabs */}
      <div className="flex gap-2 mb-6">
        {[
          ['categories', 'Despesas por Categoria', '📊'],
          ['dre', 'DRE — Fluxo de Caixa', '📋'],
          ['cashflow', 'Projeção de Gastos', '📈'],
        ].map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setActiveReport(id as any)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all"
            style={{
              background: activeReport === id ? 'var(--primary)' : 'var(--card)',
              color: activeReport === id ? '#fff' : 'var(--secondary-foreground)',
              border: `1px solid ${activeReport === id ? 'var(--primary)' : 'var(--border)'}`,
            }}
          >
            {icon} {label}
          </button>
        ))}
      </div>

      {/* Categories Report */}
      {activeReport === 'categories' && (
        <div className="grid grid-cols-5 gap-4">
          {/* Bar chart */}
          <div className="col-span-3 rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-4">Gasto vs. Orçamento por Categoria</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={catSpendData} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: 'var(--foreground)' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                <Bar dataKey="budget" name="Orçado" fill="var(--border)" radius={[0, 3, 3, 0]} />
                <Bar dataKey="spent" name="Gasto" radius={[0, 3, 3, 0]}>
                  {catSpendData.map((entry, i) => (
                    <Cell key={i} fill={entry.pct > 100 ? 'var(--danger)' : entry.pct > 85 ? 'var(--warning)' : 'var(--primary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Pie + table */}
          <div className="col-span-2 flex flex-col gap-4">
            <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <h3 className="text-sm font-semibold mb-3">Distribuição</h3>
              <div className="flex justify-center">
                <PieChart width={150} height={150}>
                  <Pie data={topCategoriesData} cx={70} cy={70} innerRadius={40} outerRadius={68} dataKey="value">
                    {topCategoriesData.map((e, i) => <Cell key={i} fill={e.color} strokeWidth={0} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => formatBRL(Number(v))} contentStyle={{ background: '#111827', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </div>
              <div className="flex flex-col gap-1.5 mt-1">
                {topCategoriesData.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full" style={{ background: d.color }} />{d.name}</span>
                    <span className="mono" style={{ color: 'var(--muted-foreground)' }}>{formatBRL(d.value)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Table */}
            <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <table className="w-full">
                <thead><tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="text-left px-3 py-2.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>Categoria</th>
                  <th className="text-right px-3 py-2.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>%</th>
                  <th className="text-right px-3 py-2.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>Total</th>
                </tr></thead>
                <tbody>
                  {catSpendData.map(c => (
                    <tr key={c.category} className="border-t" style={{ borderColor: 'var(--border)' }}>
                      <td className="px-3 py-2 text-xs">{c.category}</td>
                      <td className="px-3 py-2 text-xs text-right mono" style={{ color: c.pct > 100 ? 'var(--danger)' : 'var(--muted-foreground)' }}>{c.pct}%</td>
                      <td className="px-3 py-2 text-xs text-right mono">{formatBRL(c.spent)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* DRE */}
      {activeReport === 'dre' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'var(--border)' }}>
            <h3 className="text-sm font-semibold">Demonstrativo de Resultado (DRE) — Julho 2025</h3>
            <span className="text-xs px-2 py-1 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--primary)' }}>Resultado positivo</span>
          </div>
          <div className="p-6">
            {/* Revenues */}
            <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Receitas</p>
            {[
              { label: 'Salário — Empresa ABC', value: 7500 },
              { label: 'Freelance — Projeto Loja', value: 2800 },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between py-2 border-b text-sm" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--secondary-foreground)' }}>{label}</span>
                <span className="mono" style={{ color: 'var(--primary)' }}>+ {formatBRL(value)}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 text-sm font-bold">
              <span>Total Receitas</span>
              <span className="mono" style={{ color: 'var(--primary)' }}>+ {formatBRL(totalIncome)}</span>
            </div>

            <div className="my-4 border-t" style={{ borderColor: 'var(--border)' }} />

            <p className="text-xs font-bold mb-3" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Despesas</p>
            {catSpendData.map(({ category, spent }) => (
              <div key={category} className="flex justify-between py-2 border-b text-sm" style={{ borderColor: 'var(--border)' }}>
                <span style={{ color: 'var(--secondary-foreground)' }}>{category}</span>
                <span className="mono" style={{ color: 'var(--danger)' }}>- {formatBRL(spent)}</span>
              </div>
            ))}
            <div className="flex justify-between py-3 text-sm font-bold">
              <span>Total Despesas</span>
              <span className="mono" style={{ color: 'var(--danger)' }}>- {formatBRL(catSpendData.reduce((s, c) => s + c.spent, 0))}</span>
            </div>

            <div className="mt-4 p-4 rounded-xl" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <div className="flex justify-between items-center">
                <span className="font-bold text-base">Resultado do Período</span>
                <span className="text-2xl font-bold mono" style={{ color: 'var(--primary)', letterSpacing: '-0.04em' }}>
                  + {formatBRL(totalIncome - catSpendData.reduce((s, c) => s + c.spent, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Projection */}
      {activeReport === 'cashflow' && (
        <div className="grid grid-cols-3 gap-4">
          <div className="col-span-2 rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="text-sm font-semibold mb-4">Evolução e Projeção — 2025</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={[...monthlyData, { month: 'Ago*', income: 9000, expenses: 6800 }, { month: 'Set*', income: 9000, expenses: 6800 }]}>
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} tickFormatter={v => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="income" name="Receitas" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)', r: 3 }} />
                <Line type="monotone" dataKey="expenses" name="Despesas" stroke="var(--danger)" strokeWidth={2} dot={{ fill: 'var(--danger)', r: 3 }} strokeDasharray="4 2" />
              </LineChart>
            </ResponsiveContainer>
            <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>* Dados projetados com base na média dos últimos 3 meses</p>
          </div>
          <div className="col-span-1 flex flex-col gap-4">
            <div className="rounded-xl p-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Projeção julho</p>
              <p className="text-sm mb-3" style={{ color: 'var(--muted-foreground)' }}>Com base na média diária de gastos:</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-sm">
                  <span>Gasto até hoje</span>
                  <span className="mono" style={{ color: 'var(--danger)' }}>{formatBRL(5100)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Projeção final</span>
                  <span className="mono font-bold" style={{ color: 'var(--warning)' }}>{formatBRL(7350)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Média diária</span>
                  <span className="mono">{formatBRL(5100 / 28)}/dia</span>
                </div>
              </div>
            </div>
            <div className="rounded-xl p-5" style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.2)' }}>
              <p className="text-xs font-semibold mb-2" style={{ color: 'var(--primary)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Economia projetada</p>
              <p className="text-2xl font-bold mono" style={{ color: 'var(--primary)', letterSpacing: '-0.04em' }}>
                {formatBRL(totalIncome - 7350)}
              </p>
              <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Se mantiver o ritmo atual</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
