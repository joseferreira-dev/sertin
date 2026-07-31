import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, X, AlertTriangle } from 'lucide-react'
import { mockBudgets as initialBudgets, mockCategories, formatBRL } from '../data/mock'

const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export default function Budgets() {
  const [budgets, setBudgets] = useState(initialBudgets.map(b => ({ ...b })))
  const [monthIdx, setMonthIdx] = useState(6) // July
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ categoryId: 1, budgeted: '', period: 'monthly' })

  const totalBudgeted = budgets.reduce((s, b) => s + b.budgeted, 0)
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0)

  const progressColor = (pct: number) => {
    if (pct >= 100) return 'var(--danger)'
    if (pct >= 85) return 'var(--warning)'
    return 'var(--primary)'
  }

  const save = () => {
    const cat = mockCategories.find(c => c.id === parseInt(String(form.categoryId)))
    if (!cat) return
    const id = Math.max(...budgets.map(b => b.id)) + 1
    setBudgets(prev => [...prev, {
      id, category: cat.name, categoryId: cat.id,
      budgeted: parseFloat(form.budgeted.replace(',', '.')) || 0,
      spent: 0, color: cat.color,
      month: `2025-${String(monthIdx + 1).padStart(2, '0')}`,
    }])
    setShowModal(false)
    setForm({ categoryId: 1, budgeted: '', period: 'monthly' })
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>Orçamentos</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Controle de gastos por categoria</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Month nav */}
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <button onClick={() => setMonthIdx(p => Math.max(0, p - 1))} style={{ color: 'var(--muted-foreground)' }} className="hover:opacity-70 transition-opacity">
              <ChevronLeft size={14} />
            </button>
            <span className="text-sm font-medium" style={{ minWidth: 60, textAlign: 'center' }}>{months[monthIdx]} 2025</span>
            <button onClick={() => setMonthIdx(p => Math.min(11, p + 1))} style={{ color: 'var(--muted-foreground)' }} className="hover:opacity-70 transition-opacity">
              <ChevronRight size={14} />
            </button>
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', color: '#fff' }}>
            <Plus size={14} /> Definir orçamento
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total orçado', value: formatBRL(totalBudgeted), color: 'var(--foreground)' },
          { label: 'Total gasto', value: formatBRL(totalSpent), color: totalSpent > totalBudgeted ? 'var(--danger)' : 'var(--warning)' },
          { label: 'Disponível', value: formatBRL(Math.max(0, totalBudgeted - totalSpent)), color: 'var(--primary)' },
        ].map(({ label, value, color }) => (
          <div key={label} className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
            <p className="text-xl font-bold mono" style={{ color, letterSpacing: '-0.04em' }}>{value}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div className="p-5 rounded-xl mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progresso geral do mês</span>
          <span className="mono" style={{ color: progressColor((totalSpent / totalBudgeted) * 100) }}>
            {((totalSpent / totalBudgeted) * 100).toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${Math.min((totalSpent / totalBudgeted) * 100, 100)}%`, background: progressColor((totalSpent / totalBudgeted) * 100) }} />
        </div>
        <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
          <span>{formatBRL(totalSpent)} gasto</span>
          <span>{formatBRL(totalBudgeted)} orçado</span>
        </div>
      </div>

      {/* Budget cards */}
      <div className="flex flex-col gap-3">
        {budgets.map(b => {
          const pct = (b.spent / b.budgeted) * 100
          const color = progressColor(pct)
          const overBudget = pct >= 100
          return (
            <div key={b.id} className="rounded-xl p-5" style={{ background: 'var(--card)', border: `1px solid ${overBudget ? 'rgba(239,68,68,0.3)' : 'var(--border)'}` }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: b.color }} />
                  <span className="text-sm font-semibold">{b.category}</span>
                  {overBudget && (
                    <span className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}>
                      <AlertTriangle size={10} /> Estouro
                    </span>
                  )}
                  {pct >= 85 && pct < 100 && (
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}>
                      Atenção
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Gasto</p>
                    <p className="text-sm font-bold mono" style={{ color }}>{formatBRL(b.spent)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Orçado</p>
                    <p className="text-sm font-bold mono">{formatBRL(b.budgeted)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Disponível</p>
                    <p className="text-sm font-bold mono" style={{ color: b.budgeted - b.spent < 0 ? 'var(--danger)' : 'var(--primary)' }}>
                      {formatBRL(Math.abs(b.budgeted - b.spent))}
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, background: color }} />
              </div>
              <div className="flex justify-between text-xs mt-1.5" style={{ color: 'var(--muted-foreground)' }}>
                <span>{pct.toFixed(0)}% comprometido</span>
                {overBudget && <span style={{ color: 'var(--danger)' }}>+{formatBRL(b.spent - b.budgeted)} acima do limite</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,9,13,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-96 rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-semibold text-sm">Definir orçamento — {months[monthIdx]}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--muted-foreground)' }}><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Categoria (apenas Despesas)</label>
                <select value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: parseInt(e.target.value) }))} className="w-full">
                  {mockCategories.filter(c => c.type === 'expense').map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Valor limite (R$)</label>
                <input type="number" placeholder="0,00" value={form.budgeted} onChange={e => setForm(p => ({ ...p, budgeted: e.target.value }))} className="w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Período</label>
                <select value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))} className="w-full">
                  <option value="monthly">Mensal</option>
                  <option value="yearly">Anual (divide automaticamente por 12)</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>Definir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
