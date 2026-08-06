import { useState, useEffect } from 'react';
import {
  Filter,
  Plus,
  X,
  Pencil,
  Trash2,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  SlidersHorizontal,
  Search,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatBRL } from '../data/mock';
import { transactionService, Transaction as TransactionType } from '../services/transactionService';
import { accountService, Account } from '../services/accountService';
import { jarService, Jar } from '../services/jarService';
import { creditCardService, CreditCard } from '../services/creditCardService';
import { categoryService, Category } from '../services/categoryService';
import { tagService, Tag } from '../services/tagService';

interface TransactionWithTags extends TransactionType {
  tags?: Tag[];
}

interface TransactionForm {
  type: 'income' | 'expense' | 'transfer';
  date: string;
  description: string;
  amount: number;
  accountId?: number | null;
  jarId?: number | null;
  destAccountId?: number | null;
  destJarId?: number | null;
  creditCardId?: number | null;
  categoryId?: number | null;
  status: 'pending' | 'confirmed' | 'cancelled';
  tagIds: number[];
  installment_total?: number;
  installment_current?: number;
}

const emptyTx: TransactionForm = {
  type: 'expense',
  date: new Date().toISOString().slice(0, 10),
  description: '',
  amount: 0,
  accountId: null,
  jarId: null,
  destAccountId: null,
  destJarId: null,
  creditCardId: null,
  categoryId: null,
  status: 'pending',
  tagIds: [],
  installment_total: 1,
  installment_current: 1,
};

export default function Transactions() {
  const { token } = useAuth();
  const [txs, setTxs] = useState<TransactionWithTags[]>([]);
  const [loading, setLoading] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [jars, setJars] = useState<Jar[]>([]);
  const [creditCards, setCreditCards] = useState<CreditCard[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editTx, setEditTx] = useState<TransactionForm>(emptyTx);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [filterOpen, setFilterOpen] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterAccount, setFilterAccount] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);
  const [installments, setInstallments] = useState(1);

  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [year, month] = selectedMonth.split('-').map(Number);
      const startDate = new Date(year, month - 1, 1).toISOString().slice(0, 10);
      const endDate = new Date(year, month, 0).toISOString().slice(0, 10);

      const [txns, accs, jarsData, cards, cats, tags] = await Promise.all([
        transactionService.getAll(token, { limit: 200, startDate, endDate }),
        accountService.getAll(token, false),
        jarService.getAll(token),
        creditCardService.getAll(token),
        categoryService.getAll(token),
        tagService.getAll(token),
      ]);
      setTxs(txns);
      setAccounts(accs);
      setJars(jarsData);
      setCreditCards(cards);
      setCategories(cats);
      setAvailableTags(tags);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, selectedMonth]);

  const filtered = txs.filter((tx) => {
    if (search && !tx.description?.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterAccount) {
      const match =
        String(tx.account_id) === filterAccount ||
        String(tx.dest_account_id) === filterAccount ||
        String(tx.jar_id) === filterAccount ||
        String(tx.dest_jar_id) === filterAccount;
      if (!match) return false;
    }
    if (filterStatus && tx.status !== filterStatus) return false;
    return true;
  });

  const totalIncome = filtered.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = filtered
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + Math.abs(t.amount), 0);

  const openNew = () => {
    setEditTx({
      ...emptyTx,
      date: new Date().toISOString().slice(0, 10),
      accountId: null,
      jarId: null,
      creditCardId: null,
      status: 'pending',
    });
    setEditingId(null);
    setInstallments(1);
    setShowModal(true);
  };

  const openEdit = (tx: TransactionWithTags) => {
    setEditTx({
      type: tx.type,
      date: tx.date,
      description: tx.description,
      amount: Math.abs(tx.amount),
      accountId: tx.account_id ?? null,
      jarId: (tx as any).jar_id ?? null,
      destAccountId: tx.dest_account_id ?? null,
      destJarId: (tx as any).dest_jar_id ?? null,
      creditCardId: (tx as any).credit_card_id ?? null,
      categoryId: tx.category_id ?? null,
      status: tx.status || 'confirmed',
      tagIds: tx.tags?.map((t) => t.id) || [],
      installment_total: tx.installment_total || 1,
      installment_current: tx.installment_current || 1,
    });
    setEditingId(tx.id);
    setInstallments(tx.installment_total || 1);
    setShowModal(true);
  };

  const getAccountName = (id?: number | null) => {
    if (!id) return '—';
    const found = accounts.find((a) => a.id === id);
    return found ? found.name : `ID ${id}`;
  };

  const getJarName = (id?: number | null) => {
    if (!id) return '—';
    const found = jars.find((j) => j.id === id);
    return found ? found.name : `ID ${id}`;
  };

  const combinedSources = [
    ...accounts.map((a) => ({ ...a, sourceType: 'account' as const })),
    ...jars.map((j) => ({ ...j, sourceType: 'jar' as const, id: j.id, name: j.name })),
    ...creditCards.map((c) => ({
      ...c,
      sourceType: 'credit_card' as const,
      name: c.name,
      id: c.id,
    })),
  ];

  const selectedSourceValue = (() => {
    if (editTx.accountId) return `account-${editTx.accountId}`;
    if (editTx.jarId) return `jar-${editTx.jarId}`;
    if (editTx.creditCardId) return `credit_card-${editTx.creditCardId}`;
    return '';
  })();

  const save = async () => {
    if (!token) return;

    if (editTx.status !== 'pending' && !editTx.accountId && !editTx.jarId && !editTx.creditCardId) {
      alert(
        'Transações confirmadas ou canceladas devem ter uma conta, caixinha ou cartão vinculado.'
      );
      return;
    }

    try {
      const payload: any = {
        account_id: editTx.accountId || null,
        jar_id: editTx.jarId || null,
        dest_account_id: editTx.destAccountId || null,
        dest_jar_id: editTx.destJarId || null,
        credit_card_id: editTx.creditCardId || null,
        category_id: editTx.categoryId || null,
        type: editTx.type,
        amount: editTx.type === 'expense' ? -Math.abs(editTx.amount) : Math.abs(editTx.amount),
        description: editTx.description,
        date: editTx.date,
        status: editTx.status,
        installment_total: editTx.installment_total || 1,
        installment_current: editTx.installment_current || 1,
        tagIds: editTx.tagIds,
      };

      if (editingId) {
        await transactionService.update(editingId, payload, token);
      } else {
        await transactionService.create(payload, token);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message || 'Erro ao salvar transação');
    }
  };

  const del = async (id: number) => {
    if (!token) return;
    try {
      await transactionService.delete(id, token);
      setConfirmDelete(null);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'confirmed') return 'var(--primary)';
    if (s === 'pending') return 'var(--warning)';
    return 'var(--muted-foreground)';
  };
  const statusLabel = (s: string) => {
    if (s === 'confirmed') return 'Confirmada';
    if (s === 'pending') return 'Pendente';
    return 'Cancelada';
  };

  const getCategoryName = (id?: number | null) => {
    if (!id) return '—';
    const flat = categories.flatMap((c) => [c, ...(c.children || [])]);
    const found = flat.find((c) => c.id === id);
    return found ? found.name : `ID ${id}`;
  };

  const getSourceName = (tx: TransactionWithTags) => {
    if (tx.account_id) return getAccountName(tx.account_id);
    if ((tx as any).jar_id) return getJarName((tx as any).jar_id);
    if ((tx as any).credit_card_id) {
      const card = creditCards.find((c) => c.id === (tx as any).credit_card_id);
      return card ? card.name : 'Cartão';
    }
    if (tx.dest_account_id) return getAccountName(tx.dest_account_id);
    if ((tx as any).dest_jar_id) return getJarName((tx as any).dest_jar_id);
    return '—';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>
            Extrato
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {filtered.length} transação(ões) encontrada(s)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
          />
          <button
            onClick={() => setFilterOpen(!filterOpen)}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-80"
            style={{
              background: filterOpen ? 'rgba(16,185,129,0.1)' : 'var(--card)',
              border: '1px solid var(--border)',
              color: filterOpen ? 'var(--primary)' : 'var(--secondary-foreground)',
            }}
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
        {filterOpen && (
          <div className="w-56 shrink-0 flex flex-col gap-3">
            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <p
                className="text-xs font-semibold mb-3"
                style={{
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Filtros
              </p>
              <div className="flex flex-col gap-3">
                <div className="relative">
                  <Search
                    size={12}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2"
                    style={{ color: 'var(--muted-foreground)' }}
                  />
                  <input
                    className="w-full text-xs pl-7 py-2"
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>

                <div>
                  <label
                    className="text-xs mb-1 block"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Tipo
                  </label>
                  <select
                    className="w-full text-xs py-1.5"
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    <option value="income">Receitas</option>
                    <option value="expense">Despesas</option>
                    <option value="transfer">Transferências</option>
                  </select>
                </div>

                <div>
                  <label
                    className="text-xs mb-1 block"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Conta/Caixinha/Cartão
                  </label>
                  <select
                    className="w-full text-xs py-1.5"
                    value={filterAccount}
                    onChange={(e) => setFilterAccount(e.target.value)}
                  >
                    <option value="">Todos</option>
                    {combinedSources.map((s) => (
                      <option key={`${s.sourceType}-${s.id}`} value={s.id}>
                        {s.sourceType === 'account'
                          ? 'Conta'
                          : s.sourceType === 'jar'
                            ? 'Caixinha'
                            : 'Cartão'}
                        : {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    className="text-xs mb-1 block"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Status
                  </label>
                  <select
                    className="w-full text-xs py-1.5"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="">Todos</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="pending">Pendente</option>
                  </select>
                </div>

                <button
                  onClick={() => {
                    setSearch('');
                    setFilterType('all');
                    setFilterAccount('');
                    setFilterStatus('');
                  }}
                  className="text-xs py-1.5 rounded-lg transition-opacity hover:opacity-70"
                  style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
                >
                  Limpar filtros
                </button>
              </div>
            </div>

            <div
              className="rounded-xl p-4"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              <p
                className="text-xs font-semibold mb-3"
                style={{
                  color: 'var(--muted-foreground)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                }}
              >
                Resumo
              </p>
              <div className="flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted-foreground)' }}>Receitas</span>
                  <span className="mono font-semibold" style={{ color: 'var(--primary)' }}>
                    +{formatBRL(totalIncome)}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span style={{ color: 'var(--muted-foreground)' }}>Despesas</span>
                  <span className="mono font-semibold" style={{ color: 'var(--danger)' }}>
                    -{formatBRL(totalExpenses)}
                  </span>
                </div>
                <div
                  className="pt-2 border-t flex justify-between text-xs font-semibold"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <span>Saldo</span>
                  <span
                    className="mono"
                    style={{
                      color: totalIncome - totalExpenses >= 0 ? 'var(--primary)' : 'var(--danger)',
                    }}
                  >
                    {formatBRL(totalIncome - totalExpenses)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div
          className="flex-1 rounded-xl overflow-hidden"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)' }}>
                {[
                  'Data',
                  'Descrição',
                  'Categoria',
                  'Conta/Caixinha/Cartão',
                  'Status',
                  'Valor',
                  '',
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-semibold"
                    style={{
                      color: 'var(--muted-foreground)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((tx) => (
                <tr
                  key={tx.id}
                  className="group border-b transition-colors hover:bg-secondary/20"
                  style={{ borderColor: 'var(--border)' }}
                >
                  <td
                    className="px-4 py-3 text-xs mono whitespace-nowrap"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    {tx.date.slice(8)}/{tx.date.slice(5, 7)}
                  </td>
                  <td className="px-4 py-3 max-w-0">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium truncate block">
                        {tx.description}
                        {tx.installment_number &&
                          tx.installment_total &&
                          tx.installment_total > 1 && (
                            <span
                              className="ml-1 text-xs px-1 rounded"
                              style={{
                                background: 'var(--secondary)',
                                color: 'var(--muted-foreground)',
                              }}
                            >
                              {tx.installment_number}/{tx.installment_total}
                            </span>
                          )}
                      </span>
                      {tx.tags && tx.tags.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {tx.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="text-xs px-1.5 py-0.5 rounded-full"
                              style={{
                                background: tag.color + '22',
                                color: tag.color,
                                border: `1px solid ${tag.color}44`,
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="truncate block max-w-28">
                      {getCategoryName(tx.category_id)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    <span className="truncate block max-w-28">{getSourceName(tx)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className="text-xs px-2 py-0.5 rounded-full"
                      style={{
                        background: statusColor(tx.status) + '22',
                        color: statusColor(tx.status),
                      }}
                    >
                      {statusLabel(tx.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span
                      className="text-xs font-semibold mono"
                      style={{
                        color:
                          tx.type === 'income'
                            ? 'var(--primary)'
                            : tx.type === 'transfer'
                              ? 'var(--muted-foreground)'
                              : 'var(--danger)',
                      }}
                    >
                      {tx.type === 'income' ? '+' : tx.type === 'expense' ? '-' : ''}
                      {formatBRL(Math.abs(tx.amount))}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {tx.installment_id ? (
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        (parcela)
                      </span>
                    ) : (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => openEdit(tx)}
                          className="w-6 h-6 rounded flex items-center justify-center transition-opacity hover:opacity-70"
                          style={{ color: 'var(--muted-foreground)' }}
                          title="Editar transação"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => setConfirmDelete(tx.id!)}
                          className="w-6 h-6 rounded flex items-center justify-center transition-opacity hover:opacity-70"
                          style={{ color: 'var(--danger)' }}
                          title="Excluir transação"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-10 text-center text-sm"
                    style={{ color: 'var(--muted-foreground)' }}
                  >
                    Nenhuma transação encontrada
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de criação/edição */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,9,13,0.8)', backdropFilter: 'blur(4px)' }}
        >
          <div
            className="w-full max-w-lg rounded-xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="flex items-center justify-between px-6 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2 className="text-base font-semibold">
                {editingId ? 'Editar transação' : 'Nova transação'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={18} />
              </button>
            </div>
            <div className="p-6 flex flex-col gap-4">
              {/* Type tabs */}
              <div className="flex rounded-lg p-1 gap-1" style={{ background: 'var(--secondary)' }}>
                {[
                  ['expense', '↓ Despesa'],
                  ['income', '↑ Receita'],
                  ['transfer', '⇄ Transferência'],
                ].map(([t, l]) => (
                  <button
                    key={t}
                    onClick={() =>
                      setEditTx((p) => ({ ...p, type: t as 'income' | 'expense' | 'transfer' }))
                    }
                    className="flex-1 py-1.5 rounded-md text-xs font-medium transition-all"
                    style={{
                      background:
                        editTx.type === t
                          ? t === 'income'
                            ? 'var(--primary)'
                            : t === 'transfer'
                              ? 'var(--accent)'
                              : 'var(--danger)'
                          : 'transparent',
                      color: editTx.type === t ? '#fff' : 'var(--muted-foreground)',
                    }}
                  >
                    {l}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Data *
                  </label>
                  <input
                    type="date"
                    value={editTx.date}
                    onChange={(e) => setEditTx((p) => ({ ...p, date: e.target.value }))}
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Valor *
                  </label>
                  <input
                    type="number"
                    placeholder="0,00"
                    value={editTx.amount || ''}
                    onChange={(e) =>
                      setEditTx((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))
                    }
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Descrição *
                </label>
                <input
                  placeholder="Ex: Supermercado Extra"
                  value={editTx.description}
                  onChange={(e) => setEditTx((p) => ({ ...p, description: e.target.value }))}
                  className="w-full"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Conta/Caixinha/Cartão
                  </label>
                  <select
                    value={selectedSourceValue}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) {
                        setEditTx((p) => ({
                          ...p,
                          accountId: null,
                          jarId: null,
                          creditCardId: null,
                        }));
                        return;
                      }
                      const [type, id] = val.split('-');
                      if (type === 'account') {
                        setEditTx((p) => ({
                          ...p,
                          accountId: parseInt(id),
                          jarId: null,
                          creditCardId: null,
                        }));
                      } else if (type === 'jar') {
                        setEditTx((p) => ({
                          ...p,
                          jarId: parseInt(id),
                          accountId: null,
                          creditCardId: null,
                        }));
                      } else if (type === 'credit_card') {
                        setEditTx((p) => ({
                          ...p,
                          creditCardId: parseInt(id),
                          accountId: null,
                          jarId: null,
                        }));
                      }
                    }}
                    className="w-full"
                  >
                    <option value="">Nenhum (só pendente)</option>
                    {combinedSources.map((s) => (
                      <option key={`${s.sourceType}-${s.id}`} value={`${s.sourceType}-${s.id}`}>
                        {s.sourceType === 'account'
                          ? 'Conta'
                          : s.sourceType === 'jar'
                            ? 'Caixinha'
                            : 'Cartão'}
                        : {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                {editTx.type !== 'transfer' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Categoria
                    </label>
                    <select
                      className="w-full"
                      value={editTx.categoryId ?? ''}
                      onChange={(e) =>
                        setEditTx((p) => ({
                          ...p,
                          categoryId: e.target.value ? parseInt(e.target.value) : null,
                        }))
                      }
                    >
                      <option value="">Sem categoria</option>
                      {categories.map((cat) => (
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
                )}
                {editTx.type === 'transfer' && (
                  <div className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Destino
                    </label>
                    <select
                      className="w-full"
                      value={editTx.destAccountId ?? editTx.destJarId ?? ''}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (!val) {
                          setEditTx((p) => ({ ...p, destAccountId: null, destJarId: null }));
                          return;
                        }
                        const [type, id] = val.split('-');
                        if (type === 'account') {
                          setEditTx((p) => ({
                            ...p,
                            destAccountId: parseInt(id),
                            destJarId: null,
                          }));
                        } else if (type === 'jar') {
                          setEditTx((p) => ({
                            ...p,
                            destJarId: parseInt(id),
                            destAccountId: null,
                          }));
                        }
                      }}
                    >
                      <option value="">Selecione</option>
                      {accounts.map((a) => (
                        <option key={`account-${a.id}`} value={`account-${a.id}`}>
                          Conta: {a.name}
                        </option>
                      ))}
                      {jars
                        .filter((j) => j.id !== editTx.jarId)
                        .map((j) => (
                          <option key={`jar-${j.id}`} value={`jar-${j.id}`}>
                            Caixinha: {j.name}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Parcelas - apenas se creditCardId estiver preenchido */}
              {editTx.type === 'expense' && editTx.creditCardId && (
                <div
                  className="flex items-center gap-3 p-3 rounded-lg"
                  style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                >
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Parcelas
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={24}
                      value={installments}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 1;
                        setInstallments(val);
                        setEditTx((p) => ({
                          ...p,
                          installment_total: val,
                          installment_current: 1,
                        }));
                      }}
                      className="w-full"
                    />
                  </div>
                  <div className="flex flex-col gap-1 flex-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Valor por parcela
                    </label>
                    <p
                      className="text-sm mono font-semibold mt-2"
                      style={{ color: 'var(--primary)' }}
                    >
                      {installments > 1 ? formatBRL((editTx.amount || 0) / installments) : '—'}
                    </p>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Status
                  </label>
                  <select
                    value={editTx.status}
                    onChange={(e) =>
                      setEditTx((p) => ({
                        ...p,
                        status: e.target.value as 'pending' | 'confirmed' | 'cancelled',
                      }))
                    }
                    className="w-full"
                  >
                    <option value="pending">Pendente</option>
                    <option value="confirmed">Confirmada</option>
                    <option value="cancelled">Cancelada</option>
                  </select>
                  {editTx.status !== 'pending' &&
                    !editTx.accountId &&
                    !editTx.jarId &&
                    !editTx.creditCardId && (
                      <p className="text-xs text-danger mt-1" style={{ color: 'var(--danger)' }}>
                        Para confirmar ou cancelar, selecione uma conta, caixinha ou cartão.
                      </p>
                    )}
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Recorrência
                  </label>
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
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Etiquetas
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {availableTags.map((tag) => {
                    const selected = editTx.tagIds.includes(tag.id);
                    return (
                      <button
                        key={tag.id}
                        onClick={() => {
                          setEditTx((p) => ({
                            ...p,
                            tagIds: selected
                              ? p.tagIds.filter((id) => id !== tag.id)
                              : [...p.tagIds, tag.id],
                          }));
                        }}
                        className="text-xs px-2 py-0.5 rounded-full transition-all"
                        style={{
                          background: selected ? tag.color + '33' : 'var(--secondary)',
                          color: selected ? tag.color : 'var(--muted-foreground)',
                          border: `1px solid ${selected ? tag.color + '66' : 'var(--border)'}`,
                        }}
                      >
                        {tag.name}
                      </button>
                    );
                  })}
                  {availableTags.length === 0 && (
                    <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Nenhuma etiqueta cadastrada. Crie uma em "Etiquetas".
                    </span>
                  )}
                </div>
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
                className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                {editingId ? 'Salvar alterações' : 'Adicionar transação'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Delete */}
      {confirmDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(7,9,13,0.8)' }}
        >
          <div
            className="w-80 rounded-xl p-6"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <h3 className="font-semibold mb-2">Excluir transação</h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
              Esta ação não pode ser desfeita. A transação será removida permanentemente.
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
                onClick={() => del(confirmDelete)}
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
