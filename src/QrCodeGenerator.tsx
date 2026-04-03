import { useState, useEffect, useRef, useCallback } from 'react'
import { Copy, Check, Sun, Moon, Languages, QrCode, Download } from 'lucide-react'
import QRCode from 'qrcode'

// ── i18n ─────────────────────────────────────────────────────────────────────
const translations = {
  en: {
    title: 'QR Code Generator',
    subtitle: 'Generate QR codes from any text or URL. Download as SVG or PNG. Client-side only.',
    input: 'Content',
    inputDesc: 'Enter text or URL to encode',
    inputPlaceholder: 'https://github.com/gmowses or any text...',
    settings: 'Settings',
    size: 'Size',
    pixels: 'px',
    errorLevel: 'Error Correction',
    low: 'Low (L)',
    medium: 'Medium (M)',
    quartile: 'Quartile (Q)',
    high: 'High (H)',
    fgColor: 'Foreground',
    bgColor: 'Background',
    copy: 'Copy URL',
    copied: 'Copied!',
    downloadSvg: 'Download SVG',
    downloadPng: 'Download PNG',
    generate: 'Generate',
    preview: 'QR Code',
    builtBy: 'Built by',
    empty: 'Enter text to generate QR code',
  },
  pt: {
    title: 'Gerador de QR Code',
    subtitle: 'Gere QR codes de qualquer texto ou URL. Baixe como SVG ou PNG. Tudo no navegador.',
    input: 'Conteudo',
    inputDesc: 'Digite texto ou URL para codificar',
    inputPlaceholder: 'https://github.com/gmowses ou qualquer texto...',
    settings: 'Configuracoes',
    size: 'Tamanho',
    pixels: 'px',
    errorLevel: 'Correcao de Erros',
    low: 'Baixa (L)',
    medium: 'Media (M)',
    quartile: 'Quartil (Q)',
    high: 'Alta (H)',
    fgColor: 'Cor do Codigo',
    bgColor: 'Cor de Fundo',
    copy: 'Copiar URL',
    copied: 'Copiado!',
    downloadSvg: 'Baixar SVG',
    downloadPng: 'Baixar PNG',
    generate: 'Gerar',
    preview: 'QR Code',
    builtBy: 'Criado por',
    empty: 'Digite texto para gerar o QR Code',
  }
} as const
type Lang = keyof typeof translations
type ErrorLevel = 'L' | 'M' | 'Q' | 'H'

export default function QrCodeGenerator() {
  const [lang, setLang] = useState<Lang>(() => navigator.language.startsWith('pt') ? 'pt' : 'en')
  const [dark, setDark] = useState(() => window.matchMedia('(prefers-color-scheme: dark)').matches)
  const [input, setInput] = useState('https://github.com/gmowses')
  const [size, setSize] = useState(256)
  const [errorLevel, setErrorLevel] = useState<ErrorLevel>('M')
  const [fgColor, setFgColor] = useState('#09090b')
  const [bgColor, setBgColor] = useState('#ffffff')
  const [svgData, setSvgData] = useState('')
  const [copied, setCopied] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const t = translations[lang]
  useEffect(() => { document.documentElement.classList.toggle('dark', dark) }, [dark])

  const generateQR = useCallback(async () => {
    if (!input.trim()) { setSvgData(''); return }
    try {
      const svg = await QRCode.toString(input, {
        type: 'svg',
        width: size,
        errorCorrectionLevel: errorLevel,
        color: { dark: fgColor, light: bgColor },
        margin: 2,
      })
      setSvgData(svg)

      // Also render to canvas for PNG download
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, input, {
          width: size,
          errorCorrectionLevel: errorLevel,
          color: { dark: fgColor, light: bgColor },
          margin: 2,
        })
      }
    } catch {
      setSvgData('')
    }
  }, [input, size, errorLevel, fgColor, bgColor])

  useEffect(() => { void generateQR() }, [generateQR])

  const downloadSvg = () => {
    if (!svgData) return
    const blob = new Blob([svgData], { type: 'image/svg+xml' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'qrcode.svg'; a.click()
    URL.revokeObjectURL(url)
  }

  const downloadPng = () => {
    if (!canvasRef.current) return
    const url = canvasRef.current.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url; a.download = 'qrcode.png'; a.click()
  }

  const copyInput = () => {
    navigator.clipboard.writeText(input).then(() => { setCopied(true); setTimeout(() => setCopied(false), 2000) })
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors">
      <header className="border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-zinc-800 dark:bg-zinc-200 rounded-lg flex items-center justify-center">
              <QrCode size={18} className="text-white dark:text-zinc-900" />
            </div>
            <span className="font-semibold">QR Code Generator</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setLang(l => l === 'en' ? 'pt' : 'en')} className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <Languages size={14} />{lang.toUpperCase()}
            </button>
            <button onClick={() => setDark(d => !d)} className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              {dark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <a href="https://github.com/gmowses/qr-code-generator" target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0024 12c0-6.63-5.37-12-12-12z"/></svg>
            </a>
          </div>
        </div>
      </header>

      <main className="flex-1 px-6 py-10">
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-3xl font-bold">{t.title}</h1>
            <p className="mt-2 text-zinc-500 dark:text-zinc-400">{t.subtitle}</p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Settings */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
              <div>
                <h2 className="font-semibold">{t.input}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{t.inputDesc}</p>
              </div>

              <div className="space-y-2">
                <textarea
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  rows={3}
                  className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 px-3 py-2 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-zinc-500"
                />
                <button onClick={copyInput} className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors">
                  {copied ? <Check size={12} className="text-green-500" /> : <Copy size={12} />}
                  {copied ? t.copied : t.copy}
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-sm font-medium">{t.settings}</p>

                {/* Size */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">{t.size}</label>
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-400 tabular-nums">{size}{t.pixels}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button onClick={() => setSize(s => Math.max(64, s - 32))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">-</button>
                    <input type="range" min={64} max={512} step={32} value={size} onChange={e => setSize(Number(e.target.value))} className="h-1.5 w-full cursor-pointer accent-zinc-600 dark:accent-zinc-400" />
                    <button onClick={() => setSize(s => Math.min(512, s + 32))} className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 text-sm font-bold hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">+</button>
                  </div>
                </div>

                {/* Error correction */}
                <div className="space-y-2">
                  <label className="text-sm">{t.errorLevel}</label>
                  <div className="flex gap-2">
                    {(['L', 'M', 'Q', 'H'] as ErrorLevel[]).map(level => (
                      <button
                        key={level}
                        onClick={() => setErrorLevel(level)}
                        className={`flex-1 py-1.5 text-xs font-medium rounded-md border transition-colors ${errorLevel === level ? 'bg-zinc-800 dark:bg-zinc-200 border-zinc-800 dark:border-zinc-200 text-white dark:text-zinc-900' : 'border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                      >
                        {level}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Colors */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-sm">{t.fgColor}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="h-8 w-12 cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5" />
                      <input type="text" value={fgColor} onChange={e => setFgColor(e.target.value)} className="flex-1 font-mono text-xs border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-sm">{t.bgColor}</label>
                    <div className="flex items-center gap-2">
                      <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="h-8 w-12 cursor-pointer rounded-md border border-zinc-200 dark:border-zinc-700 bg-transparent p-0.5" />
                      <input type="text" value={bgColor} onChange={e => setBgColor(e.target.value)} className="flex-1 font-mono text-xs border border-zinc-200 dark:border-zinc-700 rounded-md px-2 py-1 bg-zinc-50 dark:bg-zinc-800/50 focus:outline-none" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-6 space-y-5">
              <div>
                <h2 className="font-semibold">{t.preview}</h2>
              </div>
              <div className="flex items-center justify-center min-h-[200px]">
                {svgData ? (
                  <div
                    className="rounded-xl overflow-hidden shadow-md"
                    style={{ width: Math.min(size, 300), height: Math.min(size, 300) }}
                    dangerouslySetInnerHTML={{ __html: svgData }}
                  />
                ) : (
                  <p className="text-sm text-zinc-400 italic">{t.empty}</p>
                )}
              </div>
              <canvas ref={canvasRef} style={{ display: 'none' }} />
              {svgData && (
                <div className="flex gap-3">
                  <button onClick={downloadSvg} className="flex-1 flex items-center justify-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                    <Download size={15} />{t.downloadSvg}
                  </button>
                  <button onClick={downloadPng} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-zinc-800 dark:bg-zinc-200 text-white dark:text-zinc-900 px-4 py-2.5 text-sm font-medium hover:bg-zinc-700 dark:hover:bg-zinc-300 transition-colors">
                    <Download size={15} />{t.downloadPng}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between text-xs text-zinc-400">
          <span>{t.builtBy} <a href="https://github.com/gmowses" className="text-zinc-600 dark:text-zinc-300 hover:text-zinc-500 transition-colors">Gabriel Mowses</a></span>
          <span>MIT License</span>
        </div>
      </footer>
    </div>
  )
}
