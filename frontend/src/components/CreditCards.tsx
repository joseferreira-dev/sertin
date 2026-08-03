import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Pencil,
  Trash2,
  CreditCard as CreditCardIcon,
  Wallet,
  Building2,
  Banknote,
  Power,
  PowerOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { creditCardService, CreditCard } from '../services/creditCardService';
import { formatBRL } from '../data/mock';

const iconMap: Record<string, any> = { CreditCard: CreditCardIcon, Wallet, Building2, Banknote };

export default function CreditCards() {
  const { token } = useAuth();
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    institution: '',
    limit_amount: '',
    closing_day: '',
    due_day: '',
    color: '#10b981',
    icon: 'CreditCard',
    status: 'active' as 'active' | 'inactive',
  });
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

  const loadCards = async () => {
    try {
      setLoading(true);
      const data = await creditCardService.getAll(token!);
      setCards(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadCards();
  }, [token]);

  const openNew = () => {
    setForm({
      name: '',
      institution: '',
      limit_amount: '',
      closing_day: '',
      due_day: '',
      color: '#10b981',
      icon: 'CreditCard',
      status: 'active',
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (card: CreditCard) => {
    setForm({
      name: card.name,
      institution: card.institution || '',
      limit_amount: String(card.limit_amount),
      closing_day: String(card.closing_day),
      due_day: String(card.due_day),
      color: card.color,
      icon: card.icon,
      status: card.status,
    });
    setEditId(card.id);
    setShowModal(true);
  };

  const save = async () => {
    try {
      const payload = {
        name: form.name,
        institution: form.institution,
        limit_amount: parseFloat(form.limit_amount) || 0,
        closing_day: parseInt(form.closing_day) || 1,
        due_day: parseInt(form.due_day) || 1,
        color: form.color,
        icon: form.icon,
        status: form.status,
      };

      if (editId) {
        await creditCardService.update(editId, payload, token!);
      } else {
        await creditCardService.create(payload, token!);
      }
      setShowModal(false);
      await loadCards();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteCard = async (id: number) => {
    try {
      await creditCardService.delete(id, token!);
      await loadCards();
      setConfirmDelete(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-10" style={{ color: 'var(--danger)' }}>
        Erro ao carregar cartões: {error}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>
            Cartões de Crédito
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {cards.filter((c) => c.status === 'active').length} ativo(s) ·{' '}
            {cards.filter((c) => c.status !== 'active').length} inativo(s)
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <Plus size={14} /> Novo cartão
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {cards.map((card) => {
          const Icon = iconMap[card.icon] || CreditCardIcon;
          const usedPct =
            card.limit_amount > 0 ? ((card.current_balance || 0) / card.limit_amount) * 100 : 0;
          const isActive = card.status === 'active';
          return (
            <div
              key={card.id}
              className={`rounded-xl p-5 relative overflow-hidden group ${!isActive ? 'opacity-60' : ''}`}
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                style={{ background: card.color }}
              />
              {!isActive && (
                <div
                  className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}
                >
                  Inativo
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: card.color + '22' }}
                  >
                    <Icon size={17} style={{ color: card.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{card.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {card.institution || 'Cartão de crédito'}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(card)}
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => setConfirmDelete(card.id)}
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              <div className="mb-1">
                <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  Fatura atual
                </p>
                <p className="text-xl font-bold mono" style={{ color: 'var(--danger)' }}>
                  {formatBRL(card.current_balance || 0)}
                </p>
              </div>

              {card.limit_amount > 0 && (
                <>
                  <div
                    className="flex justify-between text-xs mb-1.5 mt-3"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <span>
                      Limite disponível:{' '}
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                        {formatBRL(Math.max(0, card.limit_amount - (card.current_balance || 0)))}
                      </span>
                    </span>
                    <span>{Math.round(usedPct)}%</span>
                  </div>
                  <div
                    className="w-full h-1.5 rounded-full overflow-hidden"
                    style={{ background: 'var(--secondary)' }}
                  >
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${Math.min(usedPct, 100)}%`,
                        background:
                          usedPct > 85
                            ? 'var(--danger)'
                            : usedPct > 60
                              ? 'var(--warning)'
                              : card.color,
                      }}
                    />
                  </div>
                </>
              )}
              <div
                className="flex justify-between text-xs mt-2"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <span>Fechamento: dia {card.closing_day}</span>
                <span>Vencimento: dia {card.due_day}</span>
              </div>
            </div>
          );
        })}

        <button
          onClick={openNew}
          className="rounded-xl p-5 flex flex-col items-center justify-center gap-2 transition-all hover:opacity-80"
          style={{ border: '2px dashed var(--border)', minHeight: 140 }}
        >
          <Plus size={20} style={{ color: 'var(--muted-foreground)' }} />
          <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
            Adicionar cartão
          </span>
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
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2 className="font-semibold">{editId ? 'Editar cartão' : 'Novo cartão'}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Nome *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Cartão Inter"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Limite total *
                  </label>
                  <input
                    type="number"
                    value={form.limit_amount}
                    onChange={(e) => setForm((p) => ({ ...p, limit_amount: e.target.value }))}
                    placeholder="5000"
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Instituição
                  </label>
                  <input
                    value={form.institution}
                    onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))}
                    placeholder="Ex: Banco Inter"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Dia de fechamento *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={form.closing_day}
                    onChange={(e) => setForm((p) => ({ ...p, closing_day: e.target.value }))}
                    placeholder="dia"
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Dia de vencimento *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={31}
                    value={form.due_day}
                    onChange={(e) => setForm((p) => ({ ...p, due_day: e.target.value }))}
                    placeholder="dia"
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Cor
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                    className="h-9 w-16 rounded cursor-pointer"
                    style={{ padding: 2 }}
                  />
                  <span className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>
                    {form.color}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Status
                </label>
                <button
                  type="button"
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
                <span className="text-xs">{form.status === 'active' ? 'Ativo' : 'Inativo'}</span>
              </div>
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={save}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                {editId ? 'Salvar' : 'Criar cartão'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar exclusão */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,9,13,0.8)' }}
        >
          <div
            className="w-80 rounded-xl p-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-semibold mb-2">Excluir cartão</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
              Esta ação excluirá o cartão permanentemente. Só é permitido se não houver transações
              vinculadas.
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmDelete(null)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => deleteCard(confirmDelete)}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                style={{ background: 'var(--danger)' }}
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
