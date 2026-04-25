'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, Loader2, Check, Trash2, Upload, X, Plus, Palette, ImagePlus } from 'lucide-react'

type Subcat = { id: string; nome: string }
type Categoria = { id: string; nome: string; icone: string; subcategorias?: Subcat[] }
type OpcaoForm = { valor: string; hex?: string; imagem?: string }
type VariacaoForm = { tipo: string; opcoes: OpcaoForm[] }

export default function EditarProdutoPage() {
  const router = useRouter()
  const { id } = useParams<{ id: string }>()

  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [deletando, setDeletando] = useState(false)
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const inputFileRef = useRef<HTMLInputElement>(null)
  const [uploadando, setUploadando] = useState(false)
  const [variacoes, setVariacoes] = useState<VariacaoForm[]>([])

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
    novo: false,
    peso: '',
    comprimento: '',
    largura: '',
    altura: '',
    imagem: '',
    imagens: [] as string[],
    slug: '',
  })

  useEffect(() => {
    Promise.all([
      fetch(`/api/admin/produtos/${id}`).then(r => r.json()),
      fetch('/api/admin/categorias').then(r => r.json()),
    ]).then(([prodData, catData]) => {
      const p = prodData.produto
      if (p) {
        setForm({
          nome: p.nome || '',
          descricao: p.descricao || '',
          categoria: p.categoria || '',
          subcategoria: p.subcategoria || '',
          preco: p.preco?.toString() || '',
          precoAntigo: p.preco_antigo?.toString() || '',
          sku: p.sku || '',
          estoque: p.estoque || 'disponivel',
          destaque: p.destaque || false,
          novo: p.novo || false,
          peso: p.peso?.toString() || '',
          comprimento: p.comprimento?.toString() || '',
          largura: p.largura?.toString() || '',
          altura: p.altura?.toString() || '',
          imagem: p.imagem || '',
          imagens: p.imagens || [],
          slug: p.slug || '',
        })
        if (p.variacoes && Array.isArray(p.variacoes)) {
          setVariacoes(p.variacoes)
        }
      }
      setCategorias(catData.categorias || [])
      setCarregando(false)
    }).catch(() => setCarregando(false))
  }, [id])

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

  async function uploadImagens(files: FileList | null) {
    if (!files || files.length === 0) return
    setUploadando(true)
    const urls: string[] = []
    for (const file of Array.from(files)) {
      const fd = new FormData()
      fd.append('file', file)
      fd.append('prefix', 'produto')
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
      const data = await res.json()
      if (data.url) urls.push(data.url)
    }
    if (urls.length > 0) {
      setForm(f => ({
        ...f,
        imagem: f.imagem || urls[0],
        imagens: [...f.imagens, ...urls],
      }))
    }
    setUploadando(false)
  }

  function removerImagem(url: string) {
    setForm(f => ({
      ...f,
      imagem: f.imagem === url ? (f.imagens.find(u => u !== url) || '') : f.imagem,
      imagens: f.imagens.filter(u => u !== url),
    }))
  }

  function definirPrincipal(url: string) {
    setForm(f => ({ ...f, imagem: url }))
  }

  async function salvar(e: React.FormEvent) {
    e.preventDefault()
    if (!form.nome || !form.preco) { alert('Nome e preço são obrigatórios.'); return }
    setSalvando(true)
    try {
      const slug = form.slug || form.nome
        .toLowerCase().normalize('NFD')
        .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

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

      const res = await fetch('/api/admin/produtos', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id,
          slug,
          nome: form.nome,
          descricao: form.descricao,
          categoria: form.categoria,
          subcategoria: form.subcategoria.trim() || null,
          preco: parseFloat(form.preco),
          preco_antigo: form.precoAntigo ? parseFloat(form.precoAntigo) : null,
          sku: form.sku || null,
          imagem: form.imagem || null,
          imagens: form.imagens,
          estoque: form.estoque,
          destaque: form.destaque,
          novo: form.novo,
          peso: form.peso ? parseFloat(form.peso) : null,
          comprimento: form.comprimento ? parseFloat(form.comprimento) : null,
          largura: form.largura ? parseFloat(form.largura) : null,
          altura: form.altura ? parseFloat(form.altura) : null,
          variacoes: variacoesLimpas.length > 0 ? variacoesLimpas : null,
        }),
      })
      const data = await res.json()
      if (!res.ok) { alert('Erro ao salvar:\n' + (data.erro || res.status)); return }
      router.push('/admin/produtos')
    } catch (err: any) {
      alert('Erro: ' + err.message)
    }
    setSalvando(false)
  }

  async function deletar() {
    if (!confirm(`Excluir "${form.nome}"? Esta ação não pode ser desfeita.`)) return
    setDeletando(true)
    try {
      const res = await fetch(`/api/admin/produtos?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { alert('Erro ao excluir:\n' + (data.erro || res.status)); setDeletando(false); return }
      router.push('/admin/produtos')
    } catch (err: any) {
      alert('Erro: ' + err.message)
      setDeletando(false)
    }
  }

  const todasImagens = Array.from(new Set([form.imagem, ...form.imagens].filter(Boolean)))

  if (carregando) return (
    <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-vinho" /></div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Link href="/admin/produtos" className="p-2 text-gray-400 hover:text-gray-700 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-semibold text-gray-900">Editar produto</h1>
        </div>
        <button onClick={deletar} disabled={deletando}
          className="flex items-center gap-2 text-red-400 hover:text-red-600 text-sm font-medium transition-colors">
          {deletando ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
          Excluir
        </button>
      </div>

      <form onSubmit={salvar} className="space-y-6">
        {/* FOTOS */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <h2 className="font-semibold text-gray-900 mb-4">Fotos</h2>
          {todasImagens.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {todasImagens.map(url => (
                <div key={url} className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 group">
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  {form.imagem === url && (
                    <span className="absolute bottom-1 left-1 bg-vinho text-white text-[10px] px-2 py-0.5 rounded-full">Principal</span>
                  )}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                    {form.imagem !== url && (
                      <button type="button" onClick={() => definirPrincipal(url)}
                        className="text-white text-[10px] bg-vinho px-2 py-1 rounded-full">Principal</button>
                    )}
                    <button type="button" onClick={() => removerImagem(url)}
                      className="text-white"><X size={18} /></button>
                  </div>
                </div>
              ))}
            </div>
          )}
          <input ref={inputFileRef} type="file" accept="image/*" multiple className="hidden" onChange={e => uploadImagens(e.target.files)} />
          <button type="button" onClick={() => inputFileRef.current?.click()} disabled={uploadando}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-rosa/40 text-rosa text-sm font-medium hover:border-rosa hover:bg-rosa/5 transition-all disabled:opacity-50">
            {uploadando ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploadando ? 'Enviando...' : 'Adicionar fotos'}
          </button>
        </div>

        {/* INFO */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Informações</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
            <input className="input" value={form.nome} onChange={e => atualizar('nome', e.target.value)} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descrição</label>
            <textarea className="input min-h-[100px] resize-none" value={form.descricao} onChange={e => atualizar('descricao', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select className="input" value={form.categoria} onChange={e => atualizar('categoria', e.target.value)}>
                {categorias.map(c => <option key={c.id} value={c.id}>{c.icone} {c.nome}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">SKU</label>
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

        {/* PREÇOS */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Preços</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                <input type="number" step="0.01" min="0" className="input pl-9" value={form.preco} onChange={e => atualizar('preco', e.target.value)} required />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preço original (riscado)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                <input type="number" step="0.01" min="0" className="input pl-9" value={form.precoAntigo} onChange={e => atualizar('precoAntigo', e.target.value)} />
              </div>
            </div>
          </div>
        </div>

        {/* ESTOQUE */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Estoque e visibilidade</h2>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
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
              <p className="text-xs text-gray-400 mt-0.5">Ex: Cor, Tamanho, Material — deixe em branco se o produto não tem variações.</p>
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
            <p className="text-sm text-gray-400 text-center py-5 border-2 border-dashed border-gray-100 rounded-xl">
              Nenhuma variação cadastrada.
            </p>
          )}

          {variacoes.map((variacao, vIdx) => {
            const isCor = variacao.tipo.toLowerCase() === 'cor'
            return (
              <div key={vIdx} className="border border-gray-100 rounded-xl p-4 space-y-3 bg-gray-50/50">
                <div className="flex items-center gap-2">
                  {isCor && <Palette size={16} className="text-rosa flex-shrink-0" />}
                  <input
                    type="text"
                    value={variacao.tipo}
                    onChange={e => setTipoVariacao(vIdx, e.target.value)}
                    placeholder="Nome da variação (ex: Cor, Tamanho, Material)"
                    className="input flex-1 text-sm bg-white"
                  />
                  <button
                    type="button"
                    onClick={() => removerVariacao(vIdx)}
                    className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2 pl-1">
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
                        placeholder={isCor ? 'Nome da cor (ex: Vermelho Rubi)' : 'Valor (ex: P, M, G)'}
                        className="input flex-1 text-sm bg-white" />
                      {/* slot de imagem da opção */}
                      <label htmlFor={`ei-${vIdx}-${oIdx}`} className="flex-shrink-0 cursor-pointer relative group">
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
                            title="Adicionar foto desta variação">
                            <ImagePlus size={14} />
                          </div>
                        )}
                      </label>
                      <input type="file" id={`ei-${vIdx}-${oIdx}`} accept="image/*" className="hidden"
                        onChange={e => e.target.files?.[0] && uploadOpcaoImagem(vIdx, oIdx, e.target.files[0])} />
                      <button type="button" onClick={() => removerOpcao(vIdx, oIdx)}
                        className="p-1.5 text-gray-300 hover:text-red-400 transition-colors flex-shrink-0">
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => adicionarOpcao(vIdx)}
                  className="flex items-center gap-1.5 text-xs font-medium text-vinho/50 hover:text-vinho transition-colors ml-1"
                >
                  <Plus size={13} />
                  {isCor ? 'Adicionar cor' : 'Adicionar opção'}
                </button>
              </div>
            )
          })}
        </div>

        {/* FRETE */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
          <h2 className="font-semibold text-gray-900">Frete <span className="text-gray-400 font-normal text-sm">(opcional)</span></h2>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Peso (kg)</label><input type="number" step="0.001" className="input" value={form.peso} onChange={e => atualizar('peso', e.target.value)} placeholder="0.100" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Comprimento (cm)</label><input type="number" step="0.1" className="input" value={form.comprimento} onChange={e => atualizar('comprimento', e.target.value)} placeholder="15" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Largura (cm)</label><input type="number" step="0.1" className="input" value={form.largura} onChange={e => atualizar('largura', e.target.value)} placeholder="15" /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Altura (cm)</label><input type="number" step="0.1" className="input" value={form.altura} onChange={e => atualizar('altura', e.target.value)} placeholder="5" /></div>
          </div>
        </div>

        <div className="flex gap-3 pb-6">
          <Link href="/admin/produtos" className="flex-1 btn-secondary text-center">Cancelar</Link>
          <button type="submit" disabled={salvando} className="flex-1 btn-primary flex items-center justify-center gap-2">
            {salvando ? <><Loader2 size={18} className="animate-spin" /> Salvando...</> : <><Check size={18} /> Salvar</>}
          </button>
        </div>
      </form>
    </div>
  )
}
