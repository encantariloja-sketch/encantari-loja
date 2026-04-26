'use client'
import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ShoppingBag, ArrowLeft, Truck, Shield, ChevronDown, ChevronUp, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/CartContext'

type OpcaoVariacao = { valor: string; hex?: string; imagem?: string }
type Variacao = { tipo: string; opcoes: OpcaoVariacao[] }

type Produto = {
  id: string; slug: string; nome: string; descricao: string; categoria: string
  preco: number; preco_antigo?: number; precoAntigo?: number
  imagem: string; imagens: string[]; estoque: string; novo: boolean
  peso?: number; dimensoes?: { comprimento: number; largura: number; altura: number }
  variacoes?: Variacao[]
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
  const [variacaoSelecionada, setVariacaoSelecionada] = useState<Record<string, string>>({})
  const { adicionar } = useCart()

  useEffect(() => {
    fetch(`/api/loja/produtos?slug=${slug}`)
      .then(r => r.json())
      .then(d => {
        const p = d.produtos?.[0]
        if (!p) { setNaoEncontrado(true); return }
        // parse defensivo — garante array mesmo se vier como string JSON
        let variacoes = p.variacoes
        if (typeof variacoes === 'string') {
          try { variacoes = JSON.parse(variacoes) } catch { variacoes = null }
        }
        if (!Array.isArray(variacoes)) variacoes = null
        setProduto({ ...p, variacoes, precoAntigo: p.precoAntigo ?? p.preco_antigo })
        if (variacoes?.length) {
          const selecao: Record<string, string> = {}
          variacoes.forEach((v: any) => {
            if (v.opcoes?.length) selecao[v.tipo] = v.opcoes[0].valor
          })
          setVariacaoSelecionada(selecao)
        }
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

  // imagem da variação selecionada (se houver)
  const imagemVariacao = produto.variacoes?.reduce<string | null>((acc, v) => {
    if (acc) return acc
    const op = v.opcoes?.find(o => o.valor === variacaoSelecionada[v.tipo])
    return op?.imagem || null
  }, null) ?? null

  const imagemExibida = imagemVariacao || imagens[imagemAtiva] || '/images/produto-placeholder.jpg'

  function selecionarVariacao(tipo: string, valor: string) {
    setVariacaoSelecionada(prev => ({ ...prev, [tipo]: valor }))
    // se a opção tem imagem própria, limpa imagemAtiva para ela ter prioridade
    setImagemAtiva(0)
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <Link href="/produtos" className="inline-flex items-center gap-2 text-vinho/60 hover:text-vinho mb-8 text-sm">
        <ArrowLeft size={16} /> Voltar para a loja
      </Link>

      <div className="grid md:grid-cols-2 gap-10 lg:gap-16">
        {/* ── Galeria ── */}
        <div>
          <div className="aspect-square relative rounded-2xl overflow-hidden bg-creme-dark mb-3 transition-all duration-300">
            <Image
              key={imagemExibida}
              src={imagemExibida}
              alt={produto.nome}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            {produto.novo && <span className="badge-novo">Novo</span>}
            {imagemVariacao && (
              <span className="absolute bottom-3 left-3 bg-black/50 text-white text-[10px] px-2 py-1 rounded-full backdrop-blur-sm">
                {Object.values(variacaoSelecionada).join(' · ')}
              </span>
            )}
          </div>

          {/* Miniaturas do produto */}
          {imagens.length > 1 && !imagemVariacao && (
            <div className="flex gap-2 flex-wrap">
              {imagens.map((img, i) => (
                <button key={i} onClick={() => setImagemAtiva(i)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${imagemAtiva === i ? 'border-vinho' : 'border-transparent hover:border-gray-300'}`}>
                  <Image src={img} alt="" width={64} height={64} className="object-cover w-full h-full" />
                </button>
              ))}
            </div>
          )}

          {/* Miniaturas das variações quando há imagem de variação */}
          {imagemVariacao && produto.variacoes?.some(v => v.opcoes.some(o => o.imagem)) && (
            <div className="flex gap-2 flex-wrap">
              {produto.variacoes.flatMap(v =>
                v.opcoes.filter(o => o.imagem).map(o => (
                  <button key={`${v.tipo}-${o.valor}`}
                    onClick={() => selecionarVariacao(v.tipo, o.valor)}
                    className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors flex-shrink-0 ${variacaoSelecionada[v.tipo] === o.valor ? 'border-vinho' : 'border-transparent hover:border-gray-300'}`}
                    title={o.valor}>
                    <Image src={o.imagem!} alt={o.valor} width={64} height={64} className="object-cover w-full h-full" />
                  </button>
                ))
              )}
              {imagens.length > 0 && (
                <button onClick={() => { setImagemAtiva(0); setVariacaoSelecionada(prev => ({ ...prev })) }}
                  className="w-16 h-16 rounded-lg overflow-hidden border-2 border-transparent hover:border-gray-300 transition-colors flex-shrink-0"
                  title="Fotos do produto">
                  <Image src={imagens[0]} alt="" width={64} height={64} className="object-cover w-full h-full opacity-60" />
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── Info ── */}
        <div>
          <span className="text-rosa text-sm font-medium capitalize">{(produto.categoria || '').replace(/-/g, ' ')}</span>
          <h1 className="heading text-3xl mt-2 mb-4">{produto.nome}</h1>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-3xl font-bold text-vinho">R$ {Number(produto.preco).toFixed(2).replace('.', ',')}</span>
            {produto.precoAntigo && (
              <span className="text-gray-400 line-through text-lg">R$ {Number(produto.precoAntigo).toFixed(2).replace('.', ',')}</span>
            )}
          </div>

          <p className="text-vinho/70 leading-relaxed mb-6">{produto.descricao}</p>

          {/* ── Seletor de variações ── */}
          {produto.variacoes && produto.variacoes.length > 0 && (
            <div className="space-y-5 mb-6">
              {produto.variacoes.map(v => {
                const selecionado = variacaoSelecionada[v.tipo]
                const temImagens = v.opcoes.some(op => op.imagem)
                const isCor = v.tipo.toLowerCase() === 'cor'

                return (
                  <div key={v.tipo}>
                    <p className="text-sm font-semibold text-vinho mb-2.5">
                      {v.tipo}:{' '}
                      <span className={`font-normal ${selecionado ? 'text-vinho/70' : 'text-vinho/40 italic'}`}>
                        {selecionado || 'Selecione'}
                      </span>
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {temImagens
                        // ── opções com imagem: card quadrado ──
                        ? v.opcoes.map(op => (
                            <button
                              key={op.valor}
                              type="button"
                              title={op.valor}
                              onClick={() => selecionarVariacao(v.tipo, op.valor)}
                              className={`relative flex flex-col items-center gap-1 transition-all duration-150 ${
                                selecionado === op.valor
                                  ? 'scale-105'
                                  : 'opacity-80 hover:opacity-100'
                              }`}
                            >
                              <div className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-colors ${
                                selecionado === op.valor
                                  ? 'border-vinho shadow-md ring-2 ring-vinho/20'
                                  : 'border-gray-200 hover:border-vinho/50'
                              }`}>
                                {op.imagem ? (
                                  <Image src={op.imagem} alt={op.valor} width={64} height={64} className="object-cover w-full h-full" />
                                ) : (
                                  <div className="w-full h-full" style={{ backgroundColor: op.hex || '#eee' }} />
                                )}
                              </div>
                              <span className={`text-[10px] font-medium leading-none ${selecionado === op.valor ? 'text-vinho' : 'text-vinho/50'}`}>
                                {op.valor}
                              </span>
                              {selecionado === op.valor && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-vinho rounded-full flex items-center justify-center">
                                  <span className="text-white text-[8px] font-bold">✓</span>
                                </span>
                              )}
                            </button>
                          ))
                        : isCor
                        // ── cor sem imagem: bolinhas ──
                        ? v.opcoes.map(op => (
                            <button
                              key={op.valor}
                              type="button"
                              title={op.valor}
                              onClick={() => selecionarVariacao(v.tipo, op.valor)}
                              className={`relative w-9 h-9 rounded-full border-2 transition-all duration-150 ${
                                selecionado === op.valor
                                  ? 'border-vinho scale-110 shadow-lg ring-2 ring-vinho/20'
                                  : 'border-white ring-1 ring-gray-300 hover:ring-vinho hover:scale-105'
                              }`}
                              style={{ backgroundColor: op.hex || '#ccc' }}
                            >
                              {selecionado === op.valor && (
                                <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold drop-shadow">✓</span>
                              )}
                            </button>
                          ))
                        // ── outros tipos: pill buttons ──
                        : v.opcoes.map(op => (
                            <button
                              key={op.valor}
                              type="button"
                              onClick={() => selecionarVariacao(v.tipo, op.valor)}
                              className={`px-4 py-2 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                                selecionado === op.valor
                                  ? 'border-vinho bg-vinho text-creme shadow-sm'
                                  : 'border-gray-200 text-vinho hover:border-vinho/60'
                              }`}
                            >
                              {op.valor}
                            </button>
                          ))
                      }
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {produto.estoque !== 'indisponivel' ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQuantidade(q => Math.max(1, q - 1))} className="px-4 py-3 text-vinho hover:bg-creme-dark transition-colors font-medium">−</button>
                  <span className="px-4 py-3 font-semibold text-vinho min-w-[3rem] text-center">{quantidade}</span>
                  <button onClick={() => setQuantidade(q => q + 1)} className="px-4 py-3 text-vinho hover:bg-creme-dark transition-colors font-medium">+</button>
                </div>
                <button
                  onClick={() => adicionar(
                    produto as any,
                    quantidade,
                    Object.keys(variacaoSelecionada).length ? variacaoSelecionada : undefined
                  )}
                  className="btn-primary flex-1 flex items-center justify-center gap-2">
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
