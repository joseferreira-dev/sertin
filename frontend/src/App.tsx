import { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import Login from './components/Login';
import Onboarding from './components/Onboarding';
import Layout, { type Page } from './components/Layout';
import Dashboard from './components/Dashboard';
import Transactions from './components/Transactions';
import Installments from './components/Installments';
import Accounts from './components/Accounts';
import CreditCards from './components/CreditCards';
import Categories from './components/Categories';
import Tags from './components/Tags';
import Budgets from './components/Budgets';
import Goals from './components/Goals';
import Reports from './components/Reports';
import Settings from './components/Settings';
import ImportExport from './components/ImportExport';

type AppView = 'login' | 'register' | 'onboarding' | 'app';

export default function App() {
  const { isAuthenticated, logout } = useAuth();
  const [view, setView] = useState<AppView>('login');
  const [page, setPage] = useState<Page>('dashboard');

  // Redireciona para o app se já estiver autenticado
  useEffect(() => {
    if (isAuthenticated && (view === 'login' || view === 'register')) {
      setView('app');
    }
  }, [isAuthenticated, view]);

  const handleLogin = () => setView('app');
  const handleRegister = () => setView('onboarding');
  const handleOnboardingComplete = () => setView('app');
  const handleLogout = () => {
    logout();
    setView('login');
  };
  const navigate = (p: string) => setPage(p as Page);

  if (view === 'login' || view === 'register') {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />;
  }

  if (view === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />;
  }

  return (
    <Layout currentPage={page} onNavigate={navigate} onLogout={handleLogout}>
      {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {page === 'transactions' && <Transactions />}
      {page === 'installments' && <Installments />}
      {page === 'accounts' && <Accounts />}
      {page === 'credit-cards' && <CreditCards />}
      {page === 'categories' && <Categories />}
      {page === 'tags' && <Tags />}
      {page === 'budgets' && <Budgets />}
      {page === 'goals' && <Goals />}
      {page === 'reports' && <Reports />}
      {page === 'import-export' && <ImportExport />}
      {page === 'settings' && <Settings onLogout={handleLogout} />}
    </Layout>
  );
}
