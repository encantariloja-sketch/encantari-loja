'use client'
import { useState, useEffect, useRef } from 'react'
import { Check, Loader2, ChevronDown, ChevronUp, X, Search, ImagePlus, Trash2, Plus } from 'lucide-react'
import { defaultConfig, type HomeConfig } from '@/lib/homeConfig'
import { produtos as todosProdutos } from '@/data/produtos'

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

type CatItem = { id: string; nome: string; icone: string; cor?: string }
type Secao = 'topbar' | 'hero' | 'categorias' | 'lancamentos' | 'mais_vendidos' | 'banner_editorial' | 'banners_menores' | 'institucional' | 'newsletter' | 'rodape' | 'configuracoes'

function mergeConfig(saved: Partial<HomeConfig>): HomeConfig {
  const savedRodape = (saved.rodape || {}) as Partial<HomeConfig['rodape']>
  return {
    ...defaultConfig,
    ...saved,
    hero: { ...defaultConfig.hero, ...(saved.hero || {}) },
    banner_editorial: { ...defaultConfig.banner_editorial, ...(saved.banner_editorial || {}) },
    institucional: {
      ...defaultConfig.institucional,
      ...(saved.institucional || {}),
      beneficios: saved.institucional?.beneficios ?? defaultConfig.institucional.beneficios,
    },
    newsletter: { ...defaultConfig.newsletter, ...(saved.newsletter || {}) },
    rodape: {
      ...defaultConfig.rodape,
      ...savedRodape,
      ajuda: savedRodape.ajuda ?? defaultConfig.rodape.ajuda,
      institucional: savedRodape.institucional ?? defaultConfig.rodape.institucional,
    },
  }
}

export default function AdminHomePage() {
  const [config, setConfig] = useState<HomeConfig>(defaultConfig)
  const [categoriasLista, setCategoriasLista] = useState<CatItem[]>([])
  const [salvando, setSalvando] = useState(false)
  const [salvo, setSalvo] = useState(false)
  const [carregando, setCarregando] = useState(true)
  const [aberto, setAberto] = useState<Secao | null>(null)
  const [picker, setPicker] = useState<'lancamentos' | 'mais_vendidos' | null>(null)
  const [busca, setBusca] = useState('')
  const [uploadandoHero, setUploadandoHero] = useState(false)
  const heroInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/home').then(r => r.json()),
      fetch('/api/admin/categorias').then(r => r.json()),
    ]).then(([homeData, catData]) => {
      setConfig(mergeConfig(homeData.config || {}))
      setCategoriasLista(catData.categorias || [])
      setCarregando(false)
    }).catch(() => setCarregando(false))
  }, [])

  async function salvar() {
    setSalvando(true)
    try {
      const res = await fetch('/api/admin/home', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ config }),
      })
      const data = await res.json()
      if (!res.ok || data.erro) {
        alert('Erro ao salvar: ' + (data.erro || `HTTP ${res.status}`))
      } else if (data.aviso) {
        alert('Atenção: ' + data.aviso)
      } else {
        setSalvo(true)
        setTimeout(() => setSalvo(false), 2500)
      }
    } catch (e: any) {
      alert('Erro de conexão: ' + e.message)
    }
    setSalvando(false)
  }

  function toggle(secao: Secao) { setAberto(a => a === secao ? null : secao) }
  function atualizarHero(campo: string, valor: string) { setConfig(c => ({ ...c, hero: { ...c.hero, [campo]: valor } })) }
  function atualizarBanner(campo: string, valor: string) { setConfig(c => ({ ...c, banner_editorial: { ...c.banner_editorial, [campo]: valor } })) }
  function atualizarInstitucional(campo: string, valor: string) { setConfig(c => ({ ...c, institucional: { ...c.institucional, [campo]: valor } })) }
  function atualizarBeneficio(i: number, campo: string, valor: string) {
    setConfig(c => { const b = [...c.institucional.beneficios]; b[i] = { ...b[i], [campo]: valor }; return { ...c, institucional: { ...c.institucional, beneficios: b } } })
  }
  function atualizarNewsletter(campo: string, valor: string) { setConfig(c => ({ ...c, newsletter: { ...c.newsletter, [campo]: valor } })) }
  function atualizarRodape(campo: string, valor: string) { setConfig(c => ({ ...c, rodape: { ...c.rodape, [campo]: valor } })) }

  function toggleCategoria(id: string) {
    setConfig(c => {
      const atual = c.categorias_destaque
      return { ...c, categorias_destaque: atual.includes(id) ? atual.filter(x => x !== id) : [...atual, id] }
    })
  }
  function moverCategoria(id: string, dir: 'up' | 'down') {
    setConfig(c => {
      const arr = [...c.categorias_destaque]; const i = arr.indexOf(id)
      if (dir === 'up' && i > 0) { [arr[i-1], arr[i]] = [arr[i], arr[i-1]] }
      if (dir === 'down' && i < arr.length - 1) { [arr[i], arr[i+1]] = [arr[i+1], arr[i]] }
      return { ...c, categorias_destaque: arr }
    })
  }
  function addProduto(campo: 'lancamentos_ids' | 'mais_vendidos_ids', id: string) {
    setConfig(c => { const arr = c[campo]; return { ...c, [campo]: arr.includes(id) ? arr.filter((x:string) => x !== id) : [...arr, id] } })
  }
  function removeProduto(campo: 'lancamentos_ids' | 'mais_vendidos_ids', id: string) {
    setConfig(c => ({ ...c, [campo]: c[campo].filter((x:string) => x !== id) }))
  }
  function atualizarBannerMenor(i: number, campo: string, valor: string) {
    setConfig(c => { const b = [...c.banners_menores]; b[i] = { ...b[i], [campo]: valor }; return { ...c, banners_menores: b } })
  }

  // Rodapé links
  function atualizarLinkRodape(secao: 'ajuda' | 'institucional', i: number, campo: 'label' | 'href', valor: string) {
    setConfig(c => {
      const arr = [...c.rodape[secao]]
      arr[i] = { ...arr[i], [campo]: valor }
      return { ...c, rodape: { ...c.rodape, [secao]: arr } }
    })
  }
  function adicionarLinkRodape(secao: 'ajuda' | 'institucional') {
    setConfig(c => ({ ...c, rodape: { ...c.rodape, [secao]: [...c.rodape[secao], { label: '', href: '/' }] } }))
  }
  function removerLinkRodape(secao: 'ajuda' | 'institucional', i: number) {
    setConfig(c => ({ ...c, rodape: { ...c.rodape, [secao]: c.rodape[secao].filter((_, idx) => idx !== i) } }))
  }

  // Hero images
  async function uploadHero(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadandoHero(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData(); fd.append('file', file); fd.append('prefix', 'hero')
      const { url } = await fetch('/api/admin/upload', { method: 'POST', body: fd }).then(r => r.json())
      if (url) urls.push(url)
    }
    setConfig(c => ({ ...c, hero: { ...c.hero, imagens: [...(c.hero.imagens || []), ...urls] } }))
    setUploadandoHero(false)
  }
  function removerHeroImagem(idx: number) {
    setConfig(c => ({ ...c, hero: { ...c.hero, imagens: c.hero.imagens.filter((_, i) => i !== idx) } }))
  }

  const produtosFiltrados = todosProdutos.filter(p =>
    p.nome.toLowerCase().includes(busca.toLowerCase()) || p.categoria.includes(busca.toLowerCase())
  )
  const produtoPorId = (id: string) => todosProdutos.find(p => p.id === id)

  if (carregando) return <div className="flex items-center justify-center py-24"><Loader2 size={32} className="animate-spin text-vinho" /></div>

  return (
    <div className="pb-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Configurar Home</h1>
          <p className="text-gray-400 text-sm mt-0.5">Tudo que aparece na página inicial</p>
        </div>
        <button onClick={salvar} disabled={salvando}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold transition-all touch-target ${salvo ? 'bg-green-500 text-white' : 'bg-vinho text-creme hover:bg-vinho-light'}`}>
          {salvando ? <Loader2 size={16} className="animate-spin" /> : salvo ? <Check size={16} /> : null}
          {salvando ? 'Salvando...' : salvo ? 'Salvo!' : 'Salvar'}
        </button>
      </div>

      <div className="space-y-3">

        {/* ── 1. FAIXA DO TOPO ── */}
        <Secao titulo="Faixa do topo" emoji="📢" sub={config.topbar.slice(0, 50) + '...'} aberto={aberto === 'topbar'} onToggle={() => toggle('topbar')}>
          <textarea value={config.topbar} onChange={e => setConfig(c => ({ ...c, topbar: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={2} />
        </Secao>

        {/* ── 2. HERO ── */}
        <Secao titulo="Hero principal" emoji="🎯" sub="Título, fotos de capa e botões" aberto={aberto === 'hero'} onToggle={() => toggle('hero')}>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Fotos do banner <span className="text-gray-400 font-normal">(carrossel automático)</span></label>
              {(config.hero.imagens || []).length > 0 && (
                <div className="flex gap-2 flex-wrap mb-3">
                  {config.hero.imagens.map((url, i) => (
                    <div key={url} className="relative group w-20 h-14 rounded-xl overflow-hidden border border-gray-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt={`Foto ${i+1}`} className="w-full h-full object-cover" />
                      <button onClick={() => removerHeroImagem(i)} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Trash2 size={16} className="text-white" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <input ref={heroInputRef} type="file" accept="image/*" multiple className="hidden" onChange={e => uploadHero(e.target.files)} />
              <button onClick={() => heroInputRef.current?.click()} disabled={uploadandoHero}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-rosa/40 text-rosa text-sm font-medium hover:border-rosa hover:bg-rosa/5 transition-all disabled:opacity-50">
                {uploadandoHero ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploadandoHero ? 'Enviando...' : 'Adicionar fotos'}
              </button>
              <p className="text-[11px] text-gray-400 mt-1.5">Sem fotos, usa a cor de fundo abaixo.</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Título</label>
              <textarea value={config.hero.headline} onChange={e => atualizarHero('headline', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={2} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label>
              <textarea value={config.hero.subheadline} onChange={e => atualizarHero('subheadline', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={2} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Botão principal — texto</label><input value={config.hero.cta_texto} onChange={e => atualizarHero('cta_texto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Botão principal — link</label><input value={config.hero.cta_link} onChange={e => atualizarHero('cta_link', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">2º botão — texto</label><input value={config.hero.cta2_texto} onChange={e => atualizarHero('cta2_texto', e.target.value)} placeholder="Deixe vazio para ocultar" className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">2º botão — link</label><input value={config.hero.cta2_link} onChange={e => atualizarHero('cta2_link', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-2">Cor de fundo (quando sem foto)</label>
              <div className="flex gap-2 flex-wrap">
                {CORES_HERO.map(c => (
                  <button key={c.value} onClick={() => atualizarHero('cor_fundo', c.value)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-xs font-medium border-2 transition-all ${config.hero.cor_fundo === c.value ? 'border-vinho' : 'border-transparent'}`}
                    style={{ backgroundColor: c.value + '22' }}>
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: c.value }} />{c.label}
                  </button>
                ))}
              </div>
              <div className="mt-3 rounded-xl p-4 text-white text-sm font-fraunces font-semibold" style={{ backgroundColor: config.hero.cor_fundo }}>{config.hero.headline}</div>
            </div>
          </div>
        </Secao>

        {/* ── 3. CATEGORIAS ── */}
        <Secao titulo="Categorias em destaque" emoji="📂" sub={`${config.categorias_destaque.length} categorias selecionadas`} aberto={aberto === 'categorias'} onToggle={() => toggle('categorias')}>
          <p className="text-xs text-gray-400 mb-3">Ative/desative e use as setas para ordenar</p>
          {categoriasLista.length === 0 && <p className="text-xs text-gray-400 py-2">Carregando categorias...</p>}
          <div className="space-y-2">
            {categoriasLista.map(cat => {
              const ativo = config.categorias_destaque.includes(cat.id)
              const idx = config.categorias_destaque.indexOf(cat.id)
              return (
                <div key={cat.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${ativo ? 'border-vinho/30 bg-vinho/5' : 'border-gray-100 bg-white'}`}>
                  <button onClick={() => toggleCategoria(cat.id)} className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${ativo ? 'bg-vinho border-vinho' : 'border-gray-300'}`}>
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
        <Secao titulo="Lançamentos" emoji="🆕" sub={config.lancamentos_ids.length ? `${config.lancamentos_ids.length} produtos selecionados` : 'Automático'} aberto={aberto === 'lancamentos'} onToggle={() => toggle('lancamentos')}>
          <div className="space-y-2 mb-3">
            {config.lancamentos_ids.length === 0 && <p className="text-xs text-gray-400 py-2">Nenhum fixado — exibe automaticamente os mais novos.</p>}
            {config.lancamentos_ids.map(id => { const p = produtoPorId(id); if (!p) return null; return (
              <div key={id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl">{ICONES_CAT[p.categoria] || '📦'}</div>
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{p.nome}</span>
                <button onClick={() => removeProduto('lancamentos_ids', id)} className="p-1.5 text-gray-400 hover:text-red-500"><X size={16} /></button>
              </div>
            )})}
          </div>
          <button onClick={() => { setPicker('lancamentos'); setBusca('') }} className="w-full py-3 rounded-xl border-2 border-dashed border-rosa/40 text-rosa text-sm font-medium hover:border-rosa hover:bg-rosa/5 transition-all">+ Adicionar produto</button>
        </Secao>

        {/* ── 5. MAIS VENDIDOS ── */}
        <Secao titulo="Mais Vendidos" emoji="⭐" sub={config.mais_vendidos_ids.length ? `${config.mais_vendidos_ids.length} produtos selecionados` : 'Automático'} aberto={aberto === 'mais_vendidos'} onToggle={() => toggle('mais_vendidos')}>
          <div className="space-y-2 mb-3">
            {config.mais_vendidos_ids.length === 0 && <p className="text-xs text-gray-400 py-2">Nenhum fixado — exibe automaticamente os mais vendidos.</p>}
            {config.mais_vendidos_ids.map(id => { const p = produtoPorId(id); if (!p) return null; return (
              <div key={id} className="flex items-center gap-3 bg-gray-50 rounded-xl p-2.5">
                <div className="w-10 h-10 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center text-xl">{ICONES_CAT[p.categoria] || '📦'}</div>
                <span className="flex-1 text-sm font-medium text-gray-800 truncate">{p.nome}</span>
                <button onClick={() => removeProduto('mais_vendidos_ids', id)} className="p-1.5 text-gray-400 hover:text-red-500"><X size={16} /></button>
              </div>
            )})}
          </div>
          <button onClick={() => { setPicker('mais_vendidos'); setBusca('') }} className="w-full py-3 rounded-xl border-2 border-dashed border-vinho/30 text-vinho text-sm font-medium hover:border-vinho hover:bg-vinho/5 transition-all">+ Adicionar produto</button>
        </Secao>

        {/* ── 6. BANNER EDITORIAL ── */}
        <Secao titulo="Banner editorial" emoji="📸" sub="Banner intermediário entre as vitrines" aberto={aberto === 'banner_editorial'} onToggle={() => toggle('banner_editorial')}>
          <div className="space-y-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Título</label><input value={config.banner_editorial.texto} onChange={e => atualizarBanner('texto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Subtexto</label><textarea value={config.banner_editorial.subtexto} onChange={e => atualizarBanner('subtexto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={2} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Botão</label><input value={config.banner_editorial.cta_texto} onChange={e => atualizarBanner('cta_texto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Link</label><input value={config.banner_editorial.cta_link} onChange={e => atualizarBanner('cta_link', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
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
        <Secao titulo="Banners menores" emoji="🗂️" sub="3 banners na home" aberto={aberto === 'banners_menores'} onToggle={() => toggle('banners_menores')}>
          <div className="space-y-4">
            {config.banners_menores.map((b, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-4 space-y-3">
                <p className="text-xs font-semibold text-gray-500">Banner {i + 1}</p>
                <div className="grid grid-cols-2 gap-2">
                  <div><label className="block text-[11px] text-gray-500 mb-1">Título</label><input value={b.titulo} onChange={e => atualizarBannerMenor(i, 'titulo', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-rosa" /></div>
                  <div><label className="block text-[11px] text-gray-500 mb-1">Subtítulo</label><input value={b.subtitulo} onChange={e => atualizarBannerMenor(i, 'subtitulo', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-rosa" /></div>
                  <div><label className="block text-[11px] text-gray-500 mb-1">Link</label><input value={b.link} onChange={e => atualizarBannerMenor(i, 'link', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-rosa" /></div>
                  <div><label className="block text-[11px] text-gray-500 mb-1">Cor</label><input type="color" value={b.cor} onChange={e => atualizarBannerMenor(i, 'cor', e.target.value)} className="w-full h-10 rounded-lg border border-gray-200 cursor-pointer" /></div>
                </div>
                <div className="rounded-lg p-3 text-white text-xs font-fraunces font-semibold" style={{ backgroundColor: b.cor }}>{b.titulo} — {b.subtitulo}</div>
              </div>
            ))}
          </div>
        </Secao>

        {/* ── 8. BLOCO INSTITUCIONAL ── */}
        <Secao titulo="Bloco institucional" emoji="🏡" sub="Textos e cards da seção 'Nossa proposta'" aberto={aberto === 'institucional'} onToggle={() => toggle('institucional')}>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Label</label><input value={config.institucional.label} onChange={e => atualizarInstitucional('label', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Título linha 1</label><input value={config.institucional.titulo} onChange={e => atualizarInstitucional('titulo', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Título linha 2 (itálico rosa)</label><input value={config.institucional.titulo_italic} onChange={e => atualizarInstitucional('titulo_italic', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Parágrafo</label><textarea value={config.institucional.corpo} onChange={e => atualizarInstitucional('corpo', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={4} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Texto do botão</label><input value={config.institucional.cta_texto} onChange={e => atualizarInstitucional('cta_texto', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Link</label><input value={config.institucional.cta_link} onChange={e => atualizarInstitucional('cta_link', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
            </div>
            <p className="text-xs font-semibold text-gray-500 pt-1">Cards de benefícios</p>
            {config.institucional.beneficios.map((b, i) => (
              <div key={i} className="border border-gray-100 rounded-xl p-3">
                <p className="text-[11px] text-gray-400 font-medium mb-2">Card {i+1}</p>
                <div className="grid grid-cols-3 gap-2">
                  <div><label className="block text-[11px] text-gray-500 mb-1">Emoji</label><input value={b.emoji} onChange={e => atualizarBeneficio(i, 'emoji', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-center text-lg focus:outline-none focus:border-rosa" maxLength={4} /></div>
                  <div><label className="block text-[11px] text-gray-500 mb-1">Título</label><input value={b.titulo} onChange={e => atualizarBeneficio(i, 'titulo', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-rosa" /></div>
                  <div><label className="block text-[11px] text-gray-500 mb-1">Subtítulo</label><input value={b.sub} onChange={e => atualizarBeneficio(i, 'sub', e.target.value)} className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:outline-none focus:border-rosa" /></div>
                </div>
              </div>
            ))}
          </div>
        </Secao>

        {/* ── 9. NEWSLETTER ── */}
        <Secao titulo="Newsletter" emoji="📧" sub="Título e subtítulo da seção de email" aberto={aberto === 'newsletter'} onToggle={() => toggle('newsletter')}>
          <div className="space-y-3">
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Título</label><input value={config.newsletter.headline} onChange={e => atualizarNewsletter('headline', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Subtítulo</label><textarea value={config.newsletter.subtitulo} onChange={e => atualizarNewsletter('subtitulo', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={2} /></div>
          </div>
        </Secao>

        {/* ── 10. RODAPÉ ── */}
        <Secao titulo="Rodapé" emoji="🗺️" sub="Contato, endereço e links" aberto={aberto === 'rodape'} onToggle={() => toggle('rodape')}>
          <div className="space-y-4">
            <p className="text-xs font-semibold text-gray-500">Informações de contato</p>
            <div className="grid grid-cols-2 gap-3">
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Email</label><input value={config.rodape.email} onChange={e => atualizarRodape('email', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
              <div><label className="block text-xs font-medium text-gray-600 mb-1">Instagram (sem @)</label><input value={config.rodape.instagram} onChange={e => atualizarRodape('instagram', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>
            </div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Endereço</label><textarea value={config.rodape.endereco} onChange={e => atualizarRodape('endereco', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm resize-none focus:outline-none focus:border-rosa" rows={2} /></div>
            <div><label className="block text-xs font-medium text-gray-600 mb-1">Horário de atendimento</label><input value={config.rodape.horario} onChange={e => atualizarRodape('horario', e.target.value)} className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-rosa" /></div>

            {(['ajuda', 'institucional'] as const).map(secao => (
              <div key={secao}>
                <p className="text-xs font-semibold text-gray-500 mb-2 capitalize">{secao === 'ajuda' ? 'Links — Ajuda' : 'Links — Institucional'}</p>
                <div className="space-y-2 mb-2">
                  {config.rodape[secao].map((link, i) => (
                    <div key={i} className="flex gap-2 items-center">
                      <input value={link.label} onChange={e => atualizarLinkRodape(secao, i, 'label', e.target.value)} placeholder="Texto" className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-rosa" />
                      <input value={link.href} onChange={e => atualizarLinkRodape(secao, i, 'href', e.target.value)} placeholder="/link" className="flex-1 border border-gray-200 rounded-lg p-2.5 text-sm focus:outline-none focus:border-rosa" />
                      <button onClick={() => removerLinkRodape(secao, i)} className="p-2 text-gray-400 hover:text-red-500"><X size={16} /></button>
                    </div>
                  ))}
                </div>
                <button onClick={() => adicionarLinkRodape(secao)} className="flex items-center gap-1.5 text-xs text-rosa font-medium hover:underline">
                  <Plus size={14} /> Adicionar link
                </button>
              </div>
            ))}
          </div>
        </Secao>

        {/* ── 11. CONFIGURAÇÕES ── */}
        <Secao titulo="Configurações da loja" emoji="⚙️" sub="WhatsApp para o botão flutuante" aberto={aberto === 'configuracoes'} onToggle={() => toggle('configuracoes')}>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Número do WhatsApp <span className="text-gray-400 font-normal">(somente números com DDI+DDD)</span></label>
            <input
              value={config.whatsapp}
              onChange={e => setConfig(c => ({ ...c, whatsapp: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rosa"
              placeholder="5541999999999"
            />
            <p className="text-[11px] text-gray-400 mt-1">Ex: 5541995872092 (55 = Brasil, 41 = DDD, resto = número)</p>
            {config.whatsapp && (
              <a href={`https://wa.me/${config.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-green-600 mt-2 font-medium">✓ Testar link</a>
            )}
          </div>
        </Secao>

      </div>

      {/* PRODUTO PICKER */}
      {picker && (
        <div className="fixed inset-0 z-50 bg-black/50 flex flex-col justify-end md:justify-center md:items-center">
          <div className="bg-white rounded-t-3xl md:rounded-3xl w-full md:max-w-md md:mx-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">{picker === 'lancamentos' ? 'Lançamentos' : 'Mais Vendidos'}</h3>
              <button onClick={() => setPicker(null)} className="p-2 text-gray-400"><X size={20} /></button>
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
                const sel = config[campo].includes(p.id)
                return (
                  <button key={p.id} onClick={() => addProduto(campo, p.id)} className={`w-full flex items-center gap-3 p-3 rounded-xl border-2 text-left transition-all ${sel ? 'border-vinho bg-vinho/5' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="w-12 h-12 rounded-xl bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">{ICONES_CAT[p.categoria] || '📦'}</div>
                    <div className="flex-1 min-w-0"><p className="font-medium text-gray-900 text-sm truncate">{p.nome}</p><p className="text-gray-400 text-xs">R$ {p.preco.toFixed(2).replace('.', ',')}</p></div>
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${sel ? 'bg-vinho border-vinho' : 'border-gray-300'}`}>{sel && <Check size={12} className="text-white" />}</div>
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
  titulo: string; emoji: string; sub: string; aberto: boolean; onToggle: () => void; children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      <button onClick={onToggle} className="w-full flex items-center gap-3 p-4 text-left touch-target">
        <span className="text-2xl">{emoji}</span>
        <div className="flex-1 min-w-0"><p className="font-semibold text-gray-900 text-sm">{titulo}</p><p className="text-gray-400 text-xs mt-0.5 truncate">{sub}</p></div>
        {aberto ? <ChevronUp size={18} className="text-gray-400 flex-shrink-0" /> : <ChevronDown size={18} className="text-gray-400 flex-shrink-0" />}
      </button>
      {aberto && <div className="px-4 pb-5 border-t border-gray-50 pt-4">{children}</div>}
    </div>
  )
}
