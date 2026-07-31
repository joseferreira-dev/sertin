import { useState } from 'react'
import Login from './components/Login'
import Onboarding from './components/Onboarding'
import Layout, { type Page } from './components/Layout'
import Dashboard from './components/Dashboard'
import Transactions from './components/Transactions'
import Accounts from './components/Accounts'
import Categories from './components/Categories'
import Tags from './components/Tags'
import Budgets from './components/Budgets'
import Goals from './components/Goals'
import Reports from './components/Reports'
import Settings from './components/Settings'
import ImportExport from './components/ImportExport'

type AppView = 'login' | 'register' | 'onboarding' | 'app'

export default function App() {
  const [view, setView] = useState<AppView>('login')
  const [page, setPage] = useState<Page>('dashboard')

  const handleLogin = () => {
    // Simulate checking if first run
    const isFirstRun = false
    setView(isFirstRun ? 'onboarding' : 'app')
  }

  const handleRegister = () => setView('onboarding')
  const handleOnboardingComplete = () => setView('app')
  const handleLogout = () => setView('login')
  const navigate = (p: string) => setPage(p as Page)

  if (view === 'login' || view === 'register') {
    return <Login onLogin={handleLogin} onRegister={handleRegister} />
  }

  if (view === 'onboarding') {
    return <Onboarding onComplete={handleOnboardingComplete} />
  }

  return (
    <Layout currentPage={page} onNavigate={navigate} onLogout={handleLogout}>
      {page === 'dashboard' && <Dashboard onNavigate={navigate} />}
      {page === 'transactions' && <Transactions />}
      {page === 'accounts' && <Accounts />}
      {page === 'categories' && <Categories />}
      {page === 'tags' && <Tags />}
      {page === 'budgets' && <Budgets />}
      {page === 'goals' && <Goals />}
      {page === 'reports' && <Reports />}
      {page === 'import-export' && <ImportExport />}
      {page === 'settings' && <Settings onLogout={handleLogout} />}
    </Layout>
  )
}
