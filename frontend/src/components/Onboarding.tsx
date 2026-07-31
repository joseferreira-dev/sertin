import { useState } from 'react'
import { Check, Plus, TrendingUp } from 'lucide-react'

interface Props {
  onComplete: () => void
}

const defaultCategories = [
  'Alimentação', 'Transporte', 'Moradia', 'Saúde', 'Lazer', 'Educação',
  'Salário', 'Freelance', 'Investimentos', 'Vestuário', 'Utilidades',
]

export default function Onboarding({ onComplete }: Props) {
  const [step, setStep] = useState(1)
  const [currency, setCurrency] = useState('BRL')
  const [dateFormat, setDateFormat] = useState('DD/MM/AAAA')
  const [accounts, setAccounts] = useState([
    { name: 'Carteira', type: 'cash', balance: '0' },
    { name: 'Conta Corrente', type: 'checking', balance: '0' },
  ])
  const [selectedCats, setSelectedCats] = useState<string[]>(defaultCategories)
  const [newAccount, setNewAccount] = useState({ name: '', type: 'checking', balance: '' })
  const [showNewAccount, setShowNewAccount] = useState(false)

  const toggleCat = (cat: string) => {
    setSelectedCats(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat])
  }

  const addAccount = () => {
    if (newAccount.name) {
      setAccounts(prev => [...prev, { ...newAccount }])
      setNewAccount({ name: '', type: 'checking', balance: '' })
      setShowNewAccount(false)
    }
  }

  const steps = ['Configurações', 'Contas', 'Categorias', 'Resumo']

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-16 px-4" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0e1a2e 0%, #07090d 60%)' }}>
      {/* Brand */}
      <div className="flex items-center gap-2 mb-8">
        <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
          <TrendingUp size={16} color="#fff" />
        </div>
        <span className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>Sertin</span>
      </div>

      {/* Progress */}
      <div className="flex items-center gap-0 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center">
            <div className="flex items-center gap-2">
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
                style={{
                  background: i + 1 < step ? 'var(--primary)' : i + 1 === step ? 'var(--primary)' : 'var(--secondary)',
                  color: i + 1 <= step ? '#fff' : 'var(--muted-foreground)',
                  opacity: i + 1 < step ? 0.8 : 1,
                }}
              >
                {i + 1 < step ? <Check size={12} /> : i + 1}
              </div>
              <span className="text-xs hidden sm:block" style={{ color: i + 1 === step ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{s}</span>
            </div>
            {i < steps.length - 1 && (
              <div className="w-8 sm:w-16 h-px mx-2" style={{ background: i + 1 < step ? 'var(--primary)' : 'var(--border)' }} />
            )}
          </div>
        ))}
      </div>

      {/* Card */}
      <div className="w-full max-w-lg rounded-xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        {step === 1 && (
          <>
            <h2 className="text-lg font-semibold mb-1">Bem-vindo ao Sertin!</h2>
            <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Configure as preferências básicas do sistema</p>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Moeda padrão</label>
                <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full">
                  <option value="BRL">R$ — Real Brasileiro (BRL)</option>
                  <option value="USD">$ — Dólar Americano (USD)</option>
                  <option value="EUR">€ — Euro (EUR)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Formato de data</label>
                <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="w-full">
                  <option value="DD/MM/AAAA">DD/MM/AAAA (28/07/2025)</option>
                  <option value="MM/DD/AAAA">MM/DD/AAAA (07/28/2025)</option>
                </select>
              </div>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 className="text-lg font-semibold mb-1">Suas contas</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>Adicione as contas onde você movimenta dinheiro</p>
            <div className="flex flex-col gap-2 mb-4">
              {accounts.map((acc, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <div>
                    <p className="text-sm font-medium">{acc.name}</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>{acc.type === 'checking' ? 'Conta Corrente' : acc.type === 'savings' ? 'Poupança' : acc.type === 'cash' ? 'Dinheiro Físico' : 'Cartão'}</p>
                  </div>
                  <span className="text-sm mono" style={{ color: 'var(--muted-foreground)' }}>R$ {acc.balance || '0,00'}</span>
                </div>
              ))}
            </div>
            {showNewAccount ? (
              <div className="p-4 rounded-lg flex flex-col gap-3" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                <input className="w-full" placeholder="Nome da conta" value={newAccount.name} onChange={e => setNewAccount(p => ({ ...p, name: e.target.value }))} />
                <select className="w-full" value={newAccount.type} onChange={e => setNewAccount(p => ({ ...p, type: e.target.value }))}>
                  <option value="checking">Conta Corrente</option>
                  <option value="savings">Poupança</option>
                  <option value="cash">Dinheiro Físico</option>
                  <option value="credit">Cartão de Crédito</option>
                  <option value="digital">Carteira Digital</option>
                </select>
                <input className="w-full" placeholder="Saldo inicial (ex: 1500,00)" value={newAccount.balance} onChange={e => setNewAccount(p => ({ ...p, balance: e.target.value }))} />
                <div className="flex gap-2">
                  <button onClick={addAccount} className="flex-1 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>Adicionar</button>
                  <button onClick={() => setShowNewAccount(false)} className="flex-1 py-2 rounded-lg text-sm" style={{ background: 'var(--border)', color: 'var(--foreground)' }}>Cancelar</button>
                </div>
              </div>
            ) : (
              <button onClick={() => setShowNewAccount(true)} className="w-full py-2.5 rounded-lg text-sm flex items-center justify-center gap-2 transition-opacity hover:opacity-80" style={{ border: '1px dashed var(--border)', color: 'var(--muted-foreground)' }}>
                <Plus size={14} /> Adicionar conta
              </button>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2 className="text-lg font-semibold mb-1">Categorias padrão</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>Desmarque as categorias que não usa</p>
            <div className="grid grid-cols-2 gap-2">
              {defaultCategories.map(cat => (
                <button
                  key={cat}
                  onClick={() => toggleCat(cat)}
                  className="flex items-center gap-2 p-2.5 rounded-lg text-sm text-left transition-all"
                  style={{
                    background: selectedCats.includes(cat) ? 'rgba(16,185,129,0.1)' : 'var(--secondary)',
                    border: `1px solid ${selectedCats.includes(cat) ? 'var(--primary)' : 'var(--border)'}`,
                    color: selectedCats.includes(cat) ? 'var(--primary)' : 'var(--secondary-foreground)',
                  }}
                >
                  <div className="w-4 h-4 rounded flex items-center justify-center flex-shrink-0" style={{ background: selectedCats.includes(cat) ? 'var(--primary)' : 'var(--border)' }}>
                    {selectedCats.includes(cat) && <Check size={10} color="#fff" />}
                  </div>
                  {cat}
                </button>
              ))}
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2 className="text-lg font-semibold mb-1">Tudo pronto!</h2>
            <p className="text-sm mb-5" style={{ color: 'var(--muted-foreground)' }}>Revise suas configurações antes de começar</p>
            <div className="flex flex-col gap-3">
              {[
                { label: 'Moeda', value: currency },
                { label: 'Formato de data', value: dateFormat },
                { label: 'Contas criadas', value: `${accounts.length} conta(s)` },
                { label: 'Categorias ativas', value: `${selectedCats.length} de ${defaultCategories.length}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex justify-between items-center p-3 rounded-lg" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <span className="text-sm" style={{ color: 'var(--muted-foreground)' }}>{label}</span>
                  <span className="text-sm font-medium">{value}</span>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Navigation */}
        <div className="flex gap-3 mt-6">
          {step > 1 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: 'var(--secondary)', color: 'var(--foreground)', border: '1px solid var(--border)' }}
            >
              Voltar
            </button>
          )}
          <button
            onClick={() => step < 4 ? setStep(s => s + 1) : onComplete()}
            className="flex-1 py-2.5 rounded-lg text-sm font-medium transition-opacity hover:opacity-90"
            style={{ background: 'var(--primary)', color: '#fff' }}
          >
            {step === 4 ? 'Começar a usar ✓' : 'Continuar →'}
          </button>
        </div>
      </div>

      {step < 4 && (
        <button className="mt-4 text-sm transition-opacity hover:opacity-70" style={{ color: 'var(--muted-foreground)' }} onClick={() => setStep(s => s + 1)}>
          Pular esta etapa
        </button>
      )}
    </div>
  )
}
