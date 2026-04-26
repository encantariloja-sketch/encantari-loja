'use client'
import { useState, useEffect, useRef } from 'react'
import { Check, Loader2, ImagePlus, Trash2, Plus, X } from 'lucide-react'
import { defaultConfig, type HomeConfig } from '@/lib/homeConfig'

type TermosSecao = { titulo: string; conteudo: string }

export default function AdminPaginasPage() {
  const [bannerSobre, setBannerSobre] = useState<string>('')
  const [bannerTermos, setBannerTermos] = useState<string>('')
  const [ultimaAtualizacao, setUltimaAtualizacao] = useState<string>(defaultConfig.termos.ultima_atualizacao)
  const [secoes, setSecoes] = useState<TermosSecao[]>(defaultConfig.termos.secoes)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [uploadSobre, setUploadSobre] = useState(false)
  const [uploadTermos, setUploadTermos] = useState(false)
  const sobreInputRef = useRef<HTMLInputElement>(null)
  const termosInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/home')
      .then(r => r.json())
      .then(d => {
        const cfg: Partial<HomeConfig> = d.config || {}
        setBannerSobre(cfg.institucional?.banner_imagem || '')
        setBannerTermos(cfg.termos?.banner_imagem || '')
        setUltimaAtualizacao(cfg.termos?.ultima_atualizacao || defaultConfig.termos.ultima_atualizacao)
        setSecoes(cfg.termos?.secoes ?? defaultConfig.termos.secoes)
      })
      .catch(() => {})
      .finally(() => setCarregando(false))
  }, [])

  async function uploadImagem(prefix: string, file: File): Promise<string> {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('prefix', prefix)
    const { url } = await fetch('/api/admin/upload', { method: 'POST', body: fd }).then(r => r.json())
    return url || ''
  }

  async function handleUploadSobre(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadSobre(true)
    const url = await uploadImagem('paginas', files[0])
    if (url) setBannerSobre(url)
    setUploadSobre(false)
  }

  async function handleUploadTermos(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadTermos(true)
    const url = await uploadImagem('paginas', files[0])
    if (url) setBannerTermos(url)
    setUploadTermos(false)
  }

  function atualizarSecao(i: number, campo: keyof TermosSecao, valor: string) {
    setSecoes(s => { const n = [...s]; n[i] = { ...n[i], [campo]: valor }; return n })
  }

  function adicionarSecao() {
    setSecoes(s => [...s, { titulo: `${s.length + 1}. Nova seção`, conteudo: '' }])
  }

  function removerSecao(i: number) {
    setSecoes(s => s.filter((_, idx) => idx !== i))
  }

  async function salvar() {
    setSalvando(true)
    try {
      // Load current config first, then patch only our fields
      const currentRes = await fetch('/api/admin/home')
      const currentData = await currentRes.json()
      const currentCfg: Partial<HomeConfig> = currentData.config || {}

      const updated: Partial<HomeConfig> = {
        ...currentCfg,
        institucional: {
          ...defaultConfig.institucional,
          ...(currentCfg.institucional || {}),
          banner_imagem: bannerSobre || undefined,
        },
        termos: {
          ...defaultConfig.termos,
          ...(currentCfg.termos || {}),
          banner_imagem: bannerTermos || undefined,
          ultima_atualizacao: ultimaAtualizacao,
          secoes,
        },
      }

      const res = await fetch('/api/admin/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config: updated }),
      })
      const data = await res.json()
      if (!res.ok || data.erro) {
        alert('Erro ao salvar: ' + (data.erro || `HTTP ${res.status}`))
      } else {
        setSalvo(true)
        setTimeout(() => setSalvo(false), 2500)
      }
    } catch (e: any) {
      alert('Erro de conexão: ' + e.message)
    }
    setSalvando(false)
  }

  if (carregando) {
    return <div className="flex items-center justify-center py-24"><Loader2 size={32} className="animate-spin text-vinho" /></div>
  }

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Páginas</h1>
          <p className="text-gray-400 text-sm mt-0.5">Sobre a Encantari e Termos de Uso</p>
        </div>
        <button onClick={salvar} disabled={salvando}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all ${salvo ? 'bg-green-500 text-white' : 'bg-vinho text-creme hover:bg-vinho-light'}`}>
          {salvando ? <Loader2 size={16} className="animate-spin" /> : salvo ? <Check size={16} /> : null}
          {salvando ? 'Salvando...' : salvo ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      <div className="space-y-4">

        {/* ── SOBRE: BANNER ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-1">Página "Sobre a Encantari" — Banner</h2>
          <p className="text-xs text-gray-400 mb-4">Foto de fundo para o topo da página Sobre. Aparece escurecida atrás do título.</p>
          {bannerSobre && (
            <div className="relative group w-full h-32 rounded-xl overflow-hidden border border-gray-100 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerSobre} alt="Banner Sobre" className="w-full h-full object-cover" />
              <button
                onClick={() => setBannerSobre('')}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
              </button>
            </div>
          )}
          <input ref={sobreInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleUploadSobre(e.target.files)} />
          <button onClick={() => sobreInputRef.current?.click()} disabled={uploadSobre}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-rosa/40 text-rosa text-sm font-medium hover:border-rosa hover:bg-rosa/5 transition-all disabled:opacity-50">
            {uploadSobre ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            {uploadSobre ? 'Enviando...' : bannerSobre ? 'Trocar foto' : 'Adicionar foto de fundo'}
          </button>
        </div>

        {/* ── TERMOS: BANNER ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-1">Página "Termos de Uso" — Banner</h2>
          <p className="text-xs text-gray-400 mb-4">Foto de fundo para o topo da página de Termos. Opcional.</p>
          {bannerTermos && (
            <div className="relative group w-full h-32 rounded-xl overflow-hidden border border-gray-100 mb-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={bannerTermos} alt="Banner Termos" className="w-full h-full object-cover" />
              <button
                onClick={() => setBannerTermos('')}
                className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                <Trash2 size={14} />
              </button>
            </div>
          )}
          <input ref={termosInputRef} type="file" accept="image/*" className="hidden" onChange={e => handleUploadTermos(e.target.files)} />
          <button onClick={() => termosInputRef.current?.click()} disabled={uploadTermos}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-rosa/40 text-rosa text-sm font-medium hover:border-rosa hover:bg-rosa/5 transition-all disabled:opacity-50">
            {uploadTermos ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
            {uploadTermos ? 'Enviando...' : bannerTermos ? 'Trocar foto' : 'Adicionar foto de fundo'}
          </button>
        </div>

        {/* ── TERMOS: CONTEÚDO ── */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 text-sm mb-1">Termos de Uso — Conteúdo</h2>
          <p className="text-xs text-gray-400 mb-4">Edite as seções que aparecem na página de Termos.</p>

          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Última atualização</label>
            <input
              value={ultimaAtualizacao}
              onChange={e => setUltimaAtualizacao(e.target.value)}
              placeholder="ex: abril de 2025"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-rosa"
            />
          </div>

          <div className="space-y-4 mb-4">
            {secoes.map((s, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-[11px] font-semibold text-gray-400">Seção {i + 1}</p>
                  <button onClick={() => removerSecao(i)} className="p-1 text-gray-300 hover:text-red-500 transition-colors">
                    <X size={15} />
                  </button>
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Título</label>
                  <input
                    value={s.titulo}
                    onChange={e => atualizarSecao(i, 'titulo', e.target.value)}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-rosa"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-gray-500 mb-1">Conteúdo</label>
                  <textarea
                    value={s.conteudo}
                    onChange={e => atualizarSecao(i, 'conteudo', e.target.value)}
                    rows={4}
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-rosa"
                  />
                </div>
              </div>
            ))}
          </div>

          <button onClick={adicionarSecao}
            className="w-full py-3 rounded-xl border-2 border-dashed border-rosa/40 text-rosa text-sm font-medium hover:border-rosa hover:bg-rosa/5 transition-all flex items-center justify-center gap-2">
            <Plus size={16} /> Adicionar seção
          </button>
        </div>

      </div>
    </div>
  )
}
