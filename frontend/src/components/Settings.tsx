import { useState } from 'react'
import { Shield, Bell, Keyboard, Monitor, Settings2, Database, FileDown, RotateCcw, LogOut } from 'lucide-react'
import { auditLogs } from '../data/mock'

const sections = [
  ['general', 'Geral', Settings2],
  ['appearance', 'Aparência', Monitor],
  ['notifications', 'Notificações', Bell],
  ['shortcuts', 'Atalhos', Keyboard],
  ['maintenance', 'Manutenção', Database],
  ['audit', 'Auditoria', Shield],
]

const shortcuts = [
  { action: 'Nova transação', keys: 'Ctrl+N' },
  { action: 'Abrir extrato', keys: 'Ctrl+E' },
  { action: 'Dashboard', keys: 'Ctrl+D' },
  { action: 'Busca global', keys: 'Ctrl+F' },
  { action: 'Nova meta', keys: 'Ctrl+M' },
  { action: 'Configurações', keys: 'Ctrl+,' },
]

export default function Settings({ onLogout }: { onLogout: () => void }) {
  const [tab, setTab] = useState('general')
  const [currency, setCurrency] = useState('BRL')
  const [dateFormat, setDateFormat] = useState('DD/MM/AAAA')
  const [theme, setTheme] = useState('dark')
  const [notifBudget, setNotifBudget] = useState(true)
  const [notifGoal, setNotifGoal] = useState(true)
  const [notifDue, setNotifDue] = useState(true)
  const [autoStart, setAutoStart] = useState(false)
  const [inactivityMin, setInactivityMin] = useState('15')
  const [dbInfo] = useState({ size: '2.4 MB', transactions: 2847, lastBackup: '28/07/2025 09:20' })
  const [editingShortcut, setEditingShortcut] = useState<number | null>(null)
  const [backups] = useState([
    { date: '28/07/2025 09:20', size: '2.4 MB' },
    { date: '27/07/2025 21:00', size: '2.3 MB' },
    { date: '26/07/2025 21:00', size: '2.3 MB' },
    { date: '25/07/2025 21:00', size: '2.2 MB' },
    { date: '24/07/2025 21:00', size: '2.2 MB' },
  ])
  const [auditSearch, setAuditSearch] = useState('')

  const Toggle = ({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) => (
    <button
      onClick={() => onChange(!value)}
      className="relative w-10 h-6 rounded-full transition-all flex-shrink-0"
      style={{ background: value ? 'var(--primary)' : 'var(--border)' }}
    >
      <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: value ? 20 : 4 }} />
    </button>
  )

  const filteredLogs = auditLogs.filter(l =>
    !auditSearch || l.action.toLowerCase().includes(auditSearch.toLowerCase()) || l.detail.toLowerCase().includes(auditSearch.toLowerCase())
  )

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>Configurações</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Personalize o Sertin às suas preferências</p>
      </div>

      <div className="flex gap-5">
        {/* Sidebar */}
        <div className="w-44 flex-shrink-0">
          <nav className="flex flex-col gap-0.5">
            {sections.map(([id, label, Icon]: any) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-left transition-all"
                style={{
                  background: tab === id ? 'rgba(16,185,129,0.1)' : 'transparent',
                  color: tab === id ? 'var(--primary)' : 'var(--secondary-foreground)',
                  borderLeft: tab === id ? '2px solid var(--primary)' : '2px solid transparent',
                }}
              >
                <Icon size={14} /> {label}
              </button>
            ))}
          </nav>
        </div>

        {/* Content */}
        <div className="flex-1 rounded-xl" style={{ background: 'var(--card)', border: '1px solid var(--border)', minHeight: 500 }}>
          {tab === 'general' && (
            <div className="p-6 flex flex-col gap-6">
              <h2 className="font-semibold">Preferências Gerais</h2>
              <div className="grid grid-cols-2 gap-5">
                {[
                  { label: 'Moeda padrão', comp: <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full"><option value="BRL">R$ — Real Brasileiro</option><option value="USD">$ — Dólar</option><option value="EUR">€ — Euro</option></select> },
                  { label: 'Formato de data', comp: <select value={dateFormat} onChange={e => setDateFormat(e.target.value)} className="w-full"><option value="DD/MM/AAAA">DD/MM/AAAA</option><option value="MM/DD/AAAA">MM/DD/AAAA</option></select> },
                  { label: 'Primeiro dia da semana', comp: <select className="w-full"><option>Segunda-feira</option><option>Domingo</option></select> },
                  { label: 'Bloqueio por inatividade (min)', comp: <input type="number" value={inactivityMin} onChange={e => setInactivityMin(e.target.value)} className="w-full" /> },
                ].map(({ label, comp }) => (
                  <div key={label} className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium" style={{ color: 'var(--muted-foreground)' }}>{label}</label>
                    {comp}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                <div>
                  <p className="text-sm font-medium">Iniciar com o sistema</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Abrir Sertin automaticamente ao iniciar o computador</p>
                </div>
                <Toggle value={autoStart} onChange={setAutoStart} />
              </div>
              <button className="self-start px-5 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', color: '#fff' }}>
                Salvar preferências
              </button>
            </div>
          )}

          {tab === 'appearance' && (
            <div className="p-6 flex flex-col gap-6">
              <h2 className="font-semibold">Aparência</h2>
              <div className="grid grid-cols-2 gap-3">
                {[['dark', '🌙 Tema Escuro'], ['light', '☀️ Tema Claro']].map(([t, label]) => (
                  <button
                    key={t}
                    onClick={() => setTheme(t)}
                    className="p-4 rounded-xl text-sm font-medium text-left transition-all"
                    style={{
                      background: theme === t ? 'rgba(16,185,129,0.1)' : 'var(--secondary)',
                      border: `2px solid ${theme === t ? 'var(--primary)' : 'var(--border)'}`,
                      color: theme === t ? 'var(--primary)' : 'var(--foreground)',
                    }}
                  >
                    {label}
                    {theme === t && <span className="block text-xs mt-1 opacity-70">Ativo</span>}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-sm font-medium mb-3">Prévia</p>
                <div className="rounded-xl p-4 flex items-center gap-3" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>
                  <div className="w-8 h-8 rounded-lg" style={{ background: 'var(--primary)' }} />
                  <div>
                    <p className="text-sm font-semibold">Lucas Ferreira</p>
                    <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>lucas@sertin.app</p>
                  </div>
                  <div className="ml-auto text-lg font-bold mono" style={{ color: 'var(--primary)' }}>R$ 39.230,50</div>
                </div>
              </div>
            </div>
          )}

          {tab === 'notifications' && (
            <div className="p-6 flex flex-col gap-4">
              <h2 className="font-semibold">Notificações</h2>
              {[
                { label: 'Alertas de orçamento', desc: 'Notificar ao atingir 80%, 90% e 100% de um orçamento', value: notifBudget, onChange: setNotifBudget },
                { label: 'Metas de poupança', desc: 'Alertar quando metas estiverem em risco ou concluídas', value: notifGoal, onChange: setNotifGoal },
                { label: 'Contas a vencer', desc: 'Lembrar de faturas e parcelas vencendo nos próximos 3 dias', value: notifDue, onChange: setNotifDue },
              ].map(({ label, desc, value, onChange }) => (
                <div key={label} className="flex items-center justify-between p-4 rounded-xl" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <div>
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>{desc}</p>
                  </div>
                  <Toggle value={value} onChange={onChange} />
                </div>
              ))}
            </div>
          )}

          {tab === 'shortcuts' && (
            <div className="p-6">
              <h2 className="font-semibold mb-4">Atalhos de Teclado</h2>
              <div className="flex flex-col gap-2">
                {shortcuts.map((s, i) => (
                  <div key={s.action} className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                    <span className="text-sm">{s.action}</span>
                    <div className="flex items-center gap-2">
                      {editingShortcut === i ? (
                        <input
                          className="text-xs text-center w-28"
                          placeholder="Pressione a tecla..."
                          autoFocus
                          onKeyDown={e => { e.preventDefault(); setEditingShortcut(null) }}
                          onBlur={() => setEditingShortcut(null)}
                        />
                      ) : (
                        <>
                          <kbd className="px-2 py-1 rounded text-xs mono" style={{ background: 'var(--background)', border: '1px solid var(--border)' }}>{s.keys}</kbd>
                          <button onClick={() => setEditingShortcut(i)} className="text-xs px-2 py-1 rounded transition-opacity hover:opacity-70" style={{ color: 'var(--muted-foreground)' }}>
                            Editar
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'maintenance' && (
            <div className="p-6 flex flex-col gap-5">
              <h2 className="font-semibold">Manutenção do Banco</h2>

              {/* DB info */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Tamanho do banco', value: dbInfo.size },
                  { label: 'Transações', value: dbInfo.transactions.toLocaleString('pt-BR') },
                  { label: 'Último backup', value: dbInfo.lastBackup },
                ].map(({ label, value }) => (
                  <div key={label} className="p-3 rounded-lg" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                    <p className="text-xs mb-1" style={{ color: 'var(--muted-foreground)' }}>{label}</p>
                    <p className="text-sm font-semibold mono">{value}</p>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-90" style={{ background: 'var(--primary)', color: '#fff' }}>
                  <FileDown size={13} /> Backup agora
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm transition-opacity hover:opacity-80" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
                  <RotateCcw size={13} /> Restaurar backup
                </button>
              </div>

              {/* Backup list */}
              <div>
                <p className="text-xs font-semibold mb-2" style={{ color: 'var(--muted-foreground)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Backups automáticos</p>
                <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  {backups.map((b, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-3 ${i > 0 ? 'border-t' : ''} hover:bg-secondary/40 transition-colors`} style={{ borderColor: 'var(--border)' }}>
                      <div>
                        <p className="text-xs font-medium">{b.date}</p>
                        <p className="text-xs mono" style={{ color: 'var(--muted-foreground)' }}>{b.size}</p>
                      </div>
                      <button className="text-xs px-2.5 py-1 rounded-lg transition-opacity hover:opacity-80" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--secondary-foreground)' }}>
                        Restaurar
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Danger zone */}
              <div className="p-4 rounded-xl" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.2)' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: 'var(--danger)' }}>Zona de Perigo</p>
                <div className="flex gap-3">
                  <button className="px-3 py-2 rounded-lg text-xs transition-opacity hover:opacity-80" style={{ border: '1px solid var(--danger)', color: 'var(--danger)' }}>
                    Limpar transações
                  </button>
                  <button className="px-3 py-2 rounded-lg text-xs font-medium text-white transition-opacity hover:opacity-90" style={{ background: 'var(--danger)' }}>
                    Apagar tudo e reiniciar
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === 'audit' && (
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold">Auditoria e Logs</h2>
                <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs transition-opacity hover:opacity-80" style={{ background: 'var(--secondary)', border: '1px solid var(--border)', color: 'var(--secondary-foreground)' }}>
                  <FileDown size={11} /> Exportar CSV
                </button>
              </div>
              <input
                placeholder="Filtrar por ação ou detalhe..."
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
                className="w-full mb-4"
              />
              <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                <table className="w-full">
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--secondary)' }}>
                      {['Data/Hora', 'Ação', 'Detalhes', 'IP'].map(h => (
                        <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map(log => (
                      <tr key={log.id} className="border-t hover:bg-secondary/30 transition-colors" style={{ borderColor: 'var(--border)' }}>
                        <td className="px-4 py-2.5 text-xs mono whitespace-nowrap" style={{ color: 'var(--muted-foreground)' }}>{log.datetime}</td>
                        <td className="px-4 py-2.5 text-xs font-medium">{log.action}</td>
                        <td className="px-4 py-2.5 text-xs" style={{ color: 'var(--muted-foreground)' }}>{log.detail}</td>
                        <td className="px-4 py-2.5 text-xs mono" style={{ color: 'var(--muted-foreground)' }}>{log.ip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs mt-3" style={{ color: 'var(--muted-foreground)' }}>Logs mantidos por 90 dias · {filteredLogs.length} registros</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
