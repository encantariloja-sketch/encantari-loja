'use client'
import { useState, useMemo, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Filter, Search, Loader2 } from 'lucide-react'
import ProductCard from '@/components/ProductCard'
import type { Produto } from '@/data/produtos'

type Categoria = { id: string; nome: string; icone: string }

function ProdutosContent() {
  const searchParams = useSearchParams()
  const categoriaParam = searchParams.get('categoria') || 'todos'
  const ordemParam = searchParams.get('ordem') || 'relevancia'

  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [busca, setBusca] = useState('')
  const [categoriaAtiva, setCategoriaAtiva] = useState(categoriaParam)
  const [ordenar, setOrdenar] = useState(ordemParam)

  useEffect(() => {
    Promise.all([
      fetch('/api/loja/produtos').then(r => r.json()),
      fetch('/api/loja/categorias').then(r => r.json()),
    ]).then(([pd, cd]) => {
      setProdutos(pd.produtos || [])
      setCategorias(cd.categorias || [])
    }).catch(() => {}).finally(() => setCarregando(false))
  }, [])

  const produtosFiltrados = useMemo(() => {
    let lista = [...produtos]
    if (categoriaAtiva !== 'todos') lista = lista.filter(p => p.categoria === categoriaAtiva)
    if (busca) lista = lista.filter(p => p.nome.toLowerCase().includes(busca.toLowerCase()) || (p.descricao || '').toLowerCase().includes(busca.toLowerCase()))
    if (ordenar === 'menor') lista.sort((a, b) => a.preco - b.preco)
    if (ordenar === 'maior') lista.sort((a, b) => b.preco - a.preco)
    if (ordenar === 'novos') lista.sort((a, b) => (b.novo ? 1 : 0) - (a.novo ? 1 : 0))
    if (ordenar === 'ofertas') lista.sort((a, b) => ((b.precoAntigo ? 1 : 0) - (a.precoAntigo ? 1 : 0)))
    return lista
  }, [categoriaAtiva, busca, ordenar, produtos])

  if (carregando) return (
    <div className="flex justify-center items-center py-32">
      <Loader2 size={32} className="animate-spin text-vinho" />
    </div>
  )

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h1 className="heading text-3xl md:text-4xl mb-2">Loja</h1>
      <p className="text-vinho/60 mb-8">{produtosFiltrados.length} produto(s) encontrado(s)</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar produtos..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
            className="input pl-9"
          />
        </div>
        <select value={ordenar} onChange={e => setOrdenar(e.target.value)} className="input w-auto min-w-[180px]">
          <option value="relevancia">Relevância</option>
          <option value="menor">Menor preço</option>
          <option value="maior">Maior preço</option>
          <option value="novos">Novidades</option>
          <option value="ofertas">Ofertas</option>
        </select>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 mb-8 scrollbar-hide">
        <button onClick={() => setCategoriaAtiva('todos')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoriaAtiva === 'todos' ? 'bg-vinho text-creme' : 'bg-white text-vinho border border-gray-200 hover:border-vinho'}`}>
          Todos
        </button>
        {categorias.map(cat => (
          <button key={cat.id} onClick={() => setCategoriaAtiva(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${categoriaAtiva === cat.id ? 'bg-vinho text-creme' : 'bg-white text-vinho border border-gray-200 hover:border-vinho'}`}>
            {cat.icone} {cat.nome}
          </button>
        ))}
      </div>

      {produtosFiltrados.length === 0 ? (
        <div className="text-center py-20 text-vinho/50">
          <p className="text-lg">Nenhum produto encontrado.</p>
          <button onClick={() => { setBusca(''); setCategoriaAtiva('todos') }} className="mt-4 btn-secondary text-sm">
            Limpar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {produtosFiltrados.map(p => <ProductCard key={p.id} produto={p} />)}
        </div>
      )}
    </div>
  )
}

export default function ProdutosPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-32"><Loader2 size={32} className="animate-spin text-vinho" /></div>}>
      <ProdutosContent />
    </Suspense>
  )
}
