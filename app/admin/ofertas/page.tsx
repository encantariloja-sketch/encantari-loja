'use client'
import { useState, useEffect, useMemo } from 'react'
import Image from 'next/image'
import { Tag, Search, Loader2, X, Check, Plus, TrendingDown } from 'lucide-react'

type Produto = {
  id: string
  nome: string
  categoria: string
  preco: number
  precoAntigo?: number | null
  imagem?: string
  estoque: string
}

type EditState = {
  precoAntigo: string
  preco: string
}

export default function OfertasPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [editando, setEditando] = useState<Record<string, EditState>>({})
  const [salvando, setSalvando] = useState<Record<string, boolean>>({})
  const [feedback, setFeedback] = useState<Record<string, 'ok' | 'erro'>>({})

  async function carregar() {
    setCarregando(true)
    const res = await fetch('/api/admin/produtos')
    const data = await res.json()
    setProdutos(data.produtos || [])
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  const produtosFiltrados = useMemo(() => {
    const termo = busca.toLowerCase()
    return produtos.filter(p =>
      !termo || p.nome.toLowerCase().includes(termo) || p.categoria.toLowerCase().includes(termo)
    )
  }, [produtos, busca])

  const emOferta = useMemo(() => produtos.filter(p => p.precoAntigo && p.precoAntigo > p.preco), [produtos])

  function iniciarEdicao(p: Produto) {
    setEditando(prev => ({
      ...prev,
      [p.id]: {
        precoAntigo: p.precoAntigo ? p.precoAntigo.toFixed(2) : p.preco.toFixed(2),
        preco: p.preco.toFixed(2),
      },
    }))
  }

  function atualizarEdit(id: string, campo: keyof EditState, valor: string) {
    setEditando(prev => ({ ...prev, [id]: { ...prev[id], [campo]: valor } }))
  }

  function calcularDesconto(edit: EditState): number | null {
    const original = parseFloat(edit.precoAntigo.replace(',', '.'))
    const atual = parseFloat(edit.preco.replace(',', '.'))
    if (!original || !atual || original <= atual) return null
    return Math.round((1 - atual / original) * 100)
  }

  function aplicarDesconto(id: string, pct: number) {
    const edit = editando[id]
    if (!edit) return
    const original = parseFloat(edit.precoAntigo.replace(',', '.'))
    if (!original) return
    const novoPreco = Math.round(original * (1 - pct / 100) * 100) / 100
    atualizarEdit(id, 'preco', novoPreco.toFixed(2))
  }

  async function salvar(p: Produto) {
    const edit = editando[p.id]
    if (!edit) return
    const precoAntigo = parseFloat(edit.precoAntigo.replace(',', '.'))
    const preco = parseFloat(edit.preco.replace(',', '.'))
    if (isNaN(precoAntigo) || isNaN(preco) || precoAntigo <= 0 || preco <= 0) return
    if (preco >= precoAntigo) {
      alert('O preço com desconto deve ser menor que o preço original.')
      return
    }
    setSalvando(prev => ({ ...prev, [p.id]: true }))
    const res = await fetch('/api/admin/produtos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, preco, precoAntigo }),
    })
    const ok = res.ok
    setSalvando(prev => ({ ...prev, [p.id]: false }))
    setFeedback(prev => ({ ...prev, [p.id]: ok ? 'ok' : 'erro' }))
    setTimeout(() => setFeedback(prev => { const n = { ...prev }; delete n[p.id]; return n }), 2000)
    if (ok) {
      setProdutos(prev => prev.map(x => x.id === p.id ? { ...x, preco, precoAntigo } : x))
      setEditando(prev => { const n = { ...prev }; delete n[p.id]; return n })
    }
  }

  async function removerOferta(p: Produto) {
    if (!confirm(`Remover oferta de "${p.nome}"?`)) return
    setSalvando(prev => ({ ...prev, [p.id]: true }))
    const res = await fetch('/api/admin/produtos', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id, precoAntigo: null }),
    })
    setSalvando(prev => ({ ...prev, [p.id]: false }))
    if (res.ok) {
      setProdutos(prev => prev.map(x => x.id === p.id ? { ...x, precoAntigo: null } : x))
      setEditando(prev => { const n = { ...prev }; delete n[p.id]; return n })
    }
  }

  function cancelarEdicao(id: string) {
    setEditando(prev => { const n = { ...prev }; delete n[id]; return n })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="heading text-2xl">Ofertas</h1>
          <p className="text-vinho/50 text-sm mt-1">
            {carregando ? '...' : `${emOferta.length} produto(s) em oferta · ${produtos.length} total`}
          </p>
        </div>
        <a href="/produtos?ordem=ofertas" target="_blank"
          className="text-xs text-vinho/50 hover:text-vinho underline">
          Ver página de ofertas →
        </a>
      </div>

      {/* Busca */}
      <div className="relative mb-4">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar produto por nome ou categoria..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="input pl-9"
        />
      </div>

      {carregando ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-vinho/30" />
        </div>
      ) : (
        <div className="space-y-2">
          {produtosFiltrados.map(p => {
            const emEdit = !!editando[p.id]
            const eOferta = !!(p.precoAntigo && p.precoAntigo > p.preco)
            const desconto = eOferta
              ? Math.round((1 - p.preco / p.precoAntigo!) * 100)
              : null
            const edit = editando[p.id]
            const descontoPreview = edit ? calcularDesconto(edit) : null
            const isSalvando = salvando[p.id]
            const fb = feedback[p.id]

            return (
              <div key={p.id}
                className={`bg-white rounded-2xl border-2 transition-all ${
                  eOferta ? 'border-rosa/30' : 'border-gray-100'
                } ${emEdit ? 'shadow-md' : ''}`}>

                {/* Linha principal */}
                <div className="flex items-center gap-3 p-4">
                  {/* Imagem */}
                  <div className="w-12 h-12 rounded-xl bg-gray-50 flex-shrink-0 overflow-hidden">
                    {p.imagem ? (
                      <Image src={p.imagem} alt={p.nome} width={48} height={48}
                        className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-xl">✨</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-vinho text-sm truncate">{p.nome}</p>
                    <p className="text-vinho/40 text-xs">{(p.categoria || '').replace(/-/g, ' ')}</p>
                  </div>

                  {/* Preços */}
                  <div className="flex-shrink-0 text-right">
                    <p className="font-bold text-vinho text-sm">
                      R$ {p.preco.toFixed(2).replace('.', ',')}
                    </p>
                    {eOferta && (
                      <p className="text-xs text-gray-400 line-through leading-none">
                        R$ {p.precoAntigo!.toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>

                  {/* Badge desconto */}
                  {eOferta && desconto && (
                    <span className="flex-shrink-0 bg-rosa text-white text-xs font-bold px-2 py-1 rounded-full">
                      -{desconto}%
                    </span>
                  )}

                  {/* Ações */}
                  <div className="flex-shrink-0 flex items-center gap-1">
                    {fb === 'ok' && <Check size={18} className="text-green-500" />}
                    {fb === 'erro' && <X size={18} className="text-red-500" />}

                    {!emEdit && eOferta && (
                      <button onClick={() => iniciarEdicao(p)}
                        className="text-xs px-3 py-1.5 rounded-lg border border-vinho/20 text-vinho hover:bg-vinho/5 transition-colors">
                        Editar
                      </button>
                    )}
                    {!emEdit && eOferta && (
                      <button onClick={() => removerOferta(p)}
                        disabled={isSalvando}
                        className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 transition-colors">
                        <X size={16} />
                      </button>
                    )}
                    {!emEdit && !eOferta && (
                      <button onClick={() => iniciarEdicao(p)}
                        className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg bg-vinho text-creme hover:bg-vinho/90 transition-colors">
                        <Plus size={13} /> Oferta
                      </button>
                    )}
                  </div>
                </div>

                {/* Painel de edição */}
                {emEdit && edit && (
                  <div className="border-t border-gray-100 p-4 bg-gray-50/50 rounded-b-2xl space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-vinho/70 mb-1">
                          Preço original (De)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input pl-9"
                            value={edit.precoAntigo}
                            onChange={e => atualizarEdit(p.id, 'precoAntigo', e.target.value)}
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-vinho/70 mb-1">
                          Preço com desconto (Por)
                        </label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">R$</span>
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            className="input pl-9"
                            value={edit.preco}
                            onChange={e => atualizarEdit(p.id, 'preco', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Atalhos de % */}
                    <div>
                      <p className="text-xs text-vinho/50 mb-2 flex items-center gap-1">
                        <TrendingDown size={12} /> Aplicar desconto rápido:
                      </p>
                      <div className="flex gap-2 flex-wrap">
                        {[5, 10, 15, 20, 25, 30, 40, 50].map(pct => (
                          <button key={pct} type="button"
                            onClick={() => aplicarDesconto(p.id, pct)}
                            className="px-3 py-1 text-xs rounded-full border border-gray-200 hover:border-vinho hover:text-vinho transition-colors">
                            -{pct}%
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Preview */}
                    {descontoPreview !== null && descontoPreview > 0 && (
                      <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 px-3 py-2 rounded-xl">
                        <Tag size={14} />
                        <span>Desconto de <strong>{descontoPreview}%</strong> — cliente paga R$ {parseFloat(edit.preco.replace(',', '.')).toFixed(2).replace('.', ',')}</span>
                      </div>
                    )}

                    {/* Botões */}
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => cancelarEdicao(p.id)}
                        className="btn-secondary text-sm px-4 py-2">
                        Cancelar
                      </button>
                      <button
                        onClick={() => salvar(p)}
                        disabled={isSalvando || !descontoPreview || descontoPreview <= 0}
                        className="btn-primary text-sm px-5 py-2 flex items-center gap-2">
                        {isSalvando ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
                        Salvar oferta
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )
          })}

          {produtosFiltrados.length === 0 && (
            <div className="text-center py-16 text-vinho/40">
              <Tag size={40} className="mx-auto mb-3 opacity-30" />
              <p>Nenhum produto encontrado</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
