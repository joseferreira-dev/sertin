import { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, Wallet, Power, PowerOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { jarService, Jar } from '../services/jarService';
import { formatBRL } from '../data/mock';

const palette = [
  '#10b981',
  '#3b82f6',
  '#f59e0b',
  '#ef4444',
  '#ec4899',
  '#8b5cf6',
  '#06b6d4',
  '#f97316',
  '#14b8a6',
  '#d946ef',
];

const iconOptions = ['💰', '🏦', '🪙', '💎', '🎯', '📦', '🏠', '🚗', '✈️', '🎓'];

export default function Jars() {
  const { token } = useAuth();
  const [jars, setJars] = useState<Jar[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    color: '#10b981',
    icon: '💰',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  const loadJars = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await jarService.getAll(token, false);
      setJars(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJars();
  }, [token]);

  const openNew = () => {
    setForm({ name: '', color: '#10b981', icon: '💰', description: '', status: 'active' });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (jar: Jar) => {
    setForm({
      name: jar.name,
      color: jar.color,
      icon: jar.icon,
      description: jar.description || '',
      status: jar.status,
    });
    setEditingId(jar.id);
    setShowModal(true);
  };

  const save = async () => {
    if (!token) return;
    try {
      if (editingId) {
        await jarService.update(
          editingId,
          {
            name: form.name,
            color: form.color,
            icon: form.icon,
            description: form.description,
            status: form.status,
          },
          token
        );
      } else {
        await jarService.create(
          {
            name: form.name,
            color: form.color,
            icon: form.icon,
            description: form.description,
            status: form.status,
          },
          token
        );
      }
      setShowModal(false);
      await loadJars();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteJar = async (id: number) => {
    if (!token) return;
    if (
      !confirm(
        'Excluir esta caixinha? Só é permitido se não houver transações ou metas ativas associadas.'
      )
    )
      return;
    try {
      await jarService.delete(id, token);
      await loadJars();
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64">Carregando...</div>;
  }

  if (error) {
    return <div className="text-center py-10 text-danger">Erro: {error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold tracking-tight">Caixinhas</h1>
          <p className="text-xs text-muted-foreground">
            {jars.length} caixinhas · {formatBRL(jars.reduce((s, j) => s + j.balance, 0))} guardados
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium bg-primary text-white hover:opacity-90"
        >
          <Plus size={14} /> Nova caixinha
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {jars.map((jar) => (
          <div
            key={jar.id}
            className="rounded-xl p-5 relative overflow-hidden group"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="absolute top-0 left-0 right-0 h-0.5"
              style={{ background: jar.color }}
            />
            {jar.status === 'inactive' && (
              <div className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground">
                Inativa
              </div>
            )}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: jar.color + '22' }}
                >
                  <span className="text-lg">{jar.icon}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold">{jar.name}</p>
                  {jar.description && (
                    <p className="text-xs text-muted-foreground">{jar.description}</p>
                  )}
                </div>
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openEdit(jar)}
                  className="w-6 h-6 rounded flex items-center justify-center text-muted-foreground"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => deleteJar(jar.id)}
                  className="w-6 h-6 rounded flex items-center justify-center text-danger"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-0.5">Saldo</p>
              <p
                className="text-xl font-bold mono"
                style={{ color: jar.balance >= 0 ? 'var(--primary)' : 'var(--danger)' }}
              >
                {formatBRL(jar.balance)}
              </p>
            </div>
          </div>
        ))}
        <button
          onClick={openNew}
          className="rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80"
          style={{ border: '2px dashed var(--border)', minHeight: 140 }}
        >
          <Plus size={20} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground">Adicionar caixinha</span>
        </button>
      </div>

      {/* Modal de criação/edição */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,9,13,0.8)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-md rounded-xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <h2 className="font-semibold text-sm">
                {editingId ? 'Editar caixinha' : 'Nova caixinha'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground">
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Nome *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Viagem Europa"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Cor</label>
                <div className="flex flex-wrap gap-2">
                  {palette.map((c) => (
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
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Ícone</label>
                <div className="flex flex-wrap gap-2">
                  {iconOptions.map((icon) => (
                    <button
                      key={icon}
                      onClick={() => setForm((p) => ({ ...p, icon }))}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-lg transition-colors"
                      style={{
                        background:
                          form.icon === icon ? 'rgba(16,185,129,0.15)' : 'var(--secondary)',
                        border:
                          form.icon === icon ? '1px solid var(--primary)' : '1px solid transparent',
                      }}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs text-muted-foreground">Descrição</label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full resize-none"
                />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-muted-foreground">Status</label>
                <button
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      status: p.status === 'active' ? 'inactive' : 'active',
                    }))
                  }
                  className={`relative w-10 h-6 rounded-full transition-all ${form.status === 'active' ? 'bg-primary' : 'bg-border'}`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${form.status === 'active' ? 'left-5' : 'left-1'}`}
                  />
                </button>
                <span className="text-xs">{form.status === 'active' ? 'Ativa' : 'Inativa'}</span>
              </div>
            </div>
            <div className="flex gap-3 px-5 pb-5">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2 rounded-lg text-sm bg-secondary border border-border"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                className="flex-1 py-2 rounded-lg text-sm font-medium bg-primary text-white"
              >
                {editingId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
