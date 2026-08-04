import { useState, useEffect, JSX } from 'react';
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Eye,
  Check,
  AlertCircle,
  Calendar,
  DollarSign,
  Undo,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { installmentService, Installment } from '../services/installmentService';
import { accountService, Account } from '../services/accountService';
import { creditCardService, CreditCard } from '../services/creditCardService';
import { categoryService, Category } from '../services/categoryService';
import { formatBRL } from '../data/mock';

type InstallmentStatus = 'active' | 'completed' | 'canceled';

const statusLabels: Record<InstallmentStatus, string> = {
  active: 'Ativo',
  completed: 'Concluído',
  canceled: 'Cancelado',
};

const statusColors: Record<InstallmentStatus, string> = {
  active: 'var(--primary)',
  completed: 'var(--success)',
  canceled: 'var(--danger)',
};

export default function Installments() {
  const { token } = useAuth();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailInstallment, setDetailInstallment] = useState<
    (Installment & { transactions?: any[] }) | null
  >(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [form, setForm] = useState({
    account_id: '',
    credit_card_id: '',
    category_id: '',
    description: '',
    total_amount: '',
    installment_count: '1',
    start_date: new Date().toISOString().slice(0, 10),
  });

  const combinedSources = [
    ...accounts.map((a) => ({ ...a, sourceType: 'account' as const })),
    ...creditCards.map((c) => ({
      ...c,
      sourceType: 'credit_card' as const,
      name: c.name,
      id: c.id,
    })),
  ];

  const selectedSourceValue = (() => {
    if (form.account_id) return `account-${form.account_id}`;
    if (form.credit_card_id) return `credit_card-${form.credit_card_id}`;
    return '';
  })();

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const filters: any = {};
      if (filterStatus !== 'all') {
        filters.status = filterStatus;
      }
      const [accs, cards, cats, insts] = await Promise.all([
        accountService.getAll(token, false),
        creditCardService.getAll(token),
        categoryService.getAll(token),
        installmentService.getAll(token, filters),
      ]);
      setAccounts(accs);
      setCreditCards(cards);
      setCategories(cats);
      setInstallments(insts);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, filterStatus]);

  const openNew = () => {
    setForm({
      account_id: '',
      credit_card_id: '',
      category_id: '',
      description: '',
      total_amount: '',
      installment_count: '1',
      start_date: new Date().toISOString().slice(0, 10),
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (inst: Installment) => {
    setForm({
      account_id: String(inst.account_id || ''),
      credit_card_id: String(inst.credit_card_id || ''),
      category_id: String(inst.category_id || ''),
      description: inst.description,
      total_amount: String(inst.total_amount),
      installment_count: String(inst.installment_count),
      start_date: inst.start_date,
    });
    setEditingId(inst.id);
    setShowModal(true);
  };

  const save = async () => {
    if (!token) return;
    try {
      const payload: any = {
        description: form.description,
        total_amount: parseFloat(form.total_amount),
        installment_count: parseInt(form.installment_count),
        start_date: form.start_date,
        category_id: form.category_id ? parseInt(form.category_id) : null,
      };
      if (form.account_id) {
        payload.account_id = parseInt(form.account_id);
        payload.credit_card_id = null;
      } else if (form.credit_card_id) {
        payload.credit_card_id = parseInt(form.credit_card_id);
        payload.account_id = null;
      } else {
        alert('Selecione uma conta ou cartão de crédito.');
        return;
      }

      if (editingId) {
        await installmentService.update(editingId, payload, token);
      } else {
        await installmentService.create(payload, token);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteInstallment = async (id: number) => {
    if (!token) return;
    if (!confirm('Excluir este parcelamento? As parcelas pendentes serão removidas.')) return;
    try {
      await installmentService.delete(id, token);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const viewDetails = async (id: number) => {
    if (!token) return;
    try {
      const data = await installmentService.getOne(id, token);
      setDetailInstallment(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const payInstallment = async (installmentId: number, number: number) => {
    if (!token) return;
    try {
      await installmentService.payInstallment(installmentId, number, token);
      await loadData();
      if (detailInstallment) {
        const updated = await installmentService.getOne(installmentId, token);
        setDetailInstallment(updated);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const unpayInstallment = async (installmentId: number, number: number) => {
    if (!token) return;
    try {
      await installmentService.unpayInstallment(installmentId, number, token);
      await loadData();
      if (detailInstallment) {
        const updated = await installmentService.getOne(installmentId, token);
        setDetailInstallment(updated);
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  const filtered = installments.filter((inst) =>
    inst.description.toLowerCase().includes(search.toLowerCase())
  );

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
        Erro ao carregar: {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>
            Parcelamentos
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {filtered.length} parcelamento(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm w-48"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
          />
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="text-sm"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
          >
            <option value="all">Todos</option>
            <option value="active">Ativos</option>
            <option value="completed">Concluídos</option>
            <option value="canceled">Cancelados</option>
          </select>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <Plus size={14} /> Novo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((inst) => {
          const paid = inst.paid_installments || 0;
          const total = inst.total_installments || inst.installment_count;
          const progress = total > 0 ? (paid / total) * 100 : 0;
          return (
            <div
              key={inst.id}
              className="rounded-xl p-5 relative overflow-hidden group"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ background: statusColors[inst.status as InstallmentStatus] }}
              />
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-sm font-semibold truncate">{inst.description}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: statusColors[inst.status as InstallmentStatus] + '22',
                        color: statusColors[inst.status as InstallmentStatus],
                      }}
                    >
                      {statusLabels[inst.status as InstallmentStatus]}
                    </span>
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      {inst.account_id
                        ? accounts.find((a) => a.id === inst.account_id)?.name || 'Conta'
                        : inst.credit_card_id
                          ? creditCards.find((c) => c.id === inst.credit_card_id)?.name || 'Cartão'
                          : 'N/A'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => viewDetails(inst.id)}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-secondary/50 transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => openEdit(inst)}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-secondary/50 transition-colors"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => deleteInstallment(inst.id)}
                    className="w-7 h-7 rounded flex items-center justify-center hover:bg-secondary/50 transition-colors"
                    style={{ color: 'var(--danger)' }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span style={{ color: 'var(--muted-foreground)' }}>Progresso</span>
                  <span className="mono" style={{ color: 'var(--foreground)' }}>
                    {paid}/{total}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--secondary)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(progress, 100)}%`,
                      background: statusColors[inst.status as InstallmentStatus],
                    }}
                  />
                </div>
              </div>

              <div className="flex justify-between items-end mt-4">
                <div>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Total
                  </p>
                  <p
                    className="text-lg font-bold mono"
                    style={{ letterSpacing: '-0.04em', color: 'var(--foreground)' }}
                  >
                    {formatBRL(inst.total_amount)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Início
                  </p>
                  <p className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>
                    {inst.start_date.split('-').reverse().join('/')}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div
            className="col-span-full text-center py-12"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Nenhum parcelamento encontrado.
          </div>
        )}
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
              <h2 className="font-semibold">
                {editingId ? 'Editar parcelamento' : 'Novo parcelamento'}
              </h2>
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
                  Descrição *
                </label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  placeholder="Ex: Compra do celular"
                  className="w-full"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Valor total *
                  </label>
                  <input
                    type="number"
                    value={form.total_amount}
                    onChange={(e) => setForm((p) => ({ ...p, total_amount: e.target.value }))}
                    placeholder="0,00"
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Nº de parcelas *
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={48}
                    value={form.installment_count}
                    onChange={(e) => setForm((p) => ({ ...p, installment_count: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Conta/Cartão *
                  </label>
                  <select
                    value={selectedSourceValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setForm((p) => ({ ...p, account_id: '', credit_card_id: '' }));
                        return;
                      }
                      const [type, id] = val.split('-');
                      if (type === 'account') {
                        setForm((p) => ({ ...p, account_id: id, credit_card_id: '' }));
                      } else if (type === 'credit_card') {
                        setForm((p) => ({ ...p, credit_card_id: id, account_id: '' }));
                      }
                    }}
                    className="w-full"
                  >
                    <option value="">Selecione</option>
                    {combinedSources.map((s) => (
                      <option key={`${s.sourceType}-${s.id}`} value={`${s.sourceType}-${s.id}`}>
                        {s.sourceType === 'account' ? 'Conta' : 'Cartão'}: {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Categoria
                  </label>
                  <select
                    value={form.category_id}
                    onChange={(e) => setForm((p) => ({ ...p, category_id: e.target.value }))}
                    className="w-full"
                  >
                    <option value="">Sem categoria</option>
                    {categories
                      .filter((c) => c.type === 'expense')
                      .map((cat) => (
                        <optgroup key={cat.id} label={cat.name}>
                          <option value={cat.id}>{cat.name}</option>
                          {cat.children?.map((sub) => (
                            <option key={sub.id} value={sub.id}>
                              {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Data da primeira parcela *
                </label>
                <input
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm((p) => ({ ...p, start_date: e.target.value }))}
                  className="w-full"
                />
              </div>
            </div>
            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 py-2.5 rounded-lg text-sm transition-opacity hover:opacity-80"
                style={{
                  background: 'var(--secondary)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={save}
                className="flex-1 py-2.5 rounded-lg text-sm font-medium"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                {editingId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes */}
      {detailInstallment && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,9,13,0.85)', backdropFilter: 'blur(6px)' }}
        >
          <div
            className="w-full max-w-2xl rounded-xl overflow-hidden"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b shrink-0"
              style={{ borderColor: 'var(--border)' }}
            >
              <div>
                <h2 className="font-semibold">{detailInstallment.description}</h2>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  {formatBRL(detailInstallment.total_amount)} ·{' '}
                  {detailInstallment.installment_count} parcelas
                </p>
              </div>
              <button
                onClick={() => setDetailInstallment(null)}
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6">
              <div className="flex flex-col gap-3">
                {detailInstallment.transactions?.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-3 rounded-lg"
                    style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{
                          background:
                            txn.status === 'confirmed' ? 'var(--primary)' : 'var(--warning)',
                        }}
                      />
                      <div>
                        <p className="text-sm font-medium">{txn.description}</p>
                        <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                          {txn.date.split('-').reverse().join('/')}
                          {txn.status === 'confirmed' && ' · Paga'}
                          {txn.status === 'pending' && ' · Pendente'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className="text-sm mono"
                        style={{
                          color: txn.status === 'confirmed' ? 'var(--primary)' : 'var(--warning)',
                        }}
                      >
                        {formatBRL(Math.abs(txn.amount))}
                      </span>
                      {txn.status === 'pending' && (
                        <button
                          onClick={() =>
                            payInstallment(detailInstallment.id, txn.installment_number)
                          }
                          className="px-2 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--primary)' }}
                        >
                          <Check size={12} /> Pagar
                        </button>
                      )}
                      {txn.status === 'confirmed' && (
                        <button
                          onClick={() =>
                            unpayInstallment(detailInstallment.id, txn.installment_number)
                          }
                          className="px-2 py-1 rounded text-xs font-medium transition-opacity hover:opacity-80"
                          style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}
                        >
                          <Undo size={12} /> Desfazer
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                {(!detailInstallment.transactions ||
                  detailInstallment.transactions.length === 0) && (
                  <p className="text-center text-sm" style={{ color: 'var(--muted-foreground)' }}>
                    Nenhuma parcela gerada ainda.
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
