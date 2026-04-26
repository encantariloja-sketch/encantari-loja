'use client'
import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft, Camera, Upload, X, Plus, Loader2,
  RotateCcw, Check, Palette, ImagePlus,
} from 'lucide-react'

type Imagem = { url: string; arquivo?: File }
type Subcat = { id: string; nome: string }
type Categoria = { id: string; nome: string; icone: string; subcategorias?: Subcat[] }
type OpcaoForm = { valor: string; hex?: string; imagem?: string }
type VariacaoForm = { tipo: string; opcoes: OpcaoForm[] }

export default function NovoProdutoPage() {
  const router = useRouter()
  const [salvando, setSalvando] = useState(false)
  const [imagens, setImagens] = useState<Imagem[]>([])
  const [modoCamera, setModoCamera] = useState(false)
  const [streamAtivo, setStreamAtivo] = useState(false)
  const [fotoTirada, setFotoTirada] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [variacoes, setVariacoes] = useState<VariacaoForm[]>([])

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputFileRef = useRef<HTMLInputElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    subcategoria: '',
    preco: '',
    precoAntigo: '',
    sku: '',
    estoque: 'disponivel',
    destaque: false,
    novo: true,
    peso: '',
    comprimento: '',
    largura: '',
    altura: '',
  })

  useEffect(() => {
    fetch('/api/admin/categorias')
      .then(r => r.json())
      .then(d => {
        const cats: Categoria[] = d.categorias || []
        setCategorias(cats)
        if (cats.length > 0) setForm(f => ({ ...f, categoria: cats[0].id }))
      })
      .catch(() => {})
  }, [])

  function atualizar(campo: string, valor: string | boolean) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  // === VARIAÇÕES ===
  function adicionarVariacao() {
    setVariacoes(v => [...v, { tipo: '', opcoes: [{ valor: '' }] }])
  }
  function removerVariacao(idx: number) {
    setVariacoes(v => v.filter((_, i) => i !== idx))
  }
  function setTipoVariacao(vIdx: number, tipo: string) {
    setVariacoes(v => v.map((vari, i) => i === vIdx ? { ...vari, tipo } : vari))
  }
  function adicionarOpcao(vIdx: number) {
    setVariacoes(v => v.map((vari, i) =>
      i === vIdx ? { ...vari, opcoes: [...vari.opcoes, { valor: '' }] } : vari
    ))
  }
  function removerOpcao(vIdx: number, oIdx: number) {
    setVariacoes(v => v.map((vari, i) =>
      i === vIdx ? { ...vari, opcoes: vari.opcoes.filter((_, j) => j !== oIdx) } : vari
    ))
  }
  function setOpcaoValor(vIdx: number, oIdx: number, valor: string) {
    setVariacoes(v => v.map((vari, i) =>
      i === vIdx ? { ...vari, opcoes: vari.opcoes.map((op, j) => j === oIdx ? { ...op, valor } : op) } : vari
    ))
  }
  function setOpcaoHex(vIdx: number, oIdx: number, hex: string) {
    setVariacoes(v => v.map((vari, i) =>
      i === vIdx ? { ...vari, opcoes: vari.opcoes.map((op, j) => j === oIdx ? { ...op, hex } : op) } : vari
    ))
  }
  function setOpcaoImagem(vIdx: number, oIdx: number, imagem: string) {
    setVariacoes(v => v.map((vari, i) =>
      i === vIdx ? { ...vari, opcoes: vari.opcoes.map((op, j) => j === oIdx ? { ...op, imagem } : op) } : vari
    ))
  }
  async function uploadOpcaoImagem(vIdx: number, oIdx: number, file: File) {
    const fd = new FormData()
    fd.append('file', file)
    fd.append('prefix', 'variacoes')
    const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
    const data = await res.json()
    if (data.url) setOpcaoImagem(vIdx, oIdx, data.url)
  }

  // === CÂMERA ===
  async function abrirCamera() {
    setModoCamera(true)
    setFotoTirada(false)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 1280 } }
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play()
        setStreamAtivo(true)
      }
    } catch {
      setModoCamera(false)
      inputFileRef.current?.click()
    }
  }

  function fecharCamera() {
    streamRef.current?.getTracks().forEach(t => t.stop())
    streamRef.current = null
    setStreamAtivo(false)
    setModoCamera(false)
    setFotoTirada(false)
  }

  function tirarFoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    const size = Math.min(video.videoWidth, video.videoHeight)
    canvas.width = 800
    canvas.height = 800
    const ctx = canvas.getContext('2d')!
    const offsetX = (video.videoWidth - size) / 2
    const offsetY = (video.videoHeight - size) / 2
    ctx.drawImage(video, offsetX, offsetY, size, size, 0, 0, 800, 800)
    setFotoTirada(true)
  }

  function confirmarFoto() {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(blob => {
      if (!blob) return
      const arquivo = new File([blob], `foto-${Date.now()}.jpg`, { type: 'image/jpeg' })
      const url = URL.createObjectURL(blob)
      setImagens(prev => [...prev, { url, arquivo }])
      fecharCamera()
    }, 'image/jpeg', 0.92)
  }

  function repetirFoto() { setFotoTirada(false) }

  function handleArquivos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || [])
    const novas: Imagem[] = files.map(f => ({ url: URL.createObjectURL(f), arquivo: f }))
    setImagens(prev => [...prev, ...novas])
    e.target.value = ''
  }

  function removerImagem(i: number) {
    setImagens(prev => prev.filter((_, idx) => idx !== i))
  }

  // === SALVAR ===
  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome || !form.preco || imagens.length === 0) {
      alert('Preencha nome, preço e adicione pelo menos uma foto.')
      return
    }
    setSalvando(true)
    try {
      const urlsImagens: string[] = []
      for (const img of imagens) {
        if (img.arquivo) {
          const fd = new FormData()
          fd.append('file', img.arquivo)
          const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
          const data = await res.json()
          if (data.url) urlsImagens.push(data.url)
        } else {
          urlsImagens.push(img.url)
        }
      }

      const slug = form.nome
        .toLowerCase()
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      const variacoesLimpas = variacoes
        .filter(v => v.tipo.trim())
        .map(v => ({
          tipo: v.tipo.trim(),
          opcoes: v.opcoes.filter(o => o.valor.trim()).map(o => ({
            valor: o.valor.trim(),
            ...(o.hex ? { hex: o.hex } : {}),
            ...(o.imagem ? { imagem: o.imagem } : {}),
          })),
        }))
        .filter(v => v.opcoes.length > 0)

      const payload = {
        slug,
        nome: form.nome,
        descricao: form.descricao,
        categoria: form.categoria,
        subcategoria: form.subcategoria.trim() || null,
        preco: parseFloat(form.preco),
        preco_antigo: form.precoAntigo ? parseFloat(form.precoAntigo) : null,
        sku: form.sku || null,
        imagem: urlsImagens[0] || null,
        imagens: urlsImagens.slice(1),
        estoque: form.estoque,
        destaque: form.destaque,
        novo: form.novo,
        peso: form.peso ? parseFloat(form.peso) : null,
        comprimento: form.comprimento ? parseFloat(form.comprimento) : null,
        largura: form.largura ? parseFloat(form.largura) : null,
        altura: form.altura ? parseFloat(form.altura) : null,
        variacoes: variacoesLimpas.length > 0 ? variacoesLimpas : null,
      }

      const res = await fetch('/api/admin/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (res.ok) {
        router.push('/admin/produtos')
      } else {
        throw new Error(data.erro || `Erro HTTP ${res.status}`)
      }
    } catch (err: any) {
      alert('Erro ao salvar produto:\n' + (err.message || String(err)))
    }
    setSalvando(false)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/produtos" className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-xl font-semibold text-gray-900">Novo produto</h1>
      </div>

      <form onSubmit={salvar} className="space-y-6">
        {/* === FOTOS === */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Fotos do produto</h2>

          {modoCamera && (
            <div className="fixed inset-0 z-50 bg-black flex flex-col">
              <div className="flex items-center justify-between p-4">
                <button onClick={fecharCamera} className="text-white p-2"><X size={24} /></button>
                <p className="text-white font-medium">{fotoTirada ? 'Confirmar foto' : 'Tire a foto'}</p>
                <div className="w-10" />
              </div>
              <div className="flex-1 relative">
                <video ref={videoRef} autoPlay playsInline muted className={`w-full h-full object-cover ${fotoTirada ? 'hidden' : 'block'}`} />
                <canvas ref={canvasRef} className={`w-full h-full object-contain ${fotoTirada ? 'block' : 'hidden'}`} />
              </div>
              <div className="p-6 flex items-center justify-center gap-8">
                {!fotoTirada ? (
                  <button type="button" onClick={tirarFoto} disabled={!streamAtivo}
                    className="w-20 h-20 rounded-full bg-white border-4 border-gray-300 active:scale-95 transition-transform" />
                ) : (
                  <>
                    <button type="button" onClick={repetirFoto} className="flex flex-col items-center gap-2 text-white">
                      <RotateCcw size={28} /><span className="text-xs">Repetir</span>
                    </button>
                    <button type="button" onClick={confirmarFoto}
                      className="w-16 h-16 rounded-full bg-rosa flex items-center justify-center">
                      <Check size={28} className="text-white" />
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 mb-4">
            {imagens.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                <Image src={img.url} alt="" fill className="object-cover" />
                {i === 0 && (
                  <span className="absolute bottom-1 left-1 bg-vinho text-white text-xs px-2 py-0.5 rounded-full">Principal</span>
                )}
                <button type="button" onClick={() => removerImagem(i)}
                  className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={abrirCamera}
              className="flex-1 flex flex-col items-center gap-2 py-4 border-2 border-dashed border-rosa/50 rounded-xl hover:border-rosa hover:bg-rosa/5 transition-all text-rosa">
              <Camera size={24} />
              <span className="text-sm font-medium">Tirar foto</span>
              <span className="text-xs text-gray-400">Câmera do celular</span>
            </button>
            <button type="button" onClick={() => inputFileRef.current?.click()}
              className="flex-1 flex flex-col items-center gap-2 py-4 border-2 border-dashed border-gray-200 rounded-xl hover:border-vinho hover:bg-vinho/5 transition-all text-gray-400 hover:text-vinho">
              <Upload size={24} />
              <span className="text-sm font-medium">Galeria</span>
              <span className="text-xs text-gray-400">JPG, PNG, WEBP</span>
            </button>
            <input ref={inputFileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleArquivos} capture="environment" />
          </div>
          {imagens.length === 0 && <p className="text-center text-red-400 text-xs mt-2">* Adicione pelo menos uma foto</p>}
        </div>

        {/* === INFO BÁSICA === */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Informações</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome do produto *</label>
            <input className="input" value={form.nome} onChange={e => atualizar('nome', e.target.value)} placeholder="Ex: Caneca de Cerâmica" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea className="input min-h-[100px] resize-none" value={form.descricao} onChange={e => atualizar('descricao', e.target.value)} placeholder="Descreva o produto..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select className="input" value={form.categoria} onChange={e => atualizar('categoria', e.target.value)}>
                {categorias.length === 0
                  ? <option value="">Carregando...</option>
                  : categorias.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)
                }
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU (opcional)</label>
              <input className="input" value={form.sku} onChange={e => atualizar('sku', e.target.value)} placeholder="ENC-001" />
            </div>
          </div>
          {(() => {
            const subcats = categorias.find(c => c.id === form.categoria)?.subcategorias || []
            return (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subcategoria <span className="font-normal text-gray-400">(opcional)</span>
                </label>
                {subcats.length > 0 ? (
                  <select className="input" value={form.subcategoria} onChange={e => atualizar('subcategoria', e.target.value)}>
                    <option value="">Nenhuma — raiz da categoria</option>
                    {subcats.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                  </select>
                ) : (
                  <div className="input bg-gray-50 text-gray-400 text-sm flex items-center">
                    Nenhuma subcategoria cadastrada — adicione em Categorias
                  </div>
                )}
              </div>
            )
          })()}
        </div>

        {/* === PREÇOS === */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Preços</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                <input type="number" step="0.01" min="0" className="input pl-9" value={form.preco} onChange={e => atualizar('preco', e.target.value)} placeholder="0,00" required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço original (riscado)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                <input type="number" step="0.01" min="0" className="input pl-9" value={form.precoAntigo} onChange={e => atualizar('precoAntigo', e.target.value)} placeholder="0,00" />
              </div>
            </div>
          </div>
        </div>

        {/* === ESTOQUE E BADGES === */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Estoque e visibilidade</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status do estoque</label>
            <select className="input" value={form.estoque} onChange={e => atualizar('estoque', e.target.value)}>
              <option value="disponivel">Disponível</option>
              <option value="sob-consulta">Sob consulta</option>
              <option value="indisponivel">Indisponível</option>
            </select>
          </div>
          <div className="flex gap-6">
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.destaque} onChange={e => atualizar('destaque', e.target.checked)} className="w-5 h-5 accent-vinho rounded" />
              <span className="text-sm text-gray-700">Em destaque (Mais Vendidos)</span>
            </label>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={form.novo} onChange={e => atualizar('novo', e.target.checked)} className="w-5 h-5 accent-rosa rounded" />
              <span className="text-sm text-gray-700">Badge "Novo"</span>
            </label>
          </div>
        </div>

        {/* === VARIAÇÕES === */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-semibold text-gray-900">Variações</h2>
              <p className="text-xs text-gray-400 mt-0.5">Use para oferecer opções de cor, tamanho etc. Cada bloco = um tipo com suas opções.</p>
            </div>
            <button
              type="button"
              onClick={adicionarVariacao}
              className="flex items-center gap-1.5 text-sm font-medium text-vinho hover:text-vinho-light px-3 py-1.5 border border-vinho/30 rounded-xl hover:bg-vinho/5 transition-all"
            >
              <Plus size={15} /> Adicionar
            </button>
          </div>

          {variacoes.length === 0 && (
            <div className="text-center py-6 border-2 border-dashed border-gray-100 rounded-xl space-y-2">
              <p className="text-sm text-gray-400">Nenhuma variação. Clique em Adicionar para criar.</p>
              <p className="text-xs text-gray-300">Exemplo: um bloco "Cor" com opções "Preto", "Branco", "Cinza"</p>
            </div>
          )}

          {variacoes.map((variacao, vIdx) => {
            const isCor = variacao.tipo.toLowerCase() === 'cor'
            return (
              <div key={vIdx} className="border border-vinho/10 rounded-xl overflow-hidden bg-gray-50/50">
                {/* cabeçalho do tipo */}
                <div className="flex items-center gap-2 bg-vinho/5 px-4 py-3 border-b border-vinho/10">
                  {isCor && <Palette size={15} className="text-rosa flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-vinho/40 uppercase tracking-wide mb-0.5">Tipo de variação</p>
                    <input
                      type="text"
                      value={variacao.tipo}
                      onChange={e => setTipoVariacao(vIdx, e.target.value)}
                      placeholder="Ex: Cor   /   Tamanho   /   Material"
                      className="w-full bg-transparent text-sm font-medium text-vinho placeholder-gray-300 outline-none border-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removerVariacao(vIdx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* opções */}
                <div className="p-4 space-y-2">
                  <p className="text-[10px] font-semibold text-vinho/40 uppercase tracking-wide">
                    {isCor ? 'Cores disponíveis' : 'Opções disponíveis'}
                    <span className="font-normal normal-case ml-1 text-gray-300">
                      {isCor ? '(cada cor que o cliente pode escolher)' : '(cada opção que o cliente pode escolher)'}
                    </span>
                  </p>

                  {variacao.opcoes.map((opcao, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      {isCor && (
                        <div className="relative w-8 h-8 flex-shrink-0">
                          <input type="color" value={opcao.hex || '#cccccc'}
                            onChange={e => setOpcaoHex(vIdx, oIdx, e.target.value)}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
                            title="Clique para escolher a cor" />
                          <div className="w-8 h-8 rounded-full border-2 border-white shadow ring-1 ring-gray-200 cursor-pointer"
                            style={{ backgroundColor: opcao.hex || '#cccccc' }} />
                        </div>
                      )}
                      <input type="text" value={opcao.valor}
                        onChange={e => setOpcaoValor(vIdx, oIdx, e.target.value)}
                        placeholder={isCor ? 'Nome da cor (ex: Preto, Branco, Azul)' : 'Ex: P, M, G, GG'}
                        className="input flex-1 text-sm bg-white" />
                      <label htmlFor={`ni-${vIdx}-${oIdx}`} className="flex-shrink-0 cursor-pointer relative group">
                        {opcao.imagem ? (
                          <div className="relative w-10 h-10">
                            <img src={opcao.imagem} alt={opcao.valor} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                            <button type="button"
                              onClick={e => { e.preventDefault(); setOpcaoImagem(vIdx, oIdx, '') }}
                              className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white shadow">
                              <X size={8} />
                            </button>
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center text-gray-300 group-hover:border-rosa group-hover:text-rosa transition-colors"
                            title="Foto desta opção (opcional)">
                            <ImagePlus size={14} />
                          </div>
                        )}
                      </label>
                      <input type="file" id={`ni-${vIdx}-${oIdx}`} accept="image/*" className="hidden"
                        onChange={e => e.target.files?.[0] && uploadOpcaoImagem(vIdx, oIdx, e.target.files[0])} />
                      <button type="button" onClick={() => removerOpcao(vIdx, oIdx)}
                        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => adicionarOpcao(vIdx)}
                    className="flex items-center gap-1.5 text-xs font-medium text-vinho/50 hover:text-vinho transition-colors mt-1"
                  >
                    <Plus size={13} />
                    {isCor ? '+ Adicionar cor' : '+ Adicionar opção'}
                  </button>
                </div>
              </div>
            )
          })}
        </div>

        {/* === FRETE === */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Dados para frete <span className="text-gray-400 font-normal text-sm">(opcional)</span></h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label>
              <input type="number" step="0.001" className="input" value={form.peso} onChange={e => atualizar('peso', e.target.value)} placeholder="0.100" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Comprimento (cm)</label>
              <input type="number" step="0.1" className="input" value={form.comprimento} onChange={e => atualizar('comprimento', e.target.value)} placeholder="15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Largura (cm)</label>
              <input type="number" step="0.1" className="input" value={form.largura} onChange={e => atualizar('largura', e.target.value)} placeholder="15" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label>
              <input type="number" step="0.1" className="input" value={form.altura} onChange={e => atualizar('altura', e.target.value)} placeholder="5" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <Link href="/admin/produtos" className="flex-1 btn-secondary text-center">Cancelar</Link>
          <button type="submit" disabled={salvando}
            className="flex-2 btn-primary flex-1 flex items-center justify-center gap-2">
            {salvando ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : <><Check size={18} /> Salvar produto</>}
          </button>
        </div>
      </form>
    </div>
  )
}
