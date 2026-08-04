import { useState, useEffect } from 'react';
import { Plus, X, Pencil, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatBRL } from '../data/mock';
import { categoryService, Category } from '../services/categoryService';
import { budgetService, Budget } from '../services/budgetService';

export default function Budgets() {
  const { token } = useAuth();
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  });

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ categoryId: 1, budgeted: '' });
  const [editingId, setEditingId] = useState<number | null>(null);

  const loadData = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const [cats, budgetsData] = await Promise.all([
        categoryService.getAll(token),
        budgetService.getAll(token, { month: selectedMonth }),
      ]);
      setCategories(cats);
      setBudgets(budgetsData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [token, selectedMonth]);

  const totalBudgeted = budgets.reduce((s, b) => s + b.budgeted_amount, 0);
  const totalSpent = budgets.reduce((s, b) => s + (b.spent || 0), 0);

  const progressColor = (pct: number) => {
    if (pct >= 100) return 'var(--danger)';
    if (pct >= 85) return 'var(--warning)';
    return 'var(--primary)';
  };

  const save = async () => {
    if (!token) return;
    try {
      const payload = {
        category_id: form.categoryId,
        month: selectedMonth,
        budgeted_amount: parseFloat(form.budgeted.replace(',', '.')) || 0,
      };
      if (editingId) {
        await budgetService.update(editingId, payload, token);
      } else {
        await budgetService.create(payload, token);
      }
      setShowModal(false);
      await loadData();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const openEdit = (budget: Budget) => {
    setForm({
      categoryId: budget.category_id,
      budgeted: String(budget.budgeted_amount),
    });
    setEditingId(budget.id);
    setShowModal(true);
  };

  const removeBudget = async (id: number) => {
    if (!token) return;
    if (!confirm('Remover este orçamento?')) return;
    try {
      await budgetService.delete(id, token);
      await loadData();
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
        Erro ao carregar orçamentos: {error}
      </div>
    );
  }

  const totalPct = totalBudgeted > 0 ? (totalSpent / totalBudgeted) * 100 : 0;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>
            Orçamentos
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            Controle de gastos por categoria
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Seletor de mês */}
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="text-sm"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
          />
          <button
            onClick={() => {
              const defaultCategory = categories.find((c) => c.type === 'expense');
              setForm({
                categoryId: defaultCategory?.id || 1,
                budgeted: '',
              });
              setEditingId(null);
              setShowModal(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <Plus size={14} /> Definir orçamento
          </button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total orçado', value: formatBRL(totalBudgeted), color: 'var(--foreground)' },
          {
            label: 'Total gasto',
            value: formatBRL(totalSpent),
            color: totalSpent > totalBudgeted ? 'var(--danger)' : 'var(--warning)',
          },
          {
            label: 'Disponível',
            value: formatBRL(Math.max(0, totalBudgeted - totalSpent)),
            color: 'var(--primary)',
          },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <p className="text-xs mb-2" style={{ color: 'var(--muted-foreground)' }}>
              {label}
            </p>
            <p className="text-xl font-bold mono" style={{ color, letterSpacing: '-0.04em' }}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div
        className="p-5 rounded-xl mb-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex justify-between text-sm mb-2">
          <span className="font-medium">Progresso geral do mês</span>
          <span className="mono" style={{ color: progressColor(totalPct) }}>
            {totalPct.toFixed(0)}%
          </span>
        </div>
        <div
          className="w-full h-3 rounded-full overflow-hidden"
          style={{ background: 'var(--secondary)' }}
        >
          <div
            className="h-full rounded-full transition-all"
            style={{
              width: `${Math.min(totalPct, 100)}%`,
              background: progressColor(totalPct),
            }}
          />
        </div>
        <div
          className="flex justify-between text-xs mt-2"
          style={{ color: 'var(--muted-foreground)' }}
        >
          <span>{formatBRL(totalSpent)} gasto</span>
          <span>{formatBRL(totalBudgeted)} orçado</span>
        </div>
      </div>

      {/* Budget cards */}
      <div className="flex flex-col gap-3">
        {budgets.map((b) => {
          const spent = b.spent || 0;
          const pct = b.budgeted_amount > 0 ? (spent / b.budgeted_amount) * 100 : 0;
          const color = progressColor(pct);
          const overBudget = pct >= 100;
          const categoryName =
            categories.find((c) => c.id === b.category_id)?.name || `Categoria ${b.category_id}`;
          const categoryColor = categories.find((c) => c.id === b.category_id)?.color || '#6366f1';

          return (
            <div
              key={b.id}
              className="rounded-xl p-5"
              style={{
                background: 'var(--card)',
                border: `1px solid ${overBudget ? 'rgba(239,68,68,0.3)' : 'var(--border)'}`,
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: categoryColor }} />
                  <span className="text-sm font-semibold">{categoryName}</span>
                  {overBudget && (
                    <span
                      className="flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(239,68,68,0.15)', color: 'var(--danger)' }}
                    >
                      <AlertTriangle size={10} /> Estouro
                    </span>
                  )}
                  {pct >= 85 && pct < 100 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--warning)' }}
                    >
                      Atenção
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3 text-right">
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Gasto
                    </p>
                    <p className="text-sm font-bold mono" style={{ color }}>
                      {formatBRL(spent)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Orçado
                    </p>
                    <p className="text-sm font-bold mono">{formatBRL(b.budgeted_amount)}</p>
                  </div>
                  <div>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Disponível
                    </p>
                    <p
                      className="text-sm font-bold mono"
                      style={{
                        color: b.budgeted_amount - spent < 0 ? 'var(--danger)' : 'var(--primary)',
                      }}
                    >
                      {formatBRL(Math.abs(b.budgeted_amount - spent))}
                    </p>
                  </div>
                  <div className="flex gap-1">
                    <button
                      onClick={() => openEdit(b)}
                      className="w-6 h-6 rounded flex items-center justify-center transition-opacity hover:opacity-70"
                      style={{ color: 'var(--muted-foreground)' }}
                      title="Editar orçamento"
                    >
                      <Pencil size={12} />
                    </button>
                    <button
                      onClick={() => removeBudget(b.id)}
                      className="w-6 h-6 rounded flex items-center justify-center transition-opacity hover:opacity-70"
                      style={{ color: 'var(--danger)' }}
                      title="Remover orçamento"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
              <div
                className="w-full h-2 rounded-full overflow-hidden"
                style={{ background: 'var(--secondary)' }}
              >
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${Math.min(pct, 100)}%`, background: color }}
                />
              </div>
              <div
                className="flex justify-between text-xs mt-1.5"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <span>{pct.toFixed(0)}% comprometido</span>
                {overBudget && (
                  <span style={{ color: 'var(--danger)' }}>
                    +{formatBRL(spent - b.budgeted_amount)} acima do limite
                  </span>
                )}
              </div>
            </div>
          );
        })}
        {budgets.length === 0 && (
          <div className="text-center py-10" style={{ color: 'var(--muted-foreground)' }}>
            Nenhum orçamento definido para este mês.
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
            className="w-96 rounded-xl overflow-hidden"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2 className="font-semibold text-sm">
                {editingId ? 'Editar orçamento' : 'Definir orçamento'} — {selectedMonth.slice(0, 7)}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Categoria (apenas Despesas)
                </label>
                <select
                  value={form.categoryId}
                  onChange={(e) => setForm((p) => ({ ...p, categoryId: parseInt(e.target.value) }))}
                  className="w-full"
                >
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
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Valor limite (R$)
                </label>
                <input
                  type="number"
                  placeholder="0,00"
                  value={form.budgeted}
                  onChange={(e) => setForm((p) => ({ ...p, budgeted: e.target.value }))}
                  className="w-full"
                />
              </div>
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
                {editingId ? 'Salvar' : 'Definir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
