import { useState } from 'react'
import { Filter, Plus, X, ChevronDown, Pencil, Trash2, ArrowLeftRight, TrendingUp, TrendingDown, SlidersHorizontal, Search } from 'lucide-react'
import { mockTransactions, mockAccounts, mockCategories, mockTags, formatBRL } from '../data/mock'

interface Transaction {
  id: number; date: string; desc: string; category: string; categoryId: number | null;
  account: string; accountId: number; amount: number; type: string; status: string;
  tags: { id: number; name: string; color: string }[]; installment?: string;
}

const emptyTx: Partial<Transaction> = {
  type: 'expense', date: new Date().toISOString().slice(0, 10),
  desc: '', amount: 0, accountId: 1, categoryId: 1, status: 'confirmed', tags: [],
}

export default function Transactions() {
  const [txs, setTxs] = useState<Transaction[]>(mockTransactions as Transaction[])
  const [showModal, setShowModal] = useState(false)
  const [editTx, setEditTx] = useState<Partial<Transaction>>(emptyTx)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [filterOpen, setFilterOpen] = useState(true)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('all')
  const [filterAccount, setFilterAccount] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const [installments, setInstallments] = useState(1)

  const filtered = txs.filter(tx => {
    if (search && !tx.desc.toLowerCase().includes(search.toLowerCase()) && !tx.category.toLowerCase().includes(search.toLowerCase())) return false
    if (filterType !== 'all' && tx.type !== filterType) return false
    if (filterAccount && String(tx.accountId) !== filterAccount) return false
    if (filterStatus && tx.status !== filterStatus) return false
    return true
  })

  const totalIncome = filtered.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0)
  const totalExpenses = filtered.filter(t => t.type === 'expense').reduce((s, t) => s + Math.abs(t.amount), 0)

  const openNew = () => { setEditTx({ ...emptyTx }); setEditingId(null); setShowModal(true) }
  const openEdit = (tx: Transaction) => { setEditTx({ ...tx }); setEditingId(tx.id); setShowModal(true) }

  const save = () => {
    if (editingId) {
      setTxs(prev => prev.map(t => t.id === editingId ? { ...t, ...editTx } as Transaction : t))
    } else {
      const newId = Math.max(...txs.map(t => t.id)) + 1
      setTxs(prev => [{ ...editTx, id: newId } as Transaction, ...prev])
    }
    setShowModal(false)
  }

  const del = (id: number) => { setTxs(prev => prev.filter(t => t.id !== id)); setConfirmDelete(null) }

  const statusColor = (s: string) => s === 'confirmed' ? 'var(--primary)' : s === 'pending' ? 'var(--warning)' : 'var(--muted-foreground)'
  const statusLabel = (s: string) => s === 'confirmed' ? 'Confirmada' : s === 'pending' ? 'Pendente' : 'Cancelada'

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>Extrato</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{filtered.length} transação(ões) encontrada(s)</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-80"
            style={{ background: filterOpen ? 'rgba(16,185,129,0.1)' : 'var(--card)', border: '1px solid var(--border)', color: filterOpen ? 'var(--primary)' : 'var(--secondary-foreground)' }}
          >
            <SlidersHorizontal size={13} /> Filtros
          </button>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <Plus size={14} /> Nova transação
          </button>
        </div>
      </div>

      <div className="flex gap-4">
        {/* Filter Panel */}
        {filterOpen && (
          <div className="w-56 flex-shrink-0 flex flex-col gap-3">
            <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Filtros</p>

              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
                  <input className="w-full text-xs pl-7 py-2" placeholder="Buscar..." value={search} onChange={e => setSearch(e.target.value)} />
                </div>

                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Tipo</label>
                  <select className="w-full text-xs py-1.5" value={filterType} onChange={e => setFilterType(e.target.value)}>
                    <option value="all">Todos</option>
                    <option value="income">Receitas</option>
                    <option value="expense">Despesas</option>
                    <option value="transfer">Transferências</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Conta</label>
                  <select className="w-full text-xs py-1.5" value={filterAccount} onChange={e => setFilterAccount(e.target.value)}>
                    <option value="">Todas</option>
                    {mockAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>

                <div>
                  <label className="text-xs mb-1 block" style={{ color: 'var(--muted-foreground)' }}>Status</label>
                  <select className="w-full text-xs py-1.5" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
                    <option value="">Todos</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>

                <button
                  onClick={() => { setSearch(''); setFilterType('all'); setFilterAccount(''); setFilterStatus('') }}
                  className="text-xs py-1.5 rounded-lg transition-opacity hover:opacity-70"
                  style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                >
                  Limpar filtros
                </button>
              </div>
            </div>

            {/* Summary */}
            <div className="rounded-xl p-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p className="text-xs font-semibold mb-3" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Resumo</p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted-foreground)' }}>Receitas</span>
                  <span className="mono font-semibold" style={{ color: 'var(--primary)' }}>+{formatBRL(totalIncome)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted-foreground)' }}>Despesas</span>
                  <span className="mono font-semibold" style={{ color: 'var(--danger)' }}>-{formatBRL(totalExpenses)}</span>
                </div>
                <div className="pt-2 border-t flex justify-between text-xs font-semibold" style={{ borderColor: 'var(--border)' }}>
                  <span>Saldo</span>
                  <span className="mono" style={{ color: totalIncome - totalExpenses >= 0 ? 'var(--primary)' : 'var(--danger)' }}>
                    {formatBRL(totalIncome - totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {['Data', 'Descrição', 'Categoria', 'Conta', 'Status', 'Valor', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map(tx => (
                <tr key={tx.id} className="group border-b transition-colors hover:bg-secondary/20" style={{ borderColor: 'var(--border)' }}>
                  <td className="px-4 py-3 text-xs mono whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>
                    {tx.date.slice(8)}/{tx.date.slice(5, 7)}
                  </td>
                  <td className="px-4 py-3 max-w-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium truncate block">
                        {tx.desc}
                        {tx.installment && <span className="ml-1 text-xs px-1 rounded" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>{tx.installment}</span>}
                      </span>
                      {tx.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {tx.tags.map(tag => (
                            <span key={tag.id} className="text-xs px-1.5 py-0.5 rounded-full" style={{ background: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}44` }}>
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="truncate block max-w-28">{tx.category}</span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="truncate block max-w-28">{tx.account}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: statusColor(tx.status) + '22', color: statusColor(tx.status) }}>
                      {statusLabel(tx.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-xs font-semibold mono" style={{
                      color: tx.type === 'income' ? 'var(--primary)' : tx.type === 'transfer' ? 'var(--muted-foreground)' : 'var(--danger)',
                    }}>
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}{formatBRL(Math.abs(tx.amount))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(tx)} className="w-6 h-6 rounded flex items-center justify-center transition-opacity hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                        <Pencil size={12} />
                      </button>
                      <button onClick={() => setConfirmDelete(tx.id)} className="w-6 h-6 rounded flex items-center justify-center transition-opacity hover:opacity-70" style={{ color: 'var(--danger)' }}>
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Nenhuma transação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New/Edit Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,9,13,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-full max-w-lg rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="text-base font-semibold">{editingId ? 'Editar transação' : 'Nova transação'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--muted-foreground)' }}><X size={18} /></button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {/* Type tabs */}
              <div className="flex rounded-lg p-1 gap-1" style={{ background: 'var(--secondary)' }}>
                {[['expense', '↓ Despesa'], ['income', '↑ Receita'], ['transfer', '⇄ Transferência']].map(([t, l]) => (
                  <button
                    key={t}
                    onClick={() => setEditTx(p => ({ ...p, type: t }))}
                    className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background: editTx.type === t ? (t === 'income' ? 'var(--primary)' : t === 'transfer' ? 'var(--accent)' : 'var(--danger)') : 'transparent',
                      color: editTx.type === t ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Data *</label>
                  <input type="date" value={editTx.date} onChange={e => setEditTx(p => ({ ...p, date: e.target.value }))} className="w-full" />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Valor *</label>
                  <input type="number" placeholder="0,00" value={editTx.amount ? Math.abs(editTx.amount as number) : ''} onChange={e => setEditTx(p => ({ ...p, amount: parseFloat(e.target.value) || 0 }))} className="w-full" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Descrição *</label>
                <input placeholder="Ex: Supermercado Extra" value={editTx.desc || ''} onChange={e => setEditTx(p => ({ ...p, desc: e.target.value }))} className="w-full" />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Conta</label>
                  <select value={editTx.accountId} onChange={e => setEditTx(p => ({ ...p, accountId: parseInt(e.target.value) }))} className="w-full">
                    {mockAccounts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                  </select>
                </div>
                {editTx.type !== 'transfer' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Categoria</label>
                    <select className="w-full" value={editTx.categoryId || ''} onChange={e => setEditTx(p => ({ ...p, categoryId: parseInt(e.target.value) }))}>
                      {mockCategories.map(c => (
                        <optgroup key={c.id} label={c.name}>
                          <option value={c.id}>{c.name} (geral)</option>
                          {c.children.map(sub => <option key={sub.id} value={sub.id}>{sub.name}</option>)}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                )}
                {editTx.type === 'transfer' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Conta destino</label>
                    <select className="w-full">
                      {mockAccounts.filter(a => a.id !== editTx.accountId).map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                  </div>
                )}
              </div>

              {/* Installments for credit cards */}
              {mockAccounts.find(a => a.id === editTx.accountId)?.type === 'credit' && editTx.type === 'expense' && (
                <div className="flex items-center gap-3 p-3 rounded-lg" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Parcelas</label>
                    <input type="number" min={1} max={24} value={installments} onChange={e => setInstallments(parseInt(e.target.value))} className="w-full" />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Valor por parcela</label>
                    <p className="text-sm mono font-semibold mt-2" style={{ color: 'var(--primary)' }}>
                      {installments > 1 ? formatBRL((editTx.amount as number || 0) / installments) : '—'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Status</label>
                  <select value={editTx.status || 'confirmed'} onChange={e => setEditTx(p => ({ ...p, status: e.target.value }))} className="w-full">
                    <option value="confirmed">Confirmada</option>
                    <option value="pending">Pendente</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Recorrência</label>
                  <select className="w-full">
                    <option value="">Sem recorrência</option>
                    <option value="monthly">Mensal</option>
                    <option value="weekly">Semanal</option>
                    <option value="yearly">Anual</option>
                  </select>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Etiquetas</label>
                <div className="flex flex-wrap gap-1.5">
                  {mockTags.map(tag => {
                    const selected = (editTx.tags || []).some((t: any) => t.id === tag.id)
                    return (
                      <button
                        key={tag.id}
                        onClick={() => setEditTx(p => ({
                          ...p,
                          tags: selected
                            ? (p.tags || []).filter((t: any) => t.id !== tag.id)
                            : [...(p.tags || []), tag],
                        }))}
                        className="text-xs px-2 py-0.5 rounded-full transition-all"
                        style={{
                          background: selected ? tag.color + '33' : 'var(--secondary)',
                          color: selected ? tag.color : 'var(--muted-foreground)',
                          border: `1px solid ${selected ? tag.color + '66' : 'var(--border)'}`,
                        }}
                      >
                        {tag.name}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-80" style={{ background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', color: '#fff' }}>
                {editingId ? 'Salvar alterações' : 'Adicionar transação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,9,13,0.8)' }}>
          <div className="w-80 rounded-xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold mb-2">Excluir transação</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>Esta ação não pode ser desfeita. A transação será removida permanentemente.</p>
            <div className="flex gap-2">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
              <button onClick={() => del(confirmDelete)} className="flex-1 py-2 rounded-lg text-sm font-medium text-white" style={{ background: 'var(--danger)' }}>Excluir</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
