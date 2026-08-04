import { useState, useEffect } from 'react';
import {
  Plus,
  X,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  LayoutGrid,
  Columns,
  Archive,
  RotateCcw,
  History,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { formatBRL } from '../data/mock';
import { goalService, Goal, GoalContribution } from '../services/goalService';

type GoalStatus = 'active' | 'completed' | 'delayed' | 'archived';
type GoalPriority = 'low' | 'medium' | 'high' | 'urgent';

const priorityColors: Record<GoalPriority, string> = {
  low: '#3b82f6',
  medium: '#f59e0b',
  high: '#f97316',
  urgent: '#ef4444',
};
const priorityLabels: Record<GoalPriority, string> = {
  low: 'Baixa',
  medium: 'Média',
  high: 'Alta',
  urgent: 'Urgente',
};
const typeLabels: Record<string, string> = {
  emergency: 'Fundo de Emergência',
  opportunity: 'Reserva de Oportunidade',
  travel: 'Viagem/Lazer',
  material: 'Bens Materiais',
  education: 'Educação',
  investment: 'Investimentos',
  free: 'Livre',
};

const statusLabels: Record<GoalStatus, string> = {
  active: 'Em andamento',
  completed: 'Concluída',
  delayed: 'Atrasada',
  archived: 'Arquivada',
};

export default function Goals() {
  const { token } = useAuth();
  const [goals, setGoals] = useState<Goal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'kanban'>('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [detailGoal, setDetailGoal] = useState<Goal | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'history' | 'settings'>('overview');
  const [showArchived, setShowArchived] = useState(false);
  const [contributions, setContributions] = useState<GoalContribution[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'free' as Goal['type'],
    target_amount: '',
    color: '#10b981',
    icon: '🎯',
    priority: 'medium' as GoalPriority,
    description: '',
    target_date: '',
    annual_yield: '',
    status: 'active' as GoalStatus,
  });

  const loadGoals = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const status = showArchived ? 'archived' : 'active';
      const data = await goalService.getAll(token, { status });
      setGoals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGoals();
  }, [token, showArchived]);

  const openNew = () => {
    setForm({
      name: '',
      type: 'free',
      target_amount: '',
      color: '#10b981',
      icon: '🎯',
      priority: 'medium',
      description: '',
      target_date: '',
      annual_yield: '',
      status: 'active',
    });
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (goal: Goal) => {
    setForm({
      name: goal.name,
      type: goal.type,
      target_amount: String(goal.target_amount),
      color: goal.color,
      icon: goal.icon || '🎯',
      priority: goal.priority,
      description: goal.description || '',
      target_date: goal.target_date || '',
      annual_yield: String(goal.annual_yield || ''),
      status: goal.status,
    });
    setEditingId(goal.id);
    setShowModal(true);
  };

  const save = async () => {
    if (!token) return;
    try {
      const payload = {
        name: form.name,
        type: form.type,
        target_amount: parseFloat(form.target_amount) || 0,
        color: form.color,
        icon: form.icon || '🎯',
        priority: form.priority,
        description: form.description || undefined,
        target_date: form.target_date || undefined,
        annual_yield: parseFloat(form.annual_yield) || 0,
        status: form.status,
      };
      if (editingId) {
        await goalService.update(editingId, payload, token);
      } else {
        await goalService.create(payload, token);
      }
      setShowModal(false);
      await loadGoals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const archiveGoal = async (id: number) => {
    if (!token) return;
    if (!confirm('Arquivar esta meta? Ela não aparecerá na lista principal.')) return;
    try {
      await goalService.archive(id, token);
      await loadGoals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const unarchiveGoal = async (id: number) => {
    if (!token) return;
    try {
      await goalService.update(id, { status: 'active' }, token);
      await loadGoals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const deleteGoal = async (id: number) => {
    if (!token) return;
    if (!confirm('Excluir esta meta permanentemente? Esta ação não pode ser desfeita.')) return;
    try {
      await goalService.delete(id, token);
      await loadGoals();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const viewDetails = async (goal: Goal) => {
    setDetailGoal(goal);
    setDetailTab('overview');
    // Carrega histórico ao abrir
    if (token) {
      try {
        setLoadingHistory(true);
        const data = await goalService.getContributions(goal.id, token);
        setContributions(data);
      } catch (err: any) {
        console.error('Erro ao carregar histórico:', err);
        setContributions([]);
      } finally {
        setLoadingHistory(false);
      }
    }
  };

  const handleUpdateValue = async (goalId: number, newTotal: number) => {
    if (!token) return;
    try {
      await goalService.addContribution(goalId, { newTotal }, token);
      await loadGoals();
      // Atualiza o modal se estiver aberto
      if (detailGoal && detailGoal.id === goalId) {
        const updated = await goalService.getOne(goalId, token);
        setDetailGoal(updated);
        // Recarrega histórico
        const hist = await goalService.getContributions(goalId, token);
        setContributions(hist);
      }
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
        Erro ao carregar metas: {error}
      </div>
    );
  }

  const ProgressRing = ({ goal }: { goal: Goal }) => {
    const pct = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
    const r = 42,
      circ = 2 * Math.PI * r;
    const offset = circ - (pct / 100) * circ;
    return (
      <div className="relative" style={{ width: 100, height: 100 }}>
        <svg className="progress-ring" width="100" height="100">
          <circle cx="50" cy="50" r={r} fill="none" stroke="var(--secondary)" strokeWidth="7" />
          <circle
            cx="50"
            cy="50"
            r={r}
            fill="none"
            stroke={goal.color}
            strokeWidth="7"
            strokeDasharray={circ}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold mono" style={{ letterSpacing: '-0.04em' }}>
            {Math.round(pct)}%
          </span>
        </div>
      </div>
    );
  };

  const isArchived = (status: string) => status === 'archived';

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>
            Metas Financeiras
          </h1>
          <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>
            {goals.length} metas · {formatBRL(goals.reduce((s, g) => s + g.current_amount, 0))}{' '}
            acumulados
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowArchived(!showArchived)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-opacity hover:opacity-80`}
            style={{
              background: showArchived ? 'rgba(99,102,241,0.15)' : 'var(--card)',
              border: '1px solid var(--border)',
              color: showArchived ? 'var(--accent)' : 'var(--secondary-foreground)',
            }}
          >
            <Archive size={14} />
            {showArchived ? 'Ver ativas' : 'Ver arquivadas'}
          </button>
          <div
            className="flex rounded-lg overflow-hidden"
            style={{ border: '1px solid var(--border)' }}
          >
            {[
              ['grid', LayoutGrid],
              ['kanban', Columns],
            ].map(([v, Icon]: any) => (
              <button
                key={v}
                onClick={() => setView(v)}
                className="px-2.5 py-1.5 transition-colors"
                style={{
                  background: view === v ? 'var(--primary)' : 'var(--card)',
                  color: view === v ? '#fff' : 'var(--muted-foreground)',
                }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
          <button
            onClick={openNew}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            <Plus size={14} /> Nova meta
          </button>
        </div>
      </div>

      {/* Goals Grid */}
      <div className={`grid gap-4 ${view === 'grid' ? 'grid-cols-2' : 'grid-cols-3'}`}>
        {goals.map((goal) => {
          const days = goal.days_remaining;
          const isArchivedGoal = isArchived(goal.status);
          return (
            <div
              key={goal.id}
              className={`rounded-xl p-5 group transition-all ${!isArchivedGoal ? 'cursor-pointer hover:-translate-y-px' : 'opacity-70'}`}
              style={{
                background: 'var(--card)',
                border: `1px solid ${isArchivedGoal ? 'rgba(99,102,241,0.2)' : 'var(--border)'}`,
                boxShadow: '0 0 0 0px var(--primary)',
              }}
              onClick={() => !isArchivedGoal && viewDetails(goal)}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{goal.icon}</span>
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full"
                      style={{
                        background: priorityColors[goal.priority] + '22',
                        color: priorityColors[goal.priority],
                      }}
                    >
                      {priorityLabels[goal.priority]}
                    </span>
                    {isArchivedGoal && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(99,102,241,0.15)', color: 'var(--accent)' }}
                      >
                        Arquivada
                      </span>
                    )}
                    {goal.status === 'completed' && !isArchivedGoal && (
                      <span
                        className="text-xs px-1.5 py-0.5 rounded-full"
                        style={{ background: 'rgba(16,185,129,0.15)', color: 'var(--primary)' }}
                      >
                        Concluída
                      </span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold">{goal.name}</h3>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {typeLabels[goal.type] || goal.type}
                  </p>
                </div>
                <ProgressRing goal={goal} />
              </div>

              <div className="mb-3">
                <div className="flex justify-between text-xs mb-1.5">
                  <span style={{ color: 'var(--muted-foreground)' }}>Acumulado</span>
                  <span className="mono font-semibold" style={{ color: goal.color }}>
                    {formatBRL(goal.current_amount)}
                  </span>
                </div>
                <div
                  className="w-full h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--secondary)' }}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min((goal.current_amount / goal.target_amount) * 100, 100)}%`,
                      background: goal.color,
                    }}
                  />
                </div>
                <div className="flex justify-between text-xs mt-1">
                  <span style={{ color: 'var(--muted-foreground)' }}>
                    Faltam:{' '}
                    <span className="font-medium" style={{ color: 'var(--foreground)' }}>
                      {formatBRL(goal.target_amount - goal.current_amount)}
                    </span>
                  </span>
                  <span style={{ color: 'var(--muted-foreground)' }}>
                    Meta: {formatBRL(goal.target_amount)}
                  </span>
                </div>
              </div>

              {goal.target_date && (
                <div
                  className="flex items-center gap-1.5 text-xs"
                  style={{
                    color:
                      days !== undefined && days !== null && days < 30
                        ? 'var(--warning)'
                        : 'var(--muted-foreground)',
                  }}
                >
                  <Calendar size={11} />
                  {days !== undefined && days !== null && days > 0
                    ? `${days} dias restantes`
                    : days === 0
                      ? 'Vence hoje'
                      : days !== null && days !== undefined && days < 0
                        ? 'Vencida'
                        : ''}
                  {goal.target_date &&
                    ` · ${goal.target_date.slice(0, 7).split('-').reverse().join('/')}`}
                </div>
              )}

              <div className="mt-3 flex gap-2">
                {!isArchivedGoal && (
                  <button
                    className="flex-1 py-1.5 rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{
                      background: goal.color + '22',
                      color: goal.color,
                      border: `1px solid ${goal.color}44`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newAmount = prompt(
                        'Digite o novo valor acumulado (R$):',
                        String(goal.current_amount)
                      );
                      if (newAmount !== null) {
                        const val = parseFloat(newAmount.replace(',', '.'));
                        if (!isNaN(val) && val >= 0) {
                          handleUpdateValue(goal.id, val);
                        }
                      }
                    }}
                  >
                    Atualizar valor
                  </button>
                )}
                <button
                  className="px-2 py-1 rounded-lg text-xs transition-opacity hover:opacity-70"
                  style={{ color: 'var(--muted-foreground)' }}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isArchivedGoal) {
                      unarchiveGoal(goal.id);
                    } else {
                      archiveGoal(goal.id);
                    }
                  }}
                >
                  {isArchivedGoal ? <RotateCcw size={12} /> : <Archive size={12} />}
                </button>
                {isArchivedGoal && (
                  <button
                    className="px-2 py-1 rounded-lg text-xs transition-opacity hover:opacity-70"
                    style={{ color: 'var(--danger)' }}
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGoal(goal.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
        {goals.length === 0 && (
          <div
            className="col-span-full text-center py-10"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {showArchived
              ? 'Nenhuma meta arquivada.'
              : 'Nenhuma meta cadastrada. Clique em "Nova meta" para começar.'}
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
              className="flex items-center justify-between px-5 py-4 border-b"
              style={{ borderColor: 'var(--border)' }}
            >
              <h2 className="font-semibold text-sm">{editingId ? 'Editar meta' : 'Nova meta'}</h2>
              <button
                onClick={() => setShowModal(false)}
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={16} />
              </button>
            </div>
            <div className="p-5 flex flex-col gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Nome *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Viagem para Europa"
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
                    value={form.target_amount}
                    onChange={(e) => setForm((p) => ({ ...p, target_amount: e.target.value }))}
                    placeholder="0,00"
                    className="w-full"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Data alvo
                  </label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm((p) => ({ ...p, target_date: e.target.value }))}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Tipo
                  </label>
                  <select
                    value={form.type}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, type: e.target.value as Goal['type'] }))
                    }
                    className="w-full"
                  >
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Prioridade
                  </label>
                  <select
                    value={form.priority}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, priority: e.target.value as GoalPriority }))
                    }
                    className="w-full"
                  >
                    {Object.entries(priorityLabels).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Ícone
                </label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}
                  placeholder="🎯"
                  className="w-full"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Descrição
                </label>
                <textarea
                  rows={2}
                  value={form.description}
                  onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
                  className="w-full resize-none"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                  Cor
                </label>
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))}
                  className="h-9 w-full rounded cursor-pointer"
                />
              </div>
              {editingId && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, status: e.target.value as GoalStatus }))
                    }
                    className="w-full"
                  >
                    <option value="active">Em andamento</option>
                    <option value="completed">Concluída</option>
                    <option value="delayed">Atrasada</option>
                    <option value="archived">Arquivada</option>
                  </select>
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
                {editingId ? 'Salvar' : 'Criar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalhes (apenas para metas não arquivadas) */}
      {detailGoal && !isArchived(detailGoal.status) && (
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
              <div className="flex items-center gap-2">
                <span className="text-xl">{detailGoal.icon}</span>
                <div>
                  <h2 className="font-semibold">{detailGoal.name}</h2>
                  <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                    {typeLabels[detailGoal.type] || detailGoal.type}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDetailGoal(null)}
                style={{ color: 'var(--muted-foreground)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex gap-4 px-6 pt-4 shrink-0">
              {[
                ['overview', 'Visão Geral'],
                ['history', 'Histórico'],
                ['settings', 'Ajustes'],
              ].map(([t, l]) => (
                <button
                  key={t}
                  onClick={() => setDetailTab(t as any)}
                  className="text-sm pb-2 border-b-2 transition-colors"
                  style={{
                    borderColor: detailTab === t ? 'var(--primary)' : 'transparent',
                    color: detailTab === t ? 'var(--primary)' : 'var(--muted-foreground)',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {detailTab === 'overview' && (
                <div className="flex flex-col gap-5">
                  <div className="flex items-center gap-6">
                    <ProgressRing goal={detailGoal} />
                    <div className="flex-1">
                      <div className="flex justify-between mb-2">
                        <div>
                          <p
                            className="text-xs mb-0.5"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            Acumulado
                          </p>
                          <p
                            className="text-2xl font-bold mono"
                            style={{ color: detailGoal.color, letterSpacing: '-0.04em' }}
                          >
                            {formatBRL(detailGoal.current_amount)}
                          </p>
                        </div>
                        <div className="text-right">
                          <p
                            className="text-xs mb-0.5"
                            style={{ color: 'var(--muted-foreground)' }}
                          >
                            Meta total
                          </p>
                          <p
                            className="text-2xl font-bold mono"
                            style={{ letterSpacing: '-0.04em' }}
                          >
                            {formatBRL(detailGoal.target_amount)}
                          </p>
                        </div>
                      </div>
                      <div
                        className="w-full h-3 rounded-full overflow-hidden"
                        style={{ background: 'var(--secondary)' }}
                      >
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${Math.min((detailGoal.current_amount / detailGoal.target_amount) * 100, 100)}%`,
                            background: detailGoal.color,
                          }}
                        />
                      </div>
                      <p className="text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
                        Faltam{' '}
                        <strong style={{ color: 'var(--foreground)' }}>
                          {formatBRL(detailGoal.target_amount - detailGoal.current_amount)}
                        </strong>{' '}
                        para concluir
                      </p>
                    </div>
                  </div>

                  {detailGoal.description && (
                    <div
                      className="p-4 rounded-xl text-sm"
                      style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                    >
                      {detailGoal.description}
                    </div>
                  )}

                  <div
                    className="p-4 rounded-xl"
                    style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
                  >
                    <p
                      className="text-xs font-semibold mb-2"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      Atualizar valor acumulado
                    </p>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        placeholder="Novo valor"
                        defaultValue={detailGoal.current_amount}
                        className="flex-1"
                        id="goal-current-amount"
                      />
                      <button
                        className="px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
                        style={{ background: 'var(--primary)', color: '#fff' }}
                        onClick={async () => {
                          const input = document.getElementById(
                            'goal-current-amount'
                          ) as HTMLInputElement;
                          const val = parseFloat(input.value.replace(',', '.'));
                          if (!isNaN(val) && val >= 0) {
                            await handleUpdateValue(detailGoal.id, val);
                            // Recarrega detalhe e histórico
                            const updated = await goalService.getOne(detailGoal.id, token!);
                            setDetailGoal(updated);
                            const hist = await goalService.getContributions(detailGoal.id, token!);
                            setContributions(hist);
                          }
                        }}
                      >
                        Atualizar
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {detailTab === 'history' && (
                <div className="flex flex-col gap-3">
                  <h3 className="text-sm font-semibold">Histórico de Aportes</h3>
                  {loadingHistory ? (
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Carregando...
                    </p>
                  ) : contributions.length === 0 ? (
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Nenhuma contribuição registrada ainda.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {contributions.map((c) => (
                        <div
                          key={c.id}
                          className="flex items-center justify-between p-3 rounded-lg"
                          style={{
                            background: 'var(--secondary)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          <div>
                            <p className="text-xs font-medium">
                              {c.amount > 0 ? 'Aporte' : 'Resgate'}
                            </p>
                            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                              {c.date.split('-').reverse().join('/')}
                              {c.note && ` · ${c.note}`}
                            </p>
                          </div>
                          <span
                            className="text-sm mono font-semibold"
                            style={{ color: c.amount > 0 ? 'var(--primary)' : 'var(--danger)' }}
                          >
                            {c.amount > 0 ? '+' : ''}
                            {formatBRL(c.amount)}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {detailTab === 'settings' && (
                <div className="flex flex-col gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                      Nome
                    </label>
                    <input defaultValue={detailGoal.name} className="w-full" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Valor total
                      </label>
                      <input
                        type="number"
                        defaultValue={detailGoal.target_amount}
                        className="w-full"
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                        Data alvo
                      </label>
                      <input
                        type="date"
                        defaultValue={detailGoal.target_date || ''}
                        className="w-full"
                      />
                    </div>
                  </div>
                  <button
                    className="w-full py-2.5 rounded-lg text-sm font-medium mt-2"
                    style={{ background: 'var(--primary)', color: '#fff' }}
                    onClick={async () => {
                      // Implementar edição rápida
                      alert('Funcionalidade em breve');
                    }}
                  >
                    Salvar ajustes
                  </button>
                  <button
                    className="w-full py-2 text-sm"
                    style={{ color: 'var(--danger)' }}
                    onClick={() => {
                      if (confirm('Arquivar esta meta? Ela não aparecerá na lista principal.')) {
                        archiveGoal(detailGoal.id);
                        setDetailGoal(null);
                      }
                    }}
                  >
                    Arquivar meta
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
