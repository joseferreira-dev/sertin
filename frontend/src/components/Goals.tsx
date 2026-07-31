import { useState } from 'react'
import { Plus, X, Target, ArrowUp, ArrowDown, LayoutGrid, Columns, Calendar } from 'lucide-react'
import { mockGoals as initialGoals, formatBRL } from '../data/mock'

const priorityColors: Record<string, string> = { low: '#3b82f6', medium: '#f59e0b', high: '#f97316', urgent: '#ef4444' }
const priorityLabels: Record<string, string> = { low: 'Baixa', medium: 'Média', high: 'Alta', urgent: 'Urgente' }
const typeLabels: Record<string, string> = { emergency: 'Fundo de Emergência', opportunity: 'Reserva de Oportunidade', travel: 'Viagem/Lazer', material: 'Bens Materiais', education: 'Educação', investment: 'Investimentos', free: 'Livre' }

export default function Goals() {
  const [goals, setGoals] = useState(initialGoals.map(g => ({ ...g, contributions: [
    { id: 1, date: '2025-06-01', value: g.current * 0.4, note: 'Aporte inicial' },
    { id: 2, date: '2025-07-01', value: g.current * 0.3, note: 'Aporte mensal' },
    { id: 3, date: '2025-07-15', value: g.current * 0.3, note: 'Receita extra' },
  ] })))
  const [view, setView] = useState<'grid' | 'kanban'>('grid')
  const [showModal, setShowModal] = useState(false)
  const [detailGoal, setDetailGoal] = useState<any | null>(null)
  const [detailTab, setDetailTab] = useState<'overview' | 'extract' | 'settings'>('overview')
  const [form, setForm] = useState({ name: '', type: 'free', target: '', color: '#10b981', priority: 'medium', description: '', targetDate: '' })
  const [showContrib, setShowContrib] = useState(false)
  const [contribVal, setContribVal] = useState('')
  const [contribNote, setContribNote] = useState('')

  const addGoal = () => {
    const id = Math.max(...goals.map(g => g.id)) + 1
    setGoals(prev => [...prev, { id, name: form.name, type: form.type, target: parseFloat(form.target) || 0, current: 0, color: form.color, icon: '🎯', priority: form.priority, status: 'active', targetDate: form.targetDate || null, description: form.description, accounts: [], contributions: [] }])
    setShowModal(false)
  }

  const addContrib = (goalId: number) => {
    const val = parseFloat(contribVal.replace(',', '.'))
    if (!val) return
    setGoals(prev => prev.map(g => g.id === goalId ? { ...g, current: g.current + val, contributions: [...g.contributions, { id: Date.now(), date: new Date().toISOString().slice(0, 10), value: val, note: contribNote || 'Aporte manual' }] } : g))
    setContribVal(''); setContribNote(''); setShowContrib(false)
    if (detailGoal?.id === goalId) setDetailGoal((prev: any) => ({ ...prev, current: prev.current + val }))
  }

  const ProgressRing = ({ goal }: { goal: any }) => {
    const pct = Math.min((goal.current / goal.target) * 100, 100)
    const r = 42, circ = 2 * Math.PI * r
    const offset = circ - (pct / 100) * circ
    return (
      <div className="relative" style={{ width: 100, height: 100 }}>
        <svg className="progress-ring" width="100" height="100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--secondary)" strokeWidth="7" />
          <circle cx="50" cy="50" r={r} fill="none" stroke={goal.color} strokeWidth="7" strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold mono" style={{ letterSpacing: '-0.04em' }}>{Math.round(pct)}%</span>
        </div>
      </div>
    )
  }

  const daysRemaining = (target: string | null) => {
    if (!target) return null
    const diff = Math.ceil((new Date(target).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    return diff
  }

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>Metas Financeiras</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{goals.length} metas ativas · {formatBRL(goals.reduce((s, g) => s + g.current, 0))} acumulados</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {[['grid', LayoutGrid], ['kanban', Columns]].map(([v, Icon]: any) => (
              <button key={v} onClick={() => setView(v)} className="px-2.5 py-1.5 transition-colors" style={{ background: view === v ? 'var(--primary)' : 'var(--card)', color: view === v ? '#fff' : 'var(--muted-foreground)' }}>
                <Icon size={14} />
              </button>
            ))}
          </div>
          <button onClick={() => setShowModal(true)} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', color: '#fff' }}>
            <Plus size={14} /> Nova meta
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {goals.map(goal => {
          const days = daysRemaining(goal.targetDate)
          const pct = Math.min((goal.current / goal.target) * 100, 100)
          return (
            <div
              key={goal.id}
              className="rounded-xl p-5 cursor-pointer group transition-all hover:translate-y-[-1px]"
              style={{ background: 'var(--card)', border: '1px solid var(--border)', boxShadow: '0 0 0 0px var(--primary)' }}
              onClick={() => { setDetailGoal(goal); setDetailTab('overview') }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{goal.icon}</span>
                    <span className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: priorityColors[goal.priority] + '22', color: priorityColors[goal.priority] }}>
                      {priorityLabels[goal.priority]}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold">{goal.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{typeLabels[goal.type]}</p>
                </div>
                <ProgressRing goal={goal} />
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--muted-foreground)' }}>Acumulado</span>
                  <span className="mono font-semibold" style={{ color: goal.color }}>{formatBRL(goal.current)}</span>
                </div>
                <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: goal.color }} />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span style={{ color: 'var(--muted-foreground)' }}>Faltam: <span className="font-medium" style={{ color: 'var(--foreground)' }}>{formatBRL(goal.target - goal.current)}</span></span>
                  <span style={{ color: 'var(--muted-foreground)' }}>Meta: {formatBRL(goal.target)}</span>
                </div>
              </div>

              {goal.targetDate && (
                <div className="flex items-center gap-1.5 text-xs" style={{ color: days && days < 30 ? 'var(--warning)' : 'var(--muted-foreground)' }}>
                  <Calendar size={11} />
                  {days !== null && days > 0 ? `${days} dias restantes` : days === 0 ? 'Vence hoje' : 'Vencida'}
                  {goal.targetDate && ` · ${goal.targetDate.slice(0, 7).split('-').reverse().join('/')}`}
                </div>
              )}

              <button
                className="mt-3 w-full py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ background: goal.color + '22', color: goal.color, border: `1px solid ${goal.color}44` }}
                onClick={e => { e.stopPropagation(); setDetailGoal(goal); setShowContrib(true) }}
              >
                + Adicionar aporte
              </button>
            </div>
          )
        })}
      </div>

      {/* New Goal Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,9,13,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-semibold text-sm">Nova meta</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--muted-foreground)' }}><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex flex-col gap-1"><label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Nome *</label><input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Viagem para Europa" className="w-full" /></div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1"><label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Valor total (R$)</label><input type="number" value={form.target} onChange={e => setForm(p => ({ ...p, target: e.target.value }))} placeholder="0,00" className="w-full" /></div>
                <div className="flex flex-col gap-1"><label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Data alvo</label><input type="date" value={form.targetDate} onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))} className="w-full" /></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Tipo</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full">
                    {Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Prioridade</label>
                  <select value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))} className="w-full">
                    {Object.entries(priorityLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1"><label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Descrição</label><textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} className="w-full resize-none" /></div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
              <button onClick={addGoal} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>Criar meta</button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,9,13,0.85)', backdropFilter: 'blur(6px)' }}>
          <div className="w-full max-w-2xl rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)', maxHeight: '85vh', display: 'flex', flexDirection: 'column' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
              <div className="flex items-center gap-2">
                <span className="text-xl">{detailGoal.icon}</span>
                <div>
                  <h2 className="font-semibold">{detailGoal.name}</h2>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{typeLabels[detailGoal.type]}</p>
                </div>
              </div>
              <button onClick={() => { setDetailGoal(null); setShowContrib(false) }} style={{ color: 'var(--muted-foreground)' }}><X size={18} /></button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 px-6 pt-4 flex-shrink-0">
              {[['overview', 'Visão Geral'], ['extract', 'Extrato da Meta'], ['settings', 'Ajustes']].map(([t, l]) => (
                <button key={t} onClick={() => setDetailTab(t as any)}
                  className="text-sm pb-2 border-b-2 transition-colors"
                  style={{ borderColor: detailTab === t ? 'var(--primary)' : 'transparent', color: detailTab === t ? 'var(--primary)' : 'var(--muted-foreground)' }}>
                  {l}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === 'overview' && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-6">
                    <ProgressRing goal={detailGoal} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Acumulado</p>
                          <p className="text-2xl font-bold mono" style={{ color: detailGoal.color, letterSpacing: '-0.04em' }}>{formatBRL(detailGoal.current)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>Meta total</p>
                          <p className="text-2xl font-bold mono" style={{ letterSpacing: '-0.04em' }}>{formatBRL(detailGoal.target)}</p>
                        </div>
                      </div>
                      <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                        <div className="h-full rounded-full" style={{ width: `${Math.min((detailGoal.current / detailGoal.target) * 100, 100)}%`, background: detailGoal.color }} />
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                        Faltam <strong style={{ color: 'var(--foreground)' }}>{formatBRL(detailGoal.target - detailGoal.current)}</strong> para concluir
                      </p>
                    </div>
                  </div>

                  {/* Projection */}
                  <div className="p-4 rounded-xl" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                    <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Projeção</p>
                    <p className="text-sm">Com o ritmo atual de aportes, você conclui esta meta em <strong style={{ color: detailGoal.color }}>Nov/2025</strong></p>
                    <p className="text-xs mt-1" style={{ color: 'var(--muted-foreground)' }}>Aporte médio mensal: <span className="mono">{formatBRL(detailGoal.current / 3)}</span> · Sugerido: <span className="mono">{formatBRL((detailGoal.target - detailGoal.current) / 5)}</span></p>
                  </div>

                  {showContrib ? (
                    <div className="p-4 rounded-xl flex flex-col gap-3" style={{ background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.2)' }}>
                      <p className="text-sm font-semibold">Registrar aporte</p>
                      <input type="number" placeholder="Valor (ex: 500,00)" value={contribVal} onChange={e => setContribVal(e.target.value)} className="w-full" />
                      <input placeholder="Observação (opcional)" value={contribNote} onChange={e => setContribNote(e.target.value)} className="w-full" />
                      <div className="flex gap-2">
                        <button onClick={() => addContrib(detailGoal.id)} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>Registrar aporte</button>
                        <button onClick={() => setShowContrib(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setShowContrib(true)} className="w-full py-2.5 rounded-xl text-sm font-medium" style={{ background: 'rgba(16,185,129,0.1)', color: 'var(--primary)', border: '1px solid rgba(16,185,129,0.25)' }}>
                      + Novo aporte
                    </button>
                  )}
                </div>
              )}

              {detailTab === 'extract' && (
                <div>
                  <div className="flex flex-col gap-2">
                    {[...detailGoal.contributions].reverse().map((c: any) => (
                      <div key={c.id} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                        <div>
                          <p className="text-sm font-medium">{c.note}</p>
                          <p className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>{c.date.split('-').reverse().join('/')}</p>
                        </div>
                        <p className="text-sm font-semibold mono" style={{ color: 'var(--primary)' }}>+{formatBRL(c.value)}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {detailTab === 'settings' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1"><label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Nome</label><input defaultValue={detailGoal.name} className="w-full" /></div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1"><label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Valor total</label><input type="number" defaultValue={detailGoal.target} className="w-full" /></div>
                    <div className="flex flex-col gap-1"><label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Data alvo</label><input type="date" defaultValue={detailGoal.targetDate || ''} className="w-full" /></div>
                  </div>
                  <div className="flex flex-col gap-1"><label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Rendimento anual (%)</label><input type="number" placeholder="Ex: 13 (100% CDI)" className="w-full" /></div>
                  <button className="w-full py-2.5 rounded-lg text-sm font-medium mt-2" style={{ background: 'var(--primary)', color: '#fff' }}>Salvar ajustes</button>
                  <button className="w-full py-2 text-sm" style={{ color: 'var(--danger)' }}>Arquivar meta</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
