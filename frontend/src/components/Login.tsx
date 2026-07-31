import { useState } from 'react'
import { Eye, EyeOff, TrendingUp } from 'lucide-react'

interface Props {
  onLogin: () => void
  onRegister: () => void
}

export default function Login({ onLogin, onRegister }: Props) {
  const [email, setEmail] = useState('lucas@sertin.app')
  const [password, setPassword] = useState('••••••••')
  const [showPw, setShowPw] = useState(false)
  const [mode, setMode] = useState<'login' | 'recover'>('login')
  const [secAnswer, setSecAnswer] = useState('')
  const [error, setError] = useState('')

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (email === 'lucas@sertin.app' && (password === '••••••••' || password === '123456')) {
      onLogin()
    } else {
      setError('E-mail ou senha incorretos.')
    }
  }

  const handleRecover = (e: React.FormEvent) => {
    e.preventDefault()
    if (secAnswer.toLowerCase().includes('luna')) {
      setMode('login')
      setError('')
    } else {
      setError('Resposta incorreta.')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'radial-gradient(ellipse at 50% 0%, #0e1a2e 0%, #07090d 60%)' }}>
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="flex items-center gap-3 mb-10 justify-center">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'var(--primary)' }}>
            <TrendingUp size={18} color="#fff" />
          </div>
          <span className="text-xl font-bold tracking-tight" style={{ letterSpacing: '-0.03em' }}>Sertin</span>
          <span className="text-xs px-2 py-0.5 rounded" style={{ background: 'var(--secondary)', color: 'var(--muted-foreground)' }}>Desktop</span>
        </div>

        {/* Card */}
        <div className="rounded-xl p-8" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          {mode === 'login' ? (
            <>
              <h1 className="text-lg font-semibold mb-1">Entrar na sua conta</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Gestão financeira pessoal offline e segura</p>

              {error && (
                <div className="mb-4 text-sm p-3 rounded-lg" style={{ background: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="seu@email.com"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Senha</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full pr-10"
                      placeholder="••••••••"
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 -translate-y-1/2"
                      style={{ color: 'var(--muted-foreground)' }}
                      onClick={() => setShowPw(!showPw)}
                    >
                      {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-medium text-sm mt-1 transition-opacity hover:opacity-90"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  Entrar
                </button>
              </form>

              <div className="mt-5 flex flex-col gap-2 text-center">
                <button
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--muted-foreground)' }}
                  onClick={() => { setMode('recover'); setError('') }}
                >
                  Esqueci minha senha
                </button>
                <button
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--primary)' }}
                  onClick={onRegister}
                >
                  Criar conta →
                </button>
              </div>
            </>
          ) : (
            <>
              <button
                className="flex items-center gap-1.5 text-sm mb-5 transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted-foreground)' }}
                onClick={() => { setMode('login'); setError('') }}
              >
                ← Voltar
              </button>
              <h1 className="text-lg font-semibold mb-1">Recuperar senha</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Responda à sua pergunta de segurança</p>

              {error && (
                <div className="mb-4 text-sm p-3 rounded-lg" style={{ background: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleRecover} className="flex flex-col gap-4">
                <div className="p-3 rounded-lg text-sm" style={{ background: 'var(--secondary)', color: 'var(--secondary-foreground)' }}>
                  Qual é o nome do seu primeiro animal de estimação?
                </div>
                <input
                  type="text"
                  value={secAnswer}
                  onChange={e => setSecAnswer(e.target.value)}
                  placeholder="Sua resposta"
                  className="w-full"
                />
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  Verificar e redefinir
                </button>
              </form>
            </>
          )}
        </div>

        <p className="text-center text-xs mt-6" style={{ color: 'var(--muted-foreground)' }}>
          Sertin — Dados armazenados localmente com criptografia
        </p>
      </div>
    </div>
  )
}
