import { useState } from 'react'
import { Upload, Download, X, Check, AlertTriangle } from 'lucide-react'

export default function ImportExport() {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export')
  const [exportFormat, setExportFormat] = useState('pdf')
  const [includeTags, setIncludeTags] = useState(true)
  const [importStep, setImportStep] = useState(1)
  const [fileType, setFileType] = useState('ofx')
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState(false)

  const previewData = [
    { date: '25/07/2025', desc: 'SUPERMERCADO CARREFOUR', value: '-345.20', dup: false },
    { date: '24/07/2025', desc: 'NETFLIX.COM', value: '-39.90', dup: true },
    { date: '23/07/2025', desc: 'UBER * VIAGEM', value: '-28.50', dup: false },
    { date: '22/07/2025', desc: 'AMAZON COMPRAS', value: '-189.00', dup: false },
    { date: '21/07/2025', desc: 'SALARIO EMPRESA', value: '7500.00', dup: false },
  ]

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) { setFileName(file.name); setImportStep(2) }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) { setFileName(file.name); setImportStep(2) }
  }

  const doImport = () => {
    setImportSuccess(true)
    setImportStep(1)
    setFileName(null)
    setTimeout(() => setImportSuccess(false), 3000)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-lg font-bold" style={{ letterSpacing: '-0.03em' }}>Importar / Exportar</h1>
        <p className="text-xs mt-0.5" style={{ color: 'var(--muted-foreground)' }}>Migre dados e gere relatórios externos</p>
      </div>

      {importSuccess && (
        <div className="flex items-center gap-2 p-3 mb-4 rounded-xl text-sm" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: 'var(--primary)' }}>
          <Check size={16} /> 4 transações importadas com sucesso (1 duplicata ignorada)
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {[['export', '⬇ Exportar'], ['import', '⬆ Importar']].map(([t, l]) => (
          <button key={t} onClick={() => setActiveTab(t as any)}
            className="px-5 py-2 rounded-xl text-sm font-medium transition-all"
            style={{ background: activeTab === t ? 'var(--primary)' : 'var(--card)', color: activeTab === t ? '#fff' : 'var(--secondary-foreground)', border: `1px solid ${activeTab === t ? 'var(--primary)' : 'var(--border)'}` }}>
            {l}
          </button>
        ))}
      </div>

      {activeTab === 'export' && (
        <div className="rounded-xl overflow-hidden" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="p-6 flex flex-col gap-5">
            <h3 className="font-semibold">Exportar extrato</h3>

            <div>
              <label className="text-xs font-medium block mb-2" style={{ color: 'var(--muted-foreground)' }}>Formato</label>
              <div className="grid grid-cols-3 gap-3">
                {[['pdf', '📄 PDF'], ['csv', '📊 CSV'], ['xlsx', '📈 Excel (.xlsx)']].map(([f, l]) => (
                  <button key={f} onClick={() => setExportFormat(f)}
                    className="p-3 rounded-xl text-sm text-left transition-all"
                    style={{ background: exportFormat === f ? 'rgba(16,185,129,0.1)' : 'var(--secondary)', border: `2px solid ${exportFormat === f ? 'var(--primary)' : 'var(--border)'}`, color: exportFormat === f ? 'var(--primary)' : 'var(--foreground)' }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Período início</label>
                <input type="date" defaultValue="2025-07-01" className="w-full" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Período fim</label>
                <input type="date" defaultValue="2025-07-31" className="w-full" />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Conta</label>
              <select className="w-full">
                <option>Todas as contas</option>
                <option>Nubank</option>
                <option>Bradesco CC</option>
                <option>Cartão Inter</option>
              </select>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>
              <div>
                <p className="text-sm">Incluir etiquetas</p>
                <p className="text-xs" style={{ color: 'var(--muted-foreground)' }}>Adicionar coluna de etiquetas ao arquivo exportado</p>
              </div>
              <button onClick={() => setIncludeTags(!includeTags)} className="relative w-10 h-6 rounded-full transition-all" style={{ background: includeTags ? 'var(--primary)' : 'var(--border)' }}>
                <span className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all" style={{ left: includeTags ? 20 : 4 }} />
              </button>
            </div>

            <button className="flex items-center gap-2 px-5 py-3 rounded-xl font-medium transition-opacity hover:opacity-90 self-start" style={{ background: 'var(--primary)', color: '#fff' }}>
              <Download size={16} /> Exportar {exportFormat.toUpperCase()}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'import' && (
        <div className="flex flex-col gap-4">
          {/* Step indicator */}
          <div className="flex items-center gap-2">
            {['Arquivo', 'Tipo', 'Mapeamento', 'Prévia', 'Confirmar'].map((s, i) => (
              <div key={s} className="flex items-center">
                <div className="flex items-center gap-1.5">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-semibold" style={{ background: i + 1 < importStep ? 'var(--primary)' : i + 1 === importStep ? 'var(--primary)' : 'var(--secondary)', color: i + 1 <= importStep ? '#fff' : 'var(--muted-foreground)', opacity: i + 1 < importStep ? 0.7 : 1 }}>
                    {i + 1 < importStep ? <Check size={10} /> : i + 1}
                  </div>
                  <span className="text-xs" style={{ color: i + 1 === importStep ? 'var(--foreground)' : 'var(--muted-foreground)' }}>{s}</span>
                </div>
                {i < 4 && <div className="w-6 h-px mx-1" style={{ background: i + 1 < importStep ? 'var(--primary)' : 'var(--border)' }} />}
              </div>
            ))}
          </div>

          <div className="rounded-xl p-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {importStep === 1 && (
              <div>
                <h3 className="font-semibold mb-4">Selecionar arquivo</h3>
                <div
                  className="border-2 border-dashed rounded-xl p-10 text-center transition-all"
                  style={{ borderColor: dragOver ? 'var(--primary)' : 'var(--border)', background: dragOver ? 'rgba(16,185,129,0.05)' : 'transparent' }}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleFileDrop}
                >
                  <Upload size={32} className="mx-auto mb-3" style={{ color: 'var(--muted-foreground)' }} />
                  <p className="text-sm font-medium mb-1">Arraste o arquivo aqui</p>
                  <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>ou clique para navegar — .OFX, .CSV</p>
                  <label className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>
                    Selecionar arquivo
                    <input type="file" accept=".ofx,.csv" className="hidden" onChange={handleFileInput} />
                  </label>
                </div>
              </div>
            )}

            {importStep === 2 && (
              <div>
                <h3 className="font-semibold mb-2">Tipo de arquivo</h3>
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>Arquivo: <span className="font-medium" style={{ color: 'var(--foreground)' }}>{fileName}</span></p>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  {[['ofx', 'OFX — Padrão bancário'], ['csv', 'CSV Genérico'], ['mobills', 'CSV Mobills'], ['organizze', 'CSV Organizze']].map(([t, l]) => (
                    <button key={t} onClick={() => setFileType(t)}
                      className="p-3 rounded-xl text-sm text-left"
                      style={{ background: fileType === t ? 'rgba(16,185,129,0.1)' : 'var(--secondary)', border: `2px solid ${fileType === t ? 'var(--primary)' : 'var(--border)'}`, color: fileType === t ? 'var(--primary)' : 'var(--foreground)' }}>
                      {l}
                    </button>
                  ))}
                </div>
                <button onClick={() => setImportStep(fileType === 'ofx' ? 4 : 3)} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>Continuar →</button>
              </div>
            )}

            {importStep === 3 && (
              <div>
                <h3 className="font-semibold mb-4">Mapeamento de colunas</h3>
                <div className="flex flex-col gap-3 mb-5">
                  {[['Data', 'data'], ['Descrição', 'descricao'], ['Valor', 'valor'], ['Etiquetas', 'tags']].map(([label, field]) => (
                    <div key={field} className="flex items-center gap-4">
                      <span className="text-sm w-32 flex-shrink-0">{label}</span>
                      <span className="text-xs" style={{ color: 'var(--muted-foreground)' }}>→</span>
                      <select className="flex-1">
                        <option>Coluna A</option>
                        <option>Coluna B</option>
                        <option>Coluna C</option>
                        <option>Coluna D</option>
                        <option value="">Não mapear</option>
                      </select>
                    </div>
                  ))}
                </div>
                <button onClick={() => setImportStep(4)} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>Ver prévia →</button>
              </div>
            )}

            {importStep === 4 && (
              <div>
                <h3 className="font-semibold mb-4">Prévia dos dados</h3>
                <div className="rounded-xl overflow-hidden mb-4" style={{ border: '1px solid var(--border)' }}>
                  <table className="w-full">
                    <thead><tr style={{ background: 'var(--secondary)', borderBottom: '1px solid var(--border)' }}>
                      {['Data', 'Descrição', 'Valor', 'Status'].map(h => <th key={h} className="text-left px-3 py-2.5 text-xs font-semibold" style={{ color: 'var(--muted-foreground)' }}>{h}</th>)}
                    </tr></thead>
                    <tbody>
                      {previewData.map((r, i) => (
                        <tr key={i} className="border-t" style={{ borderColor: 'var(--border)', background: r.dup ? 'rgba(245,158,11,0.05)' : 'transparent' }}>
                          <td className="px-3 py-2.5 text-xs mono" style={{ color: 'var(--muted-foreground)' }}>{r.date}</td>
                          <td className="px-3 py-2.5 text-xs">{r.desc}</td>
                          <td className="px-3 py-2.5 text-xs mono" style={{ color: r.value.startsWith('-') ? 'var(--danger)' : 'var(--primary)' }}>{r.value}</td>
                          <td className="px-3 py-2.5 text-xs">
                            {r.dup ? (
                              <span className="flex items-center gap-1" style={{ color: 'var(--warning)' }}><AlertTriangle size={10} /> Duplicata</span>
                            ) : (
                              <span style={{ color: 'var(--primary)' }}>✓ Nova</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <p className="text-xs mb-4" style={{ color: 'var(--muted-foreground)' }}>4 novas transações · 1 duplicata será ignorada</p>
                <div className="flex gap-3">
                  <button onClick={() => setImportStep(2)} className="px-4 py-2 rounded-lg text-sm" style={{ background: 'var(--secondary)', border: '1px solid var(--border)' }}>← Voltar</button>
                  <button onClick={doImport} className="px-5 py-2 rounded-lg text-sm font-medium" style={{ background: 'var(--primary)', color: '#fff' }}>Importar 4 transações</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
