import { useState } from 'react'
import { Plus, X, Pencil, Trash2, Hash } from 'lucide-react'
import { mockTags as initialTags } from '../data/mock'

const palette = ['#6366f1', '#f59e0b', '#3b82f6', '#ef4444', '#ec4899', '#06b6d4', '#8b5cf6', '#10b981', '#f97316', '#a3e635', '#e11d48', '#7c3aed']

export default function Tags() {
  const [tags, setTags] = useState(initialTags.map(t => ({ ...t })))
  const [showModal, setShowModal] = useState(false)
  const [editId, setEditId] = useState<number | null>(null)
  const [form, setForm] = useState({ name: '', color: '#6366f1', description: '' })
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)

  const openNew = () => { setForm({ name: '', color: '#6366f1', description: '' }); setEditId(null); setShowModal(true) }
  const openEdit = (tag: any) => { setForm({ name: tag.name, color: tag.color, description: tag.description }); setEditId(tag.id); setShowModal(true) }

  const save = () => {
    if (editId) {
      setTags(prev => prev.map(t => t.id === editId ? { ...t, ...form } : t))
    } else {
      const id = Math.max(...tags.map(t => t.id)) + 1
      setTags(prev => [...prev, { id, ...form, count: 0 }])
    }
    setShowModal(false)
  }

  const del = (id: number) => {
    setTags(prev => prev.filter(t => t.id !== id))
    setConfirmDelete(null)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>Etiquetas</h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{tags.length} etiquetas cadastradas</p>
        </div>
        <button onClick={openNew} className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', color: '#fff' }}>
          <Plus size={14} /> Nova etiqueta
        </button>
      </div>

      {/* Usage tip */}
      <div className="p-4 rounded-xl mb-5 text-sm" style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)' }}>
        <p className="font-medium mb-1" style={{ color: 'var(--accent)' }}>Como usar etiquetas</p>
        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
          Adicione etiquetas às transações para classificações cruzadas independentes de categorias. Ex: "Marido", "Presente", "Trabalho", "Viagem Europa".
          Filtre por etiquetas no extrato e gere relatórios por etiqueta.
        </p>
      </div>

      {/* Tags Grid */}
      <div className="grid grid-cols-3 gap-3">
        {tags.map(tag => (
          <div key={tag.id} className="rounded-xl p-4 group relative overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: tag.color }} />

            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: tag.color + '22' }}>
                  <Hash size={14} style={{ color: tag.color }} />
                </div>
                <div>
                  <p className="text-sm font-semibold">{tag.name}</p>
                  <p className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>{tag.count} transações</p>
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(tag)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--muted-foreground)' }}>
                  <Pencil size={11} />
                </button>
                <button onClick={() => setConfirmDelete(tag.id)} className="w-6 h-6 rounded flex items-center justify-center" style={{ color: 'var(--danger)' }}>
                  <Trash2 size={11} />
                </button>
              </div>
            </div>

            {tag.description && (
              <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{tag.description}</p>
            )}

            {/* Preview chip */}
            <div className="mt-3">
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: tag.color + '22', color: tag.color, border: `1px solid ${tag.color}44` }}>
                {tag.name}
              </span>
            </div>
          </div>
        ))}

        <button onClick={openNew} className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all hover:opacity-70" style={{ border: '2px dashed var(--border)', minHeight: 120 }}>
          <Plus size={18} style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Adicionar etiqueta</span>
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,9,13,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="w-96 rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b" style={{ borderColor: 'var(--border)' }}>
              <h2 className="font-semibold text-sm">{editId ? 'Editar etiqueta' : 'Nova etiqueta'}</h2>
              <button onClick={() => setShowModal(false)} style={{ color: 'var(--muted-foreground)' }}><X size={16} /></button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Nome *</label>
                <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Viagem Europa" className="w-full" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>Cor</label>
                <div className="flex flex-wrap gap-2 mb-1">
                  {palette.map(c => (
                    <button key={c} onClick={() => setForm(p => ({ ...p, color: c }))}
                      className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                      style={{ background: c, border: form.color === c ? '2px solid white' : '2px solid transparent', outline: form.color === c ? `2px solid ${c}` : 'none' }}
                    />
                  ))}
                </div>
                {/* Preview */}
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs px-2.5 py-1 rounded-full" style={{ background: form.color + '22', color: form.color, border: `1px solid ${form.color}55` }}>
                    {form.name || 'Prévia'}
                  </span>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Descrição (opcional)</label>
                <textarea rows={2} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} placeholder="Descrição da etiqueta..." className="w-full resize-none" />
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>Cancelar</button>
              <button onClick={save} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>Salvar</button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(7,9,13,0.8)' }}>
          <div className="w-80 rounded-xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <h3 className="font-semibold mb-2">Excluir etiqueta</h3>
            <p className="text-sm mb-1" style={{ color: 'var(--muted-foreground)' }}>
              A etiqueta será removida de <strong>{tags.find(t => t.id === confirmDelete)?.count}</strong> transações associadas.
              As transações não serão excluídas.
            </p>
            <p className="text-sm mb-5" style={{ color: 'var(--danger)' }}>Esta ação não pode ser desfeita.</p>
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
