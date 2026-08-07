import { useState, useEffect, useCallback } from 'react';
import {
  X,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Loader2,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { accountService, Account } from '../services/accountService';
import { formatBRL } from '../data/mock';

interface TransactionWithBalance {
  id: number;
  date: string;
  description: string;
  type: 'income' | 'expense' | 'transfer';
  amount: number;
  category_id?: number | null;
  account_id?: number | null;
  dest_account_id?: number | null;
  running_balance: number;
  impact: number;
  tags?: any[];
}

interface Props {
  accountId: number;
  accountName: string;
  onClose: () => void;
}

export default function AccountStatement({ accountId, accountName, onClose }: Props) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<TransactionWithBalance[]>([]);
  const [initialBalance, setInitialBalance] = useState(0);
  const [finalBalance, setFinalBalance] = useState(0);
  const [account, setAccount] = useState<Account | null>(null);

  // Filtros
  const [filterType, setFilterType] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const loadStatement = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      const params: any = {};
      if (filterType !== 'all') params.type = filterType;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      const data = await accountService.getTransactions(accountId, token, params);
      setAccount(data.account);
      setTransactions(data.transactions);
      setInitialBalance(data.initial_balance);
      setFinalBalance(data.final_balance);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [accountId, token, filterType, startDate, endDate]);

  useEffect(() => {
    loadStatement();
  }, [loadStatement]);

  const handleClearFilters = () => {
    setFilterType('all');
    setStartDate('');
    setEndDate('');
  };

  if (error) {
    return (
      <div className="p-6 text-center" style={{ color: 'var(--danger)' }}>
        Erro ao carregar extrato: {error}
      </div>
    );
  }

  const getTypeIcon = (type: string, impact: number) => {
    if (type === 'income') return <TrendingUp size={14} style={{ color: 'var(--primary)' }} />;
    if (type === 'expense') return <TrendingDown size={14} style={{ color: 'var(--danger)' }} />;
    if (type === 'transfer') {
      return <ArrowLeftRight size={14} style={{ color: 'var(--accent)' }} />;
    }
    return null;
  };

  const getAmountColor = (impact: number) => {
    if (impact > 0) return 'var(--primary)';
    if (impact < 0) return 'var(--danger)';
    return 'var(--muted-foreground)';
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(7,9,13,0.85)', backdropFilter: 'blur(6px)' }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-4xl rounded-xl overflow-hidden flex flex-col"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          maxHeight: '85vh',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 border-b shrink-0"
          style={{ borderColor: 'var(--border)' }}
        >
          <div>
            <h2 className="font-semibold">Extrato - {account?.name || accountName}</h2>
            <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
              {transactions.length} transações · Saldo atual:{' '}
              <span
                className="font-bold"
                style={{ color: finalBalance >= 0 ? 'var(--primary)' : 'var(--danger)' }}
              >
                {finalBalance < 0 ? '-' : ''}
                {formatBRL(Math.abs(finalBalance))}
              </span>
            </p>
          </div>
          <button onClick={onClose} style={{ color: 'var(--muted-foreground)' }}>
            <X size={18} />
          </button>
        </div>

        {/* Filtros */}
        <div className="px-6 py-3 border-b shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5">
              <Filter size={14} style={{ color: 'var(--muted-foreground)' }} />
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
              >
                <option value="all">Todos os tipos</option>
                <option value="income">Receitas</option>
                <option value="expense">Despesas</option>
                <option value="transfer">Transferências</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <Calendar size={14} style={{ color: 'var(--muted-foreground)' }} />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-sm"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
              />
              <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>
                a
              </span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-sm"
                style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
              />
            </div>

            <button
              onClick={handleClearFilters}
              className="text-xs px-2.5 py-1 rounded-lg transition-opacity hover:opacity-70"
              style={{ color: 'var(--muted-foreground)', border: '1px solid var(--border)' }}
            >
              Limpar filtros
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 relative">
          {/* Loading overlay */}
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-sm z-10">
              <Loader2 size={32} className="animate-spin" style={{ color: 'var(--primary)' }} />
            </div>
          )}

          {/* Saldo inicial */}
          <div
            className="flex justify-between items-center p-3 rounded-lg mb-4"
            style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}
          >
            <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
              Saldo inicial do período
            </span>
            <span className="font-mono font-semibold" style={{ color: 'var(--foreground)' }}>
              {initialBalance < 0 ? '-' : ''}
              {formatBRL(Math.abs(initialBalance))}
            </span>
          </div>

          {/* Lista de transações */}
          <div className="flex flex-col gap-2">
            {transactions.length === 0 ? (
              <div className="text-center py-8" style={{ color: 'var(--muted-foreground)' }}>
                Nenhuma transação encontrada com os filtros atuais.
              </div>
            ) : (
              transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/30 transition-colors"
                  style={{ border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center gap-2">{getTypeIcon(tx.type, tx.impact)}</div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tx.description}</p>
                    <div
                      className="flex items-center gap-3 text-xs"
                      style={{ color: 'var(--muted-foreground)' }}
                    >
                      <span className="flex items-center gap-1">
                        <Calendar size={11} /> {tx.date.slice(0, 10).split('-').reverse().join('/')}
                      </span>
                      {tx.tags && tx.tags.length > 0 && (
                        <span className="flex gap-1 flex-wrap">
                          {tx.tags.map((tag) => (
                            <span
                              key={tag.id}
                              className="px-1.5 py-0.5 rounded-full text-[10px]"
                              style={{ background: tag.color + '22', color: tag.color }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className="text-sm font-mono font-semibold"
                      style={{ color: getAmountColor(tx.impact) }}
                    >
                      {tx.impact > 0 ? '+' : ''}
                      {formatBRL(tx.amount)}
                    </span>
                    <p className="text-xs font-mono" style={{ color: 'var(--muted-foreground)' }}>
                      Saldo: {formatBRL(tx.running_balance)}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
