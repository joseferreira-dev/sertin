import { useState } from 'react';
import {
  LayoutDashboard, ListOrdered, Wallet, Tag, Bookmark,
  BarChart3, Target, FileText, ArrowLeftRight, Settings,
  Bell, Search, LogOut, TrendingUp, ChevronRight, Lock,
  Plus
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export type Page =
  | 'dashboard' | 'transactions' | 'accounts' | 'categories'
  | 'tags' | 'budgets' | 'goals' | 'reports' | 'import-export' | 'settings';

interface Props {
  currentPage: Page;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
  children: React.ReactNode;
}

const nav = [
  { id: 'dashboard', label: 'Dashboard', Icon: LayoutDashboard },
  { id: 'transactions', label: 'Extrato', Icon: ListOrdered },
  { id: 'accounts', label: 'Contas', Icon: Wallet },
  { id: 'categories', label: 'Categorias', Icon: Tag },
  { id: 'tags', label: 'Etiquetas', Icon: Bookmark },
  { id: 'budgets', label: 'Orçamentos', Icon: BarChart3 },
  { id: 'goals', label: 'Metas', Icon: Target },
  { id: 'reports', label: 'Relatórios', Icon: FileText },
  { id: 'import-export', label: 'Importar/Exportar', Icon: ArrowLeftRight },
  { id: 'settings', label: 'Configurações', Icon: Settings },
];

export default function Layout({ currentPage, onNavigate, onLogout, children }: Props) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [showLockOverlay, setShowLockOverlay] = useState(false);
  const [lockPw, setLockPw] = useState('');
  const [lockError, setLockError] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U';

  const unlock = () => {
    if (lockPw === '123456' || lockPw === 'senha') {
      setShowLockOverlay(false);
      setLockPw('');
      setLockError(false);
    } else {
      setLockError(true);
    }
  };

  return (
    <div className="flex min-h-screen" style={{ background: 'var(--background)' }}>
      {/* Sidebar */}
      <aside
        className="flex flex-col h-screen sticky top-0 transition-all duration-200 flex-shrink-0"
        style={{
          width: collapsed ? 58 : 220,
          background: 'var(--card)',
          borderRight: '1px solid var(--border)',
        }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-4 h-14 border-b flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: 'var(--primary)' }}>
            <TrendingUp size={14} color="#fff" />
          </div>
          {!collapsed && <span className="font-bold text-base tracking-tight" style={{ letterSpacing: '-0.03em' }}>Sertin</span>}
        </div>

        {/* Nav */}
        <nav className="flex-1 py-3 overflow-y-auto">
          {nav.map(({ id, label, Icon }) => {
            const active = currentPage === id;
            return (
              <button
                key={id}
                onClick={() => onNavigate(id as Page)}
                className="w-full flex items-center gap-2.5 px-4 py-2 text-sm font-medium transition-all hover:bg-secondary/50 relative"
                style={{
                  color: active ? 'var(--primary)' : 'var(--secondary-foreground)',
                  background: active ? 'rgba(16,185,129,0.08)' : 'transparent',
                  borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
                }}
                title={collapsed ? label : undefined}
              >
                <Icon size={15} className="flex-shrink-0" />
                {!collapsed && <span>{label}</span>}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div className="border-t p-3 flex-shrink-0" style={{ borderColor: 'var(--border)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--primary)', color: '#fff' }}>
              {initials}
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{user?.name || 'Usuário'}</p>
                <p className="text-xs truncate" style={{ color: 'var(--muted-foreground)' }}>{user?.email || ''}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <div className="flex gap-1 mt-2">
              <button
                onClick={() => setShowLockOverlay(true)}
                className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <Lock size={12} /> Bloquear
              </button>
              <button
                onClick={onLogout}
                className="flex-1 flex items-center justify-center gap-1 p-1.5 rounded text-xs transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted-foreground)' }}
              >
                <LogOut size={12} /> Sair
              </button>
            </div>
          )}
        </div>

        {/* Collapse toggle */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="absolute -right-3 top-16 w-6 h-6 rounded-full flex items-center justify-center transition-opacity hover:opacity-80 z-10"
          style={{ background: 'var(--border)', color: 'var(--muted-foreground)' }}
        >
          <ChevronRight size={12} style={{ transform: collapsed ? 'rotate(0deg)' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
        </button>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="h-14 flex items-center justify-between px-6 flex-shrink-0" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--muted-foreground)' }}>
            <span className="text-sm">
              {nav.find(n => n.id === currentPage)?.label}
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2" style={{ color: 'var(--muted-foreground)' }} />
              <input
                placeholder="Buscar transações..."
                className="pl-8 pr-3 py-1.5 text-xs rounded-lg"
                style={{ width: 200, background: 'var(--secondary)', border: '1px solid var(--border)' }}
              />
            </div>

            {/* Quick add */}
            <button
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-opacity hover:opacity-90"
              style={{ background: 'var(--primary)', color: '#fff' }}
              onClick={() => onNavigate('transactions')}
            >
              <Plus size={13} /> Lançar
            </button>

            {/* Notifications */}
            <div className="relative">
              <button
                className="relative w-8 h-8 rounded-lg flex items-center justify-center transition-opacity hover:opacity-70"
                style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}
                onClick={() => setNotifOpen(!notifOpen)}
              >
                <Bell size={14} />
                <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full" style={{ background: 'var(--danger)' }} />
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-10 w-80 rounded-xl shadow-2xl z-50 overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                  <div className="px-4 py-3 border-b" style={{ borderColor: 'var(--border)' }}>
                    <p className="text-sm font-semibold">Notificações</p>
                  </div>
                  {[
                    { icon: '⚠️', text: 'Lazer: orçamento 140% comprometido', time: 'Agora', color: 'var(--danger)' },
                    { icon: '📅', text: 'Fatura Cartão Inter vence em 2 dias', time: '2h', color: 'var(--warning)' },
                    { icon: '🎯', text: 'Meta "Viagem Europa" está 56% completa!', time: '1d', color: 'var(--primary)' },
                  ].map((n, i) => (
                    <div key={i} className="px-4 py-3 flex items-start gap-3 border-b transition-colors hover:bg-secondary/40 cursor-pointer" style={{ borderColor: 'var(--border)' }}>
                      <span className="text-base">{n.icon}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs leading-relaxed">{n.text}</p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{n.time}</p>
                      </div>
                    </div>
                  ))}
                  <button className="w-full py-2.5 text-xs text-center transition-opacity hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                    Ver todas
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6" style={{ background: 'var(--background)' }}>
          {children}
        </main>
      </div>

      {/* Lock overlay */}
      {showLockOverlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(7,9,13,0.92)', backdropFilter: 'blur(8px)' }}>
          <div className="w-80 rounded-xl p-8 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'var(--secondary)' }}>
              <Lock size={20} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p className="font-semibold mb-1">Tela bloqueada</p>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>
              Olá, {user?.name?.split(' ')[0] || 'Usuário'}. Digite sua senha para continuar.
            </p>
            <input
              type="password"
              placeholder="Senha"
              value={lockPw}
              onChange={e => { setLockPw(e.target.value); setLockError(false) }}
              onKeyDown={e => e.key === 'Enter' && unlock()}
              className="w-full mb-2 text-center"
              style={{ borderColor: lockError ? 'var(--danger)' : undefined }}
              autoFocus
            />
            {lockError && <p className="text-xs mb-2" style={{ color: 'var(--danger)' }}>Senha incorreta</p>}
            <button onClick={unlock} className="w-full py-2.5 rounded-lg text-sm font-medium mt-2 transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', color: '#fff' }}>
              Desbloquear
            </button>
          </div>
        </div>
      )}
    </div>
  );
}