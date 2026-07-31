import { useState } from 'react'
import { Plus, X, Pencil, EyeOff, CreditCard, Wallet, Building2, PiggyBank, Banknote } from 'lucide-react'
import { mockAccounts as initialAccounts, formatBRL, netWorth } from '../data/mock'

const iconMap: Record<string, any> = { CreditCard, Wallet, Building2, PiggyBank, Banknote }

const typeLabel: Record<string, string> = {
  checking: 'Conta Corrente', savings: 'Poupança', cash: 'Dinheiro Físico',
  credit: 'Cartão de Crédito', digital: 'Carteira Digital',
}

export default function Accounts() {
  const [accounts, setAccounts] = useState(initialAccounts as any[])
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', type: 'checking', balance: '', color: '#10b981', institution: '', limit: '', closing: '', due: '' })
  const [confirmHide, setConfirmHide] = useState<number | null>(null)

  const nw = accounts.filter(a => a.balance > 0).reduce((s: number, a: any) => s + a.balance, 0) -
    accounts.filter(a => a.balance < 0).reduce((s: number, a: any) => s + Math.abs(a.balance), 0)

  const openNew = () => {
    setForm({ name: '', type: 'checking', balance: '', color: '#10b981', institution: '', limit: '', closing: '', due: '' })
    setEditId(null); setShowModal(true)
  }

  const openEdit = (acc: any) => {
    setForm({ name: acc.name, type: acc.type, balance: String(acc.balance), color: acc.color, institution: acc.institution, limit: acc.limit || '', closing: acc.closing || '', due: acc.due || '' })
    setEditId(acc.id); setShowModal(true)
  }

  const save = () => {
    if (editId) {
      setAccounts(prev => prev.map(a => a.id === editId ? { ...a, name: form.name, color: form.color, institution: form.institution, limit: parseFloat(form.limit) || undefined, closing: parseInt(form.closing) || undefined, due: parseInt(form.due) || undefined } : a))
    } else {
      const id = Math.max(...accounts.map((a: any) => a.id)) + 1
      setAccounts(prev => [...prev, {
        id, name: form.name, type: form.type,
        balance: parseFloat(form.balance.replace(',', '.')) || 0,
        color: form.color, institution: form.institution,
        icon: form.type === 'credit' ? 'CreditCard' : form.type === 'cash' ? 'Banknote' : form.type === 'savings' ? 'PiggyBank' : 'Wallet',
        limit: parseFloat(form.limit) || undefined, closing: parseInt(form.closing) || undefined, due: parseInt(form.due) || undefined,
      }])
    }
    setShowModal(false)
  }

  const balanceClass = (b: number) => b >= 0 ? 'var(--primary)' : 'var(--danger)'

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header + Net Worth */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>Contas</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{accounts.length} conta(s) cadastrada(s)</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', color: '#fff' }}>
          <Plus size={14} /> Nova conta
        </button>
      </div>

      {/* Net Worth Banner */}
      <div className="rounded-xl p-5 mb-6 flex items-center justify-between" style={{ background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.08) 100%)', border: '1px solid rgba(16,185,129,0.2)' }}>
        <div>
          <p className="text-xs font-semibold mb-1" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Patrimônio Líquido</p>
          <p className="text-3xl font-bold mono" style={{ color: 'var(--primary)', letterSpacing: '-0.05em' }}>{formatBRL(nw)}</p>
        </div>
        <div className="flex gap-8 text-right">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Ativos</p>
            <p className="text-base font-semibold mono" style={{ color: 'var(--primary)' }}>{formatBRL(accounts.filter((a: any) => a.balance > 0).reduce((s: number, a: any) => s + a.balance, 0))}</p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Total Passivos</p>
            <p className="text-base font-semibold mono" style={{ color: 'var(--danger)' }}>{formatBRL(accounts.filter((a: any) => a.balance < 0).reduce((s: number, a: any) => s + Math.abs(a.balance), 0))}</p>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {accounts.map((acc: any) => {
          const Icon = iconMap[acc.icon] || Wallet
          const isCredit = acc.type === 'credit'
          const usedPct = isCredit ? (Math.abs(acc.balance) / (acc.limit || 1)) * 100 : 0
          return (
            <div key={acc.id} className="rounded-xl p-5 relative overflow-hidden group" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              {/* Color bar */}
              <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl" style={{ background: acc.color }} />

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: acc.color + '22' }}>
                    <Icon size={17} style={{ color: acc.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{acc.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{typeLabel[acc.type] || acc.type}</p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(acc)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
                    <Pencil size={12} />
                  </button>
                  <button onClick={() => setConfirmHide(acc.id)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--danger)' }}>
                    <EyeOff size={12} />
                  </button>
                </div>
              </div>

              {acc.institution && (
                <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>{acc.institution}</p>
              )}

              <div className="mb-1">
                <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>{isCredit ? 'Fatura atual' : 'Saldo'}</p>
                <p className="text-xl font-bold mono" style={{ color: balanceClass(acc.balance), letterSpacing: '-0.04em' }}>
                  {acc.balance < 0 ? '' : ''}{formatBRL(Math.abs(acc.balance))}
                </p>
              </div>

              {isCredit && acc.limit && (
                <>
                  <div className="flex justify-between text-xs mb-1.5 mt-3" style={{ color: 'var(--muted-foreground)' }}>
                    <span>Limite disponível: <span className="font-medium" style={{ color: 'var(--foreground)' }}>{formatBRL(acc.limit - Math.abs(acc.balance))}</span></span>
                    <span>{Math.round(usedPct)}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--secondary)' }}>
                    <div className="h-full rounded-full" style={{ width: `${usedPct}%`, background: usedPct > 85 ? 'var(--danger)' : usedPct > 60 ? 'var(--warning)' : acc.color }} />
                  </div>
                  <div className="flex justify-between text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                    <span>Fechamento: dia {acc.closing}</span>
                    <span>Vencimento: dia {acc.due}</span>
                  </div>
                </>
              )}
            </div>
          )
        })}

        {/* Add card */}
        <button onClick={openNew} className="rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80" style={{ border: '2px dashed var(--border)', minHeight: 140 }}>
          <Plus size={20} style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Adicionar conta</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,9,13,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-md rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-semibold">{editId ? 'Editar conta' : 'Nova conta'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--muted-foreground)' }}><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Nome *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Nubank" className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Tipo *</label>
                  <select value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))} className="w-full" disabled={!!editId}>
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="cash">Dinheiro Físico</option>
                    <option value="credit">Cartão de Crédito</option>
                    <option value="digital">Carteira Digital</option>
                  </select>
                  {editId && <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Tipo não pode ser alterado</p>}
                </div>
                {!editId && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Saldo inicial</label>
                    <input type="number" value={form.balance} onChange={e => setForm(p => ({ ...p, balance: e.target.value }))} placeholder="0,00" className="w-full" />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Instituição</label>
                  <input value={form.institution} onChange={e => setForm(p => ({ ...p, institution: e.target.value }))} placeholder="Ex: Nubank" className="w-full" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Cor</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color} onChange={e => setForm(p => ({ ...p, color: e.target.value }))} className="h-9 w-16 rounded cursor-pointer" style={{ padding: 2 }} />
                    <span className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>{form.color}</span>
                  </div>
                </div>
              </div>

              {form.type === 'credit' && (
                <div className="p-4 rounded-lg flex flex-col gap-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configurações do cartão</p>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Limite total</label>
                      <input type="number" value={form.limit} onChange={e => setForm(p => ({ ...p, limit: e.target.value }))} placeholder="5000" className="w-full" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Fechamento</label>
                      <input type="number" min={1} max={31} value={form.closing} onChange={e => setForm(p => ({ ...p, closing: e.target.value }))} placeholder="dia" className="w-full" />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Vencimento</label>
                      <input type="number" min={1} max={31} value={form.due} onChange={e => setForm(p => ({ ...p, due: e.target.value }))} placeholder="dia" className="w-full" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg text-sm" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>
                {editId ? 'Salvar' : 'Criar conta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm hide */}
      {confirmHide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,9,13,0.8)' }}>
          <div className="w-80 rounded-xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold mb-2">Ocultar conta</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
              A conta será ocultada das listagens, mas o histórico de transações será mantido para relatórios futuros.
            </p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmHide(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
              <button onClick={() => { setAccounts(p => p.filter(a => a.id !== confirmHide)); setConfirmHide(null) }} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--danger)' }}>Ocultar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
