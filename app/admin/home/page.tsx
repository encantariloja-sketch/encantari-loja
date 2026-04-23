'use client'
import { useState, useEffect, useRef } from 'react'
import { Check, Loader2, ChevronDown, ChevronUp, X, Search, ImagePlus, Trash2 } from 'lucide-react'
import { defaultConfig, type HomeConfig } from '@/lib/homeConfig'
import { produtos as todosProdutos, categorias } from '@/data/produtos'

const CORES_HERO = [
  { label: 'Vinho',  value: '#491E2F' },
  { label: 'Rosa',   value: '#EF9493' },
  { label: 'Oliva',  value: '#8F9150' },
  { label: 'Bege',   value: '#C4956A' },
  { label: 'Escuro', value: '#1a1a1a' },
]

const ICONES_CAT: Record<string, string> = {
  'cafes-chas': '☕', canecas: '🫖', vasos: '🏺',
  'flores-artificiais': '🌸', ceramicas: '🪴', papelaria: '📓', silvanian: '🐿️',
}

type Secao = 'topbar' | 'hero' | 'categorias' | 'lancamentos' | 'mais_vendidos' | 'banner_editorial' | 'banners_menores' | 'institucional' | 'newsletter' | 'configuracoes'

export default function AdminHomePage() {
  const [config, setConfig] = useState<HomeConfig>(defaultConfig)
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [aberto, setAberto] = useState<Secao | null>(null)
  const [picker, setPicker] = useState<'lancamentos' | 'mais_vendidos' | null>(null)
  const [busca, setBusca] = useState('')
  const [uploadandoHero, setUploadandoHero] = useState(false)
  const heroInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch('/api/admin/home')
      .then(r => r.json())
      .then(d => { setConfig(d.config || defaultConfig); setCarregando(false) })
      .catch(() => setCarregando(false))
  }, [])

  async function salvar() {
    setSalvando(true)
    try {
      await fetch('/api/admin/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      setSalvo(true)
      setTimeout(() => setSalvo(false), 2500)
    } catch {}
    setSalvando(false)
  }

  function toggle(secao: Secao) {
    setAberto(a => a === secao ? null : secao)
  }

  function atualizarHero(campo: string, valor: string) {
    setConfig(c => ({ ...c, hero: { ...c.hero, [campo]: valor } }))
  }

  function atualizarBanner(campo: string, valor: string) {
    setConfig(c => ({ ...c, banner_editorial: { ...c.banner_editorial, [campo]: valor } }))
  }

  function toggleCategoria(id: string) {
    setConfig(c => {
      const atual = c.categorias_destaque
      const existe = atual.includes(id)
      return { ...c, categorias_destaque: existe ? atual.filter(x => x !== id) : [...atual, id] }
    })
  }

  function moverCategoria(id: string, dir: 'up' | 'down') {
    setConfig(c => {
      const arr = [...c.categorias_destaque]
      const i = arr.indexOf(id)
      if (dir === 'up' && i > 0) { [arr[i - 1], arr[i]] = [arr[i], arr[i - 1]] }
      if (dir === 'down' && i < arr.length - 1) { [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]] }
      return { ...c, categorias_destaque: arr }
    })
  }

  function addProduto(campo: 'lancamentos_ids' | 'mais_vendidos_ids', id: string) {
    setConfig(c => {
      const arr = c[campo]
      if (arr.includes(id)) return { ...c, [campo]: arr.filter((x: string) => x !== id) }
      return { ...c, [campo]: [...arr, id] }
    })
  }

  function removeProduto(campo: 'lancamentos_ids' | 'mais_vendidos_ids', id: string) {
    setConfig(c => ({ ...c, [campo]: c[campo].filter((x: string) => x !== id) }))
  }

  function atualizarBannerMenor(i: number, campo: string, valor: string) {
    setConfig(c => {
      const banners = [...c.banners_menores]
      banners[i] = { ...banners[i], [campo]: valor }
      return { ...c, banners_menores: banners }
    })
  }

  function atualizarInstitucional(campo: string, valor: string) {
    setConfig(c => ({ ...c, institucional: { ...c.institucional, [campo]: valor } }))
  }

  function atualizarBeneficio(i: number, campo: string, valor: string) {
    setConfig(c => {
      const beneficios = [...c.institucional.beneficios]
      beneficios[i] = { ...beneficios[i], [campo]: valor }
      return { ...c, institucional: { ...c.institucional, beneficios } }
    })
  }

  function atualizarNewsletter(campo: string, valor: string) {
    setConfig(c => ({ ...c, newsletter: { ...c.newsletter, [campo]: valor } }))
  }

  async function uploadHero(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadandoHero(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('prefix', 'hero')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const { url } = await res.json()
      if (url) urls.push(url)
    }
    setConfig(c => ({ ...c, hero: { ...c.hero, imagens: [...(c.hero.imagens || []), ...urls] } }))
    setUploadandoHero(false)
  }

  function removerHeroImagem(idx: number) {
    setConfig(c => ({
      ...c,
      hero: { ...c.hero, imagens: c.hero.imagens.filter((_, i) => i !== idx) },
    }))
  }

  const produtosFiltrados = todosProdutos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) ||
    p.categoria.includes(busca.toLowerCase())
  )

  if (carregando) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin text-vinho" />
    </div>
  )

  const produtoPorId = (id: string) => todosProdutos.find(p => p.id === id)

  return (
    <div className="pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Configurar Home</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tudo que aparece na página inicial</p>
        </div>
        <button
          onClick={salvar}
          disabled={salvando}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all touch-target ${
            salvo ? 'bg-green-500 text-white' : 'bg-vinho text-creme hover:bg-vinho-light'
          }`}
        >
          {salvando ? <Loader2 size={16} className="animate-spin" /> : salvo ? <Check size={16} /> : null}
          {salvando ? 'Salvando...' : salvo ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      <div className="space-y-3">

        {/* ── 1. FAIXA DO TOPO ── */}
        <Secao titulo="Faixa do topo" emoji="📢" sub={config.topbar.slice(0, 50) + '...'} aberto={aberto === 'topbar'} onToggle={() => toggle('topbar')}>
          <textarea
            value={config.topbar}
            onChange={e => setConfig(c => ({ ...c, topbar: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa"
            rows={2}
            placeholder="Texto da faixa promocional..."
          />
        </Secao>

        {/* ── 2. HERO ── */}
        <Secao titulo="Hero principal" emoji="🎯" sub="Título, fotos de capa e botões" aberto={aberto === 'hero'} onToggle={() => toggle('hero')}>
          <div className="space-y-4">

            {/* Fotos do carrossel */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">
                Fotos do banner <span className="text-gray-400 font-normal">(carrossel automático)</span>
              </label>
              {(config.hero.imagens || []).length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {config.hero.imagens.map((url, i) => (
                    <div key={url} className="relative group w-20 h-14 rounded-xl overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removerHeroImagem(i)}
                        className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input
                ref={heroInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={e => uploadHero(e.target.files)}
              />
              <button
                onClick={() => heroInputRef.current?.click()}
                disabled={uploadandoHero}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-rosa/40 text-rosa text-sm font-medium hover:border-rosa hover:bg-rosa/5 transition-all disabled:opacity-50"
              >
                {uploadandoHero ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploadandoHero ? 'Enviando...' : 'Adicionar fotos'}
              </button>
              <p className="text-[11px] text-gray-400 mt-1.5">Selecione várias fotos de uma vez. Sem fotos, usa a cor de fundo.</p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
              <textarea
                value={config.hero.headline}
                onChange={e => atualizarHero('headline', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa"
                rows={2}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
              <textarea
                value={config.hero.subheadline}
                onChange={e => atualizarHero('subheadline', e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Texto do botão principal</label>
                <input value={config.hero.cta_texto} onChange={e => atualizarHero('cta_texto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link do botão principal</label>
                <input value={config.hero.cta_link} onChange={e => atualizarHero('cta_link', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Texto do 2º botão</label>
                <input value={config.hero.cta2_texto} onChange={e => atualizarHero('cta2_texto', e.target.value)} placeholder="Deixe em branco para ocultar" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link do 2º botão</label>
                <input value={config.hero.cta2_link} onChange={e => atualizarHero('cta2_link', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Cor de fundo (quando sem foto)</label>
              <div className="flex gap-2 flex-wrap">
                {CORES_HERO.map(c => (
                  <button
                    key={c.value}
                    onClick={() => atualizarHero('cor_fundo', c.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${config.hero.cor_fundo === c.value ? 'border-vinho' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value + '22' }}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl p-4 text-white text-sm font-fraunces font-semibold transition-all" style={{ backgroundColor: config.hero.cor_fundo }}>
                {config.hero.headline}
              </div>
            </div>
          </div>
        </Secao>

        {/* ── 3. CATEGORIAS ── */}
        <Secao titulo="Categorias em destaque" emoji="📂" sub={`${config.categorias_destaque.length} categorias selecionadas`} aberto={aberto === 'categorias'} onToggle={() => toggle('categorias')}>
          <p className="text-xs text-gray-400 mb-3">Ative/desative e use as setas para ordenar</p>
          <div className="space-y-2">
            {categorias.map(cat => {
              const ativo = config.categorias_destaque.includes(cat.id)
              const idx = config.categorias_destaque.indexOf(cat.id)
              return (
                <div key={cat.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${ativo ? 'border-vinho/30 bg-vinho/5' : 'border-gray-100 bg-white'}`}>
                  <button
                    onClick={() => toggleCategoria(cat.id)}
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${ativo ? 'bg-vinho border-vinho' : 'border-gray-300'}`}
                  >
                    {ativo && <Check size={12} className="text-white" />}
                  </button>
                  <span className="text-xl">{cat.icone}</span>
                  <span className="flex-1 text-sm font-medium text-gray-800">{cat.nome}</span>
                  {ativo && (
                    <div className="flex gap-1">
                      <button onClick={() => moverCategoria(cat.id, 'up')} disabled={idx === 0} className="p-1 text-gray-400 hover:text-vinho disabled:opacity-30"><ChevronUp size={16} /></button>
                      <button onClick={() => moverCategoria(cat.id, 'down')} disabled={idx === config.categorias_destaque.length - 1} className="p-1 text-gray-400 hover:text-vinho disabled:opacity-30"><ChevronDown size={16} /></button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </Secao>

        {/* ── 4. LANÇAMENTOS ── */}
        <Secao titulo="Lançamentos" emoji="🆕" sub={config.lancamentos_ids.length ? `${config.lancamentos_ids.length} produtos selecionados` : 'Automático (produtos com badge Novo)'} aberto={aberto === 'lancamentos'} onToggle={() => toggle('lancamentos')}>
          <div className="space-y-2 mb-3">
            {config.lancamentos_ids.length === 0 && <p className="text-xs text-gray-400 py-2">Nenhum produto fixado — exibe automaticamente os mais novos.</p>}
            {config.lancamentos_ids.map(id => {
              const p = produtoPorId(id)
              if (!p) return null
              return (
                <div key={id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl">{ICONES_CAT[p.categoria] || '📦'}</div>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{p.nome}</span>
                  <button onClick={() => removeProduto('lancamentos_ids', id)} className="p-1.5 text-gray-400 hover:text-red-500"><X size={16} /></button>
                </div>
              )
            })}
          </div>
          <button onClick={() => { setPicker('lancamentos'); setBusca('') }} className="w-full py-3 rounded-xl border-2 border-dashed border-rosa/40 text-rosa text-sm font-medium hover:border-rosa hover:bg-rosa/5 transition-all">
            + Adicionar produto
          </button>
        </Secao>

        {/* ── 5. MAIS VENDIDOS ── */}
        <Secao titulo="Mais Vendidos" emoji="⭐" sub={config.mais_vendidos_ids.length ? `${config.mais_vendidos_ids.length} produtos selecionados` : 'Automático (flag maisVendido)'} aberto={aberto === 'mais_vendidos'} onToggle={() => toggle('mais_vendidos')}>
          <div className="space-y-2 mb-3">
            {config.mais_vendidos_ids.length === 0 && <p className="text-xs text-gray-400 py-2">Nenhum produto fixado — exibe automaticamente os mais vendidos.</p>}
            {config.mais_vendidos_ids.map(id => {
              const p = produtoPorId(id)
              if (!p) return null
              return (
                <div key={id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl">{ICONES_CAT[p.categoria] || '📦'}</div>
                  <span className="flex-1 text-sm font-medium text-gray-800 truncate">{p.nome}</span>
                  <button onClick={() => removeProduto('mais_vendidos_ids', id)} className="p-1.5 text-gray-400 hover:text-red-500"><X size={16} /></button>
                </div>
              )
            })}
          </div>
          <button onClick={() => { setPicker('mais_vendidos'); setBusca('') }} className="w-full py-3 rounded-xl border-2 border-dashed border-vinho/30 text-vinho text-sm font-medium hover:border-vinho hover:bg-vinho/5 transition-all">
            + Adicionar produto
          </button>
        </Secao>

        {/* ── 6. BANNER EDITORIAL ── */}
        <Secao titulo="Banner editorial" emoji="📸" sub="Banner intermediário entre as vitrines" aberto={aberto === 'banner_editorial'} onToggle={() => toggle('banner_editorial')}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
              <input value={config.banner_editorial.texto} onChange={e => atualizarBanner('texto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subtexto</label>
              <textarea value={config.banner_editorial.subtexto} onChange={e => atualizarBanner('subtexto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Botão</label>
                <input value={config.banner_editorial.cta_texto} onChange={e => atualizarBanner('cta_texto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link</label>
                <input value={config.banner_editorial.cta_link} onChange={e => atualizarBanner('cta_link', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Cor</label>
              <div className="flex gap-2 flex-wrap">
                {CORES_HERO.map(c => (
                  <button key={c.value} onClick={() => atualizarBanner('cor_fundo', c.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs border-2 transition-all ${config.banner_editorial.cor_fundo === c.value ? 'border-vinho' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value + '22' }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />{c.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </Secao>

        {/* ── 7. BANNERS MENORES ── */}
        <Secao titulo="Banners menores" emoji="🗂️" sub="3 banners no rodapé da home" aberto={aberto === 'banners_menores'} onToggle={() => toggle('banners_menores')}>
          <div className="space-y-4">
            {config.banners_menores.map((b, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500">Banner {i + 1}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Título</label>
                    <input value={b.titulo} onChange={e => atualizarBannerMenor(i, 'titulo', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-rosa" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Subtítulo</label>
                    <input value={b.subtitulo} onChange={e => atualizarBannerMenor(i, 'subtitulo', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-rosa" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Link</label>
                    <input value={b.link} onChange={e => atualizarBannerMenor(i, 'link', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-rosa" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Cor</label>
                    <input type="color" value={b.cor} onChange={e => atualizarBannerMenor(i, 'cor', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" />
                  </div>
                </div>
                <div className="rounded-lg p-3 text-white text-xs font-fraunces font-semibold" style={{ backgroundColor: b.cor }}>
                  {b.titulo} — {b.subtitulo}
                </div>
              </div>
            ))}
          </div>
        </Secao>

        {/* ── 8. BLOCO INSTITUCIONAL ── */}
        <Secao titulo="Bloco institucional" emoji="🏡" sub="Textos e cards da seção 'Nossa proposta'" aberto={aberto === 'institucional'} onToggle={() => toggle('institucional')}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Label (acima do título)</label>
                <input value={config.institucional.label} onChange={e => atualizarInstitucional('label', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Título linha 1</label>
                <input value={config.institucional.titulo} onChange={e => atualizarInstitucional('titulo', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título linha 2 (itálico, em rosa)</label>
              <input value={config.institucional.titulo_italic} onChange={e => atualizarInstitucional('titulo_italic', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Parágrafo</label>
              <textarea value={config.institucional.corpo} onChange={e => atualizarInstitucional('corpo', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={4} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Texto do botão</label>
                <input value={config.institucional.cta_texto} onChange={e => atualizarInstitucional('cta_texto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Link do botão</label>
                <input value={config.institucional.cta_link} onChange={e => atualizarInstitucional('cta_link', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
              </div>
            </div>
            <p className="text-xs font-semibold text-gray-500 pt-1">Cards de benefícios</p>
            {config.institucional.beneficios.map((b, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3 space-y-2">
                <p className="text-[11px] text-gray-400 font-medium">Card {i + 1}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Emoji</label>
                    <input value={b.emoji} onChange={e => atualizarBeneficio(i, 'emoji', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-center text-lg focus:outline-none focus:border-rosa" maxLength={4} />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Título</label>
                    <input value={b.titulo} onChange={e => atualizarBeneficio(i, 'titulo', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-rosa" />
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-500 mb-1">Subtítulo</label>
                    <input value={b.sub} onChange={e => atualizarBeneficio(i, 'sub', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-rosa" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Secao>

        {/* ── 9. NEWSLETTER ── */}
        <Secao titulo="Newsletter" emoji="📧" sub="Título e subtítulo da seção de email" aberto={aberto === 'newsletter'} onToggle={() => toggle('newsletter')}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
              <input value={config.newsletter.headline} onChange={e => atualizarNewsletter('headline', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
              <textarea value={config.newsletter.subtitulo} onChange={e => atualizarNewsletter('subtitulo', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={2} />
            </div>
          </div>
        </Secao>

        {/* ── 10. CONFIGURAÇÕES DA LOJA ── */}
        <Secao titulo="Configurações da loja" emoji="⚙️" sub="WhatsApp e dados de contato" aberto={aberto === 'configuracoes'} onToggle={() => toggle('configuracoes')}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Número do WhatsApp</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">+</span>
                <input
                  value={config.whatsapp}
                  onChange={e => setConfig(c => ({ ...c, whatsapp: e.target.value }))}
                  className="w-full border border-gray-200 rounded-xl pl-7 pr-4 py-3 text-sm focus:outline-none focus:border-rosa"
                  placeholder="55 (11) 99999-9999 (só números)"
                />
              </div>
              <p className="text-[11px] text-gray-400 mt-1">Digite somente os números com DDD e DDI. Ex: 5511999999999</p>
              {config.whatsapp && (
                <a
                  href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs text-green-600 mt-2 font-medium"
                >
                  ✓ Testar link do WhatsApp
                </a>
              )}
            </div>
          </div>
        </Secao>

      </div>

      {/* ═══ PRODUTO PICKER MODAL ═══ */}
      {picker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end md:justify-center md:items-center">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md md:mx-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{picker === 'lancamentos' ? 'Lançamentos' : 'Mais Vendidos'}</h3>
              <button onClick={() => setPicker(null)} className="p-2 text-gray-400 hover:text-gray-700"><X size={20} /></button>
            </div>
            <div className="px-4 py-3 border-b border-gray-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input autoFocus type="text" placeholder="Buscar produto..." value={busca} onChange={e => setBusca(e.target.value)} className="w-full pl-9 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-rosa bg-gray-50" />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
              {produtosFiltrados.map(p => {
                const campo = picker === 'lancamentos' ? 'lancamentos_ids' : 'mais_vendidos_ids'
                const selecionado = config[campo].includes(p.id)
                return (
                  <button key={p.id} onClick={() => addProduto(campo, p.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${selecionado ? 'border-vinho bg-vinho/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">{ICONES_CAT[p.categoria] || '📦'}</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900 text-sm truncate">{p.nome}</p>
                      <p className="text-gray-400 text-xs">R$ {p.preco.toFixed(2).replace('.', ',')}</p>
                    </div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${selecionado ? 'bg-vinho border-vinho' : 'border-gray-300'}`}>
                      {selecionado && <Check size={12} className="text-white" />}
                    </div>
                  </button>
                )
              })}
            </div>
            <div className="px-4 py-4 border-t border-gray-100">
              <button onClick={() => setPicker(null)} className="w-full py-3.5 bg-vinho text-creme rounded-full font-semibold text-sm">Confirmar seleção</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Secao({ titulo, emoji, sub, aberto, onToggle, children }: {
  titulo: string; emoji: string; sub: string;
  aberto: boolean; onToggle: () => void;
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left touch-target">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-gray-900 text-sm">{titulo}</p>
          <p className="text-gray-400 text-xs mt-0.5 truncate">{sub}</p>
        </div>
        {aberto ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
      </button>
      {aberto && (
        <div className="px-4 pb-5 border-t border-gray-50 pt-4">
          {children}
        </div>
      )}
    </div>
  )
}
