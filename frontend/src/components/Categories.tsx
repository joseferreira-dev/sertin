import { useState, useEffect } from 'react';
import { Plus, ChevronDown, ChevronRight, Pencil, Trash2, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { categoryService, Category } from '../services/categoryService';

const catColors = [
  '#6366f1',
  '#f59e0b',
  '#3b82f6',
  '#ef4444',
  '#ec4899',
  '#06b6d4',
  '#8b5cf6',
  '#10b981',
  '#f97316',
  '#a3e635',
];

export default function Categories() {
  const { token } = useAuth();
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<number[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [parentId, setParentId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'expense' as 'income' | 'expense',
    parentId: null as number | null,
    color: '#6366f1',
  });
  const [confirmDelete, setConfirmDelete] = useState<{ id: number; isParent: boolean } | null>(
    null
  );

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getAll(token!);
      setCats(data);
      // Expandir todas por padrão (opcional)
      setExpanded(data.map((c) => c.id));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadCategories();
  }, [token]);

  const toggle = (id: number) => {
    setExpanded((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const openNew = (pId: number | null = null) => {
    setForm({
      name: '',
      type: pId ? cats.find((c) => c.id === pId)?.type || 'expense' : 'expense',
      parentId: pId,
      color: '#6366f1',
    });
    setEditId(null);
    setParentId(pId);
    setShowModal(true);
  };

  const openEdit = (cat: Category, pId: number | null = null) => {
    setForm({
      name: cat.name,
      type: cat.type,
      parentId: pId,
      color: cat.color || '#6366f1',
    });
    setEditId(cat.id);
    setParentId(pId);
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editId) {
        // Atualizar categoria
        await categoryService.update(
          editId,
          {
            name: form.name,
            color: form.color,
            // Não permitimos alterar o tipo ou parent_id por simplicidade
          },
          token!
        );
      } else {
        // Criar nova categoria
        await categoryService.create(
          {
            name: form.name,
            type: form.type,
            color: form.color,
            icon: 'Tag',
            parent_id: form.parentId,
          },
          token!
        );
      }
      setShowModal(false);
      await loadCategories();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteCategory = async (id: number) => {
    try {
      await categoryService.delete(id, token!);
      await loadCategories();
      setConfirmDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-10" style={{ color: 'var(--danger)' }}>
        Erro ao carregar categorias: {error}
      </div>
    );
  }

  const expenses = cats.filter((c) => c.type === 'expense');
  const incomes = cats.filter((c) => c.type === 'income');

  const renderSection = (list: Category[], label: string, typeColor: string) => (
    <div
      className="rounded-xl overflow-hidden mb-4"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      <div
        className="flex items-center justify-between px-5 py-3 border-b"
        style={{ borderColor: 'var(--border)' }}
      >
        <div className="flex items-center gap-2">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-semibold"
            style={{ background: typeColor + '22', color: typeColor }}
          >
            {label}
          </span>
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            {list.length} categorias
          </span>
        </div>
        <button
          onClick={() => openNew(null)}
          className="flex items-center gap-1 text-xs px-2 py-1 rounded-lg transition-opacity hover:opacity-80"
          style={{ background: typeColor + '15', color: typeColor }}
        >
          <Plus size={11} /> Nova categoria
        </button>
      </div>

      <div>
        {list.map((cat) => (
          <div key={cat.id}>
            {/* Parent row */}
            <div
              className={`flex items-center gap-2 px-5 py-3 group transition-colors hover:bg-secondary/30 ${list.indexOf(cat) > 0 ? 'border-t' : ''}`}
              style={{ borderColor: 'var(--border)' }}
            >
              <button
                onClick={() => toggle(cat.id)}
                className="w-4 h-4 flex items-center justify-center flex-shrink-0"
                style={{ color: 'var(--muted-foreground)' }}
              >
                {cat.children && cat.children.length > 0 ? (
                  expanded.includes(cat.id) ? (
                    <ChevronDown size={12} />
                  ) : (
                    <ChevronRight size={12} />
                  )
                ) : (
                  <span
                    className="w-2 h-2 rounded-full inline-block ml-1"
                    style={{ background: 'var(--border)' }}
                  />
                )}
              </button>
              <div
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ background: cat.color }}
              />
              <span className="text-sm font-medium flex-1">{cat.name}</span>
              <span className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>
                {cat.children?.length || 0} subcategorias
              </span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <button
                  onClick={() => openNew(cat.id)}
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ color: 'var(--primary)' }}
                >
                  <Plus size={11} />
                </button>
                <button
                  onClick={() => openEdit(cat)}
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  <Pencil size={11} />
                </button>
                <button
                  onClick={() => setConfirmDelete({ id: cat.id, isParent: true })}
                  className="w-6 h-6 rounded flex items-center justify-center"
                  style={{ color: 'var(--danger)' }}
                >
                  <Trash2 size={11} />
                </button>
              </div>
            </div>

            {/* Subcategories */}
            {expanded.includes(cat.id) &&
              cat.children?.map((sub) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 px-5 py-2.5 border-t group transition-colors hover:bg-secondary/20"
                  style={{
                    borderColor: 'var(--border)',
                    paddingLeft: 44,
                    background: 'rgba(0,0,0,0.15)',
                  }}
                >
                  <div
                    className="w-1 h-1 rounded-full flex-shrink-0"
                    style={{ background: 'var(--muted-foreground)' }}
                  />
                  <span className="text-sm flex-1" style={{ color: 'var(--secondary-foreground)' }}>
                    {sub.name}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEdit(sub, cat.id)}
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <Pencil size={11} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete({ id: sub.id, isParent: false })}
                      className="w-6 h-6 rounded flex items-center justify-center"
                      style={{ color: 'var(--danger)' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>
            Categorias
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {cats.length} categorias, {cats.reduce((s, c) => s + (c.children?.length || 0), 0)}{' '}
            subcategorias
          </p>
        </div>
      </div>

      {renderSection(expenses, 'DESPESA', 'var(--danger)')}
      {renderSection(incomes, 'RECEITA', 'var(--primary)')}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,9,13,0.8)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-96 rounded-xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2 className="font-semibold text-sm">
                {editId ? 'Editar' : parentId ? 'Nova subcategoria' : 'Nova categoria'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              {parentId && (
                <div
                  className="p-2.5 rounded-lg text-xs"
                  style={{ background: 'var(--secondary)' }}
                >
                  Subcategoria de: <strong>{cats.find((c) => c.id === parentId)?.name}</strong>
                </div>
              )}
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Nome *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Restaurante"
                  className="w-full"
                />
              </div>
              {!parentId && !editId && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Tipo
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value as 'income' | 'expense' }))
                    }
                    className="w-full"
                  >
                    <option value="expense">Despesa</option>
                    <option value="income">Receita</option>
                  </select>
                </div>
              )}
              {!parentId && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
                    Cor
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {catColors.map((c) => (
                      <button
                        key={c}
                        onClick={() => setForm((p) => ({ ...p, color: c }))}
                        className="w-6 h-6 rounded-full transition-transform hover:scale-110"
                        style={{
                          background: c,
                          border: form.color === c ? '2px solid white' : '2px solid transparent',
                          outline: form.color === c ? `2px solid ${c}` : 'none',
                        }}
                      />
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={save}
                className="flex-1 py-2 rounded-lg text-sm font-medium"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm delete */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,9,13,0.8)' }}
        >
          <div
            className="w-96 rounded-xl p-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-semibold mb-2">Excluir categoria</h3>
            <p className="text-sm mb-2" style={{ color: 'var(--muted-foreground)' }}>
              Esta categoria possui transações vinculadas. Como deseja proceder?
            </p>
            <div className="flex flex-col gap-2">
              <button
                className="w-full py-2.5 rounded-lg text-sm text-left px-3"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
              >
                Reatribuir transações para outra categoria (em breve)
              </button>
              <button
                onClick={() => deleteCategory(confirmDelete.id)}
                className="w-full py-2.5 rounded-lg text-sm text-white"
                style={{ background: 'var(--danger)' }}
              >
                Excluir permanentemente (com todas as transações)
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                className="w-full py-2 text-sm"
                style={{ color: 'var(--muted-foreground)' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
