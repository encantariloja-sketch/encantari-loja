'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Plus, Search, ChevronRight, Loader2, Trash2 } from 'lucide-react'

type Produto = {
  id: string
  nome: string
  categoria: string
  preco: number
  imagem?: string
  estoque: string
  novo: boolean
  destaque: boolean
}

type Categoria = { id: string; nome: string; icone: string }

const ICONES: Record<string, string> = {
  'cafes-chas': '☕', canecas: '🫖', vasos: '🏺',
  'flores-artificiais': '🌸', ceramicas: '🪴', papelaria: '📓', silvanian: '🐿️',
}
const CORES: Record<string, string> = {
  'cafes-chas': '#C4956A', canecas: '#EF9493', vasos: '#8F9150',
  'flores-artificiais': '#D4848A', ceramicas: '#9B6B50', papelaria: '#6B7A8D', silvanian: '#C49A6C',
}

export default function AdminProdutosPage() {
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [busca, setBusca] = useState('')
  const [catFiltro, setCatFiltro] = useState('todos')
  const [carregando, setCarregando] = useState(true)
  const [deletando, setDeletando] = useState<string | null>(null)

  async function carregar() {
    setCarregando(true)
    try {
      const [rProd, rCat] = await Promise.all([
        fetch('/api/admin/produtos').then(r => r.json()),
        fetch('/api/admin/categorias').then(r => r.json()),
      ])
      setProdutos(rProd.produtos || [])
      setCategorias(rCat.categorias || [])
    } catch {}
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function deletar(id: string, nome: string) {
    if (!confirm(`Excluir "${nome}"?`)) return
    setDeletando(id)
    try {
      const res = await fetch(`/api/admin/produtos?id=${id}`, { method: 'DELETE' })
      const data = await res.json()
      if (!res.ok) { alert('Erro ao excluir: ' + (data.erro || res.status)); return }
      setProdutos(prev => prev.filter(p => p.id !== id))
    } catch (err: any) {
      alert('Erro ao excluir: ' + err.message)
    }
    setDeletando(null)
  }

  const lista = produtos.filter(p => {
    const matchBusca = p.nome.toLowerCase().includes(busca.toLowerCase())
    const matchCat = catFiltro === 'todos' || p.categoria === catFiltro
    return matchBusca && matchCat
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Produtos</h1>
          <p className="text-gray-400 text-sm">{carregando ? '...' : `${produtos.length} cadastrados`}</p>
        </div>
        <Link
          href="/admin/produtos/novo"
          className="flex items-center gap-2 bg-vinho text-creme px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-vinho-light transition-colors touch-target"
        >
          <Plus size={16} />
          Novo
        </Link>
      </div>

      <div className="relative mb-3">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Buscar produto..."
          value={busca}
          onChange={e => setBusca(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:border-rosa bg-white"
        />
      </div>

      <div className="flex gap-2 overflow-x-auto scroll-hide pb-2 mb-4">
        <button
          onClick={() => setCatFiltro('todos')}
          className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${catFiltro === 'todos' ? 'bg-vinho text-creme' : 'bg-white text-vinho border border-gray-200'}`}
        >
          Todos
        </button>
        {categorias.map(c => (
          <button
            key={c.id}
            onClick={() => setCatFiltro(c.id)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${catFiltro === c.id ? 'bg-vinho text-creme' : 'bg-white text-vinho border border-gray-200'}`}
          >
            {c.icone} {c.nome}
          </button>
        ))}
      </div>

      {carregando ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-vinho" />
        </div>
      ) : (
        <div className="space-y-2">
          {lista.map(p => (
            <div key={p.id} className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5 hover:border-rosa/30 transition-all">
              <Link href={`/admin/produtos/${p.id}`} className="flex items-center gap-3 flex-1 min-w-0">
                <div
                  className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                  style={{ backgroundColor: (CORES[p.categoria] || '#EF9493') + '22' }}
                >
                  {p.imagem
                    ? <img src={p.imagem} alt="" className="w-full h-full object-cover" />
                    : (ICONES[p.categoria] || '📦')
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm truncate">{p.nome}</p>
                  <p className="text-gray-400 text-xs mt-0.5">
                    {categorias.find(c => c.id === p.categoria)?.nome || p.categoria}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="font-bold text-vinho text-sm">R$ {Number(p.preco).toFixed(2).replace('.', ',')}</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      p.estoque === 'disponivel' ? 'bg-green-100 text-green-700' :
                      p.estoque === 'sob-consulta' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {p.estoque === 'disponivel' ? 'Disponível' : p.estoque === 'sob-consulta' ? 'Consulta' : 'Esgotado'}
                    </span>
                    {p.novo && <span className="text-[10px] bg-vinho/10 text-vinho px-2 py-0.5 rounded-full font-medium">Novo</span>}
                    {p.destaque && <span className="text-[10px] bg-rosa/10 text-rosa px-2 py-0.5 rounded-full font-medium">Destaque</span>}
                  </div>
                </div>
                <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
              </Link>
              <button
                onClick={() => deletar(p.id, p.nome)}
                disabled={deletando === p.id}
                className="p-2 text-gray-300 hover:text-red-500 transition-colors flex-shrink-0"
              >
                {deletando === p.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
              </button>
            </div>
          ))}

          {lista.length === 0 && !carregando && (
            <div className="text-center py-16 text-gray-400">
              <p className="text-4xl mb-3">🔍</p>
              <p className="text-sm">{produtos.length === 0 ? 'Nenhum produto cadastrado ainda.' : 'Nenhum produto encontrado.'}</p>
              {produtos.length === 0 && (
                <Link href="/admin/produtos/novo" className="mt-4 inline-block text-rosa text-sm font-medium">
                  + Adicionar primeiro produto
                </Link>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
