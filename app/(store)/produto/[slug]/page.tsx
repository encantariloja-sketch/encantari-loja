'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ShoppingBag, ArrowLeft, Truck, Shield, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/CartContext'

type Produto = {
  id: string; slug: string; nome: string; descricao: string; categoria: string
  preco: number; preco_antigo?: number; precoAntigo?: number
  imagem: string; imagens: string[]; estoque: string; novo: boolean
  peso?: number; dimensoes?: { comprimento: number; largura: number; altura: number }
}

export default function ProdutoPage() {
  const { slug } = useParams<{ slug: string }>()
  const [produto, setProduto] = useState<Produto | null>(null)
  const [carregando, setCarregando] = useState(true)
  const [naoEncontrado, setNaoEncontrado] = useState(false)
  const [quantidade, setQuantidade] = useState(1)
  const [imagemAtiva, setImagemAtiva] = useState(0)
  const [freteAberto, setFreteAberto] = useState(false)
  const [cep, setCep] = useState('')
  const [loadingFrete, setLoadingFrete] = useState(false)
  const [opcoesFretes, setOpcoesFretes] = useState<any[]>([])
  const [avisoFrete, setAvisoFrete] = useState('')
  const { adicionar } = useCart()

  useEffect(() => {
    fetch(`/api/loja/produtos?slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        const p = d.produtos?.[0]
        if (!p) { setNaoEncontrado(true); return }
        // normaliza preco_antigo → precoAntigo
        setProduto({ ...p, precoAntigo: p.precoAntigo ?? p.preco_antigo })
      })
      .catch(() => setNaoEncontrado(true))
      .finally(() => setCarregando(false))
  }, [slug])

  async function calcularFrete() {
    if (!produto || cep.replace(/\D/g, '').length !== 8) return
    setLoadingFrete(true)
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep_destino: cep.replace(/\D/g, ''),
          produtos: [{ id: produto.id, quantidade, peso: produto.peso || 0.3, dimensoes: produto.dimensoes }],
        }),
      })
      const data = await res.json()
      setOpcoesFretes(data.opcoes || [])
      setAvisoFrete(data.aviso || '')
    } catch {
      setAvisoFrete('Erro ao calcular frete. Tente novamente.')
    }
    setLoadingFrete(false)
  }

  if (carregando) return (
    <div className="flex justify-center items-center py-32">
      <Loader2 size={32} className="animate-spin text-vinho" />
    </div>
  )

  if (naoEncontrado || !produto) return (
    <div className="max-w-6xl mx-auto px-4 py-20 text-center">
      <p className="text-vinho/60 text-lg mb-4">Produto não encontrado.</p>
      <Link href="/produtos" className="btn-primary">Ver todos os produtos</Link>
    </div>
  )

  const imagens = [produto.imagem, ...(produto.imagens || [])].filter(Boolean)

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/produtos" className="inline-flex items-center gap-2 text-vinho/60 hover:text-vinho mb-8 text-sm">
        <ArrowLeft size={16} /> Voltar para a loja
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* Galeria */}
        <div>
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-creme-dark mb-3">
            <Image
              src={imagens[imagemAtiva] || '/images/produto-placeholder.jpg'}
              alt={produto.nome}
              fill className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {produto.novo && <span className="badge-novo">Novo</span>}
          </div>
          {imagens.length > 1 && (
            <div className="flex gap-2">
              {imagens.map((img, i) => (
                <button key={i} onClick={() => setImagemAtiva(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${imagemAtiva === i ? 'border-vinho' : 'border-transparent'}`}>
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div>
          <span className="text-rosa text-sm font-medium capitalize">{(produto.categoria || '').replace(/-/g, ' ')}</span>
          <h1 className="heading text-3xl mt-2 mb-4">{produto.nome}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-vinho">R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</span>
            {produto.precoAntigo && (
              <span className="text-gray-400 line-through text-lg">R$ {Number(produto.precoAntigo).toFixed(2).replace('.', ',')}</span>
            )}
          </div>

          <p className="text-vinho/70 leading-relaxed mb-8">{produto.descricao}</p>

          {produto.estoque !== 'indisponivel' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantidade(q => Math.max(1, q - 1))} className="px-4 py-3 text-vinho hover:bg-creme-dark transition-colors font-medium">−</button>
                  <span className="px-4 py-3 font-semibold text-vinho min-w-[3rem] text-center">{quantidade}</span>
                  <button onClick={() => setQuantidade(q => q + 1)} className="px-4 py-3 text-vinho hover:bg-creme-dark transition-colors font-medium">+</button>
                </div>
                <button onClick={() => adicionar(produto as any, quantidade)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                  <ShoppingBag size={18} /> Adicionar ao carrinho
                </button>
              </div>
              {produto.estoque === 'sob-consulta' && (
                <p className="text-sm text-yellow-600 bg-yellow-50 rounded-xl p-3">Produto sob consulta — entre em contato para confirmar disponibilidade.</p>
              )}
            </div>
          ) : (
            <div className="bg-gray-100 rounded-xl p-4 text-center text-vinho/60">Produto esgotado</div>
          )}

          {/* Calcular frete */}
          <div className="mt-6 border border-creme-dark rounded-2xl overflow-hidden">
            <button onClick={() => setFreteAberto(!freteAberto)}
              className="w-full flex items-center justify-between p-4 text-sm font-medium text-vinho">
              <span className="flex items-center gap-2"><Truck size={16} /> Calcular frete</span>
              {freteAberto ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {freteAberto && (
              <div className="px-4 pb-4 border-t border-creme-dark">
                <div className="flex gap-2 mt-3">
                  <input type="text" placeholder="00000-000" value={cep}
                    onChange={e => setCep(e.target.value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2'))}
                    maxLength={9} className="input flex-1" />
                  <button onClick={calcularFrete} disabled={loadingFrete} className="btn-primary text-sm px-4">
                    {loadingFrete ? '...' : 'OK'}
                  </button>
                </div>
                {opcoesFretes.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {opcoesFretes.map((op, i) => (
                      <div key={i} className="flex justify-between text-sm p-2 bg-creme rounded-lg">
                        <span className="text-vinho font-medium">{op.nome}</span>
                        <span className="text-vinho">
                          {op.preco === 0 ? 'Grátis' : `R$ ${op.preco.toFixed(2).replace('.', ',')}`}
                          {op.prazo && <span className="text-vinho/50 ml-2">{op.prazo}</span>}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                {avisoFrete && opcoesFretes.length === 0 && (
                  <p className="mt-3 text-xs text-vinho/60 bg-creme rounded-lg p-2">{avisoFrete}</p>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-4 mt-6 pt-6 border-t border-creme-dark">
            <div className="flex items-center gap-2 text-xs text-vinho/60"><Shield size={14} className="text-oliva" /> Compra segura</div>
            <div className="flex items-center gap-2 text-xs text-vinho/60"><Truck size={14} className="text-oliva" /> Melhor Envio</div>
          </div>
        </div>
      </div>
    </div>
  )
}
