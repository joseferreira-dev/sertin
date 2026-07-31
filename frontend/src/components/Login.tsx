import { useState } from 'react';
import { Eye, EyeOff, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface Props {
  onLogin: () => void;
  onRegister: () => void;
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1';

export default function Login({ onLogin, onRegister }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [mode, setMode] = useState<'login' | 'recover' | 'register'>('login');
  const [secAnswer, setSecAnswer] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [name, setName] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao fazer login');
      
      login(data.token, data.user);
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          password,
          security_question: securityQuestion,
          security_answer: securityAnswer
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao criar conta');
      
      login(data.token, data.user);
      onLogin();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecover = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/auth/recover`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          security_answer: secAnswer,
          new_password: newPassword
        })
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Erro ao recuperar senha');
      
      setMode('login');
      setError('');
      alert('Senha redefinida com sucesso! Faça login com a nova senha.');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
          {mode === 'login' && (
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
                    required
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
                      required
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
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-medium text-sm mt-1 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  {loading ? 'Carregando...' : 'Entrar'}
                </button>
              </form>

              <div className="mt-5 flex flex-col gap-2 text-center">
                <button
                  className="text-sm transition-colors hover:opacity-80"
                  style={{ color: 'var(--muted-foreground)' }}
                  onClick={() => { setMode('recover'); setError(''); }}
                >
                  Esqueci minha senha
                </button>
                <button
                  className="text-sm font-medium transition-colors hover:opacity-80"
                  style={{ color: 'var(--primary)' }}
                  onClick={() => { setMode('register'); setError(''); }}
                >
                  Criar conta →
                </button>
              </div>
            </>
          )}

          {mode === 'register' && (
            <>
              <button
                className="flex items-center gap-1.5 text-sm mb-5 transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted-foreground)' }}
                onClick={() => { setMode('login'); setError(''); }}
              >
                ← Voltar
              </button>
              <h1 className="text-lg font-semibold mb-1">Criar conta</h1>
              <p className="text-sm mb-6" style={{ color: 'var(--muted-foreground)' }}>Preencha os dados para começar</p>

              {error && (
                <div className="mb-4 text-sm p-3 rounded-lg" style={{ background: '#450a0a', color: '#fca5a5', border: '1px solid #7f1d1d' }}>
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Nome</label>
                  <input
                    type="text"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="w-full"
                    placeholder="Seu nome"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="seu@email.com"
                    required
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
                      required
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
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Pergunta de segurança</label>
                  <input
                    type="text"
                    value={securityQuestion}
                    onChange={e => setSecurityQuestion(e.target.value)}
                    className="w-full"
                    placeholder="Ex: Qual sua cor favorita?"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Resposta</label>
                  <input
                    type="text"
                    value={securityAnswer}
                    onChange={e => setSecurityAnswer(e.target.value)}
                    className="w-full"
                    placeholder="Sua resposta"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-medium text-sm mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  {loading ? 'Criando...' : 'Criar conta'}
                </button>
              </form>
            </>
          )}

          {mode === 'recover' && (
            <>
              <button
                className="flex items-center gap-1.5 text-sm mb-5 transition-opacity hover:opacity-70"
                style={{ color: 'var(--muted-foreground)' }}
                onClick={() => { setMode('login'); setError(''); }}
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

              <form onSubmit={handleRecover} className="flex flex-col gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>E-mail</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full"
                    placeholder="seu@email.com"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Resposta de segurança</label>
                  <input
                    type="text"
                    value={secAnswer}
                    onChange={e => setSecAnswer(e.target.value)}
                    className="w-full"
                    placeholder="Sua resposta"
                    required
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium" style={{ color: 'var(--secondary-foreground)' }}>Nova senha</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full"
                    placeholder="••••••••"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-lg font-medium text-sm mt-2 transition-opacity hover:opacity-90 disabled:opacity-50"
                  style={{ background: 'var(--primary)', color: '#fff' }}
                >
                  {loading ? 'Redefinindo...' : 'Redefinir senha'}
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
  );
}