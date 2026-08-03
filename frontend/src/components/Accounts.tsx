import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Wallet,
  Building2,
  PiggyBank,
  Banknote,
  Power,
  PowerOff,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { accountService, Account } from '../services/accountService';
import { formatBRL } from '../data/mock';

const iconMap: Record<string, any> = { Wallet, Building2, PiggyBank, Banknote };

const typeLabel: Record<string, string> = {
  checking: 'Conta Corrente',
  savings: 'Poupança',
  cash: 'Dinheiro Físico',
  digital: 'Carteira Digital',
};

export default function Accounts() {
  const { token } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: '',
    type: 'checking' as Account['type'],
    balance: '',
    color: '#10b981',
    institution: '',
    status: 'active' as 'active' | 'inactive',
  });
  const [confirmAction, setConfirmAction] = useState<{
    type: 'delete' | 'toggle';
    id: number;
  } | null>(null);

  const loadAccounts = async () => {
    try {
      setLoading(true);
      const data = await accountService.getAll(token!);
      setAccounts(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadAccounts();
  }, [token]);

  const netWorth = accounts.filter((a) => a.status === 'active').reduce((s, a) => s + a.balance, 0);

  const openNew = () => {
    setForm({
      name: '',
      type: 'checking',
      balance: '',
      color: '#10b981',
      institution: '',
      status: 'active',
    });
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (acc: Account) => {
    setForm({
      name: acc.name,
      type: acc.type,
      balance: String(acc.balance),
      color: acc.color,
      institution: acc.institution || '',
      status: acc.status,
    });
    setEditId(acc.id);
    setShowModal(true);
  };

  const save = async () => {
    try {
      if (editId) {
        await accountService.update(
          editId,
          {
            name: form.name,
            color: form.color,
            institution: form.institution,
            status: form.status,
          },
          token!
        );
      } else {
        await accountService.create(
          {
            name: form.name,
            type: form.type,
            balance: parseFloat(form.balance.replace(',', '.')) || 0,
            color: form.color,
            institution: form.institution,
            icon:
              form.type === 'cash' ? 'Banknote' : form.type === 'savings' ? 'PiggyBank' : 'Wallet',
            status: form.status,
          },
          token!
        );
      }
      setShowModal(false);
      await loadAccounts();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const toggleActive = async (id: number) => {
    try {
      const account = accounts.find((a) => a.id === id);
      if (!account) return;
      const newStatus = account.status === 'active' ? 'inactive' : 'active';
      await accountService.update(id, { status: newStatus }, token!);
      await loadAccounts();
      setConfirmAction(null);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteAccount = async (id: number) => {
    try {
      await accountService.delete(id, token!);
      await loadAccounts();
      setConfirmAction(null);
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
        Erro ao carregar contas: {error}
      </div>
    );
  }

  const balanceClass = (b: number) => (b >= 0 ? 'var(--primary)' : 'var(--danger)');

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>
            Contas
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {accounts.filter((a) => a.status === 'active').length} ativa(s) ·{' '}
            {accounts.filter((a) => a.status !== 'active').length} inativa(s)
          </p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
          style={{ background: 'var(--primary)', color: '#fff' }}
        >
          <Plus size={14} /> Nova conta
        </button>
      </div>

      {/* Net Worth Banner */}
      <div
        className="rounded-xl p-5 mb-6 flex items-center justify-between"
        style={{
          background:
            'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(99,102,241,0.08) 100%)',
          border: '1px solid rgba(16,185,129,0.2)',
        }}
      >
        <div>
          <p
            className="text-xs font-semibold mb-1"
            style={{
              color: 'var(--muted-foreground)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            }}
          >
            Patrimônio Líquido (contas ativas)
          </p>
          <p
            className="text-3xl font-bold mono"
            style={{ color: 'var(--primary)', letterSpacing: '-0.05em' }}
          >
            {formatBRL(netWorth)}
          </p>
        </div>
        <div className="flex gap-8 text-right">
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Total Ativos
            </p>
            <p className="text-base font-semibold mono" style={{ color: 'var(--primary)' }}>
              {formatBRL(
                accounts
                  .filter((a) => a.status === 'active' && a.balance > 0)
                  .reduce((s, a) => s + a.balance, 0)
              )}
            </p>
          </div>
          <div>
            <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>
              Total Passivos
            </p>
            <p className="text-base font-semibold mono" style={{ color: 'var(--danger)' }}>
              {formatBRL(
                accounts
                  .filter((a) => a.status === 'active' && a.balance < 0)
                  .reduce((s, a) => s + Math.abs(a.balance), 0)
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Account Cards Grid */}
      <div className="grid grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = iconMap[acc.icon] || Wallet;
          const isActive = acc.status === 'active';
          return (
            <div
              key={acc.id}
              className={`rounded-xl p-5 relative overflow-hidden group ${!isActive ? 'opacity-60' : ''}`}
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5 rounded-t-xl"
                style={{ background: acc.color }}
              />
              {!isActive && (
                <div
                  className="absolute top-2 right-2 text-xs px-2 py-0.5 rounded-full"
                  style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}
                >
                  Inativa
                </div>
              )}

              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-9 h-9 rounded-lg flex items-center justify-center"
                    style={{ background: acc.color + '22' }}
                  >
                    <Icon size={17} style={{ color: acc.color }} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{acc.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {typeLabel[acc.type] || acc.type}
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(acc)}
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <Pencil size={12} />
                  </button>
                  <button
                    onClick={() => setConfirmAction({ type: 'toggle', id: acc.id })}
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ color: isActive ? 'var(--warning)' : 'var(--primary)' }}
                  >
                    {isActive ? <PowerOff size={12} /> : <Power size={12} />}
                  </button>
                  <button
                    onClick={() => setConfirmAction({ type: 'delete', id: acc.id })}
                    className="w-6 h-6 rounded flex items-center justify-center"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {acc.institution && (
                <p className="text-xs mb-3" style={{ color: 'var(--muted-foreground)' }}>
                  {acc.institution}
                </p>
              )}

              <div className="mb-1">
                <p className="text-xs mb-0.5" style={{ color: 'var(--muted-foreground)' }}>
                  Saldo
                </p>
                <p
                  className="text-xl font-bold mono"
                  style={{ color: balanceClass(acc.balance), letterSpacing: '-0.04em' }}
                >
                  {formatBRL(acc.balance)}
                </p>
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
            Adicionar conta
          </span>
        </button>
      </div>

      {/* Modal */}
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
              <h2 className="font-semibold">{editId ? 'Editar conta' : 'Nova conta'}</h2>
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
                  placeholder="Ex: Nubank"
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Tipo *
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value as Account['type'] }))
                    }
                    className="w-full"
                    disabled={!!editId}
                  >
                    <option value="checking">Conta Corrente</option>
                    <option value="savings">Poupança</option>
                    <option value="cash">Dinheiro Físico</option>
                    <option value="digital">Carteira Digital</option>
                  </select>
                  {editId && (
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Tipo não pode ser alterado
                    </p>
                  )}
                </div>
                {!editId && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Saldo inicial
                    </label>
                    <input
                      type="number"
                      value={form.balance}
                      onChange={(e) => setForm((p) => ({ ...p, balance: e.target.value }))}
                      placeholder="0,00"
                      className="w-full"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Instituição
                  </label>
                  <input
                    value={form.institution}
                    onChange={(e) => setForm((p) => ({ ...p, institution: e.target.value }))}
                    placeholder="Ex: Nubank"
                    className="w-full"
                  />
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
                <span className="text-xs">{form.status === 'active' ? 'Ativa' : 'Inativa'}</span>
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
                {editId ? 'Salvar' : 'Criar conta'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Action Modal */}
      {confirmAction && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,9,13,0.8)' }}
        >
          <div
            className="w-80 rounded-xl p-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-semibold mb-2">
              {confirmAction.type === 'delete' ? 'Excluir conta' : 'Alterar status'}
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
              {confirmAction.type === 'delete'
                ? 'Esta ação excluirá a conta permanentemente. Só é permitido se não houver transações vinculadas.'
                : 'Deseja alterar o status da conta entre ativa e inativa? Contas inativas não podem ser usadas em novas transações.'}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setConfirmAction(null)}
                className="flex-1 py-2 rounded-lg text-sm"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  if (confirmAction.type === 'delete') deleteAccount(confirmAction.id);
                  else toggleActive(confirmAction.id);
                }}
                className="flex-1 py-2 rounded-lg text-sm font-medium text-white"
                style={{
                  background: confirmAction.type === 'delete' ? 'var(--danger)' : 'var(--primary)',
                }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
