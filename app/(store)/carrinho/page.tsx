'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight, Truck, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/CartContext'

type OpcaoFrete = { id: string; nome: string; preco: number; prazo: string }

const STORAGE_KEY = 'encantari_checkout_dados'

export default function CarrinhoPage() {
  const { itens, totalPreco, remover, alterarQuantidade } = useCart()
  const [cep, setCep] = useState('')
  const [loadingFrete, setLoadingFrete] = useState(false)
  const [opcoesFrete, setOpcoesFrete] = useState<OpcaoFrete[]>([])
  const [avisoFrete, setAvisoFrete] = useState('')
  const [freteCalculado, setFreteCalculado] = useState(false)

  const calcularFrete = useCallback(async (cepLimpo: string) => {
    if (cepLimpo.length !== 8 || itens.length === 0) return
    setLoadingFrete(true)
    setAvisoFrete('')
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep_destino: cepLimpo,
          produtos: itens.map(i => ({
            id: i.produto.id,
            quantidade: i.quantidade,
            peso: i.produto.peso || 0.3,
            dimensoes: i.produto.dimensoes,
          })),
        }),
      })
      const data = await res.json()
      setOpcoesFrete(data.opcoes || [])
      setAvisoFrete(data.aviso || '')
      setFreteCalculado(true)
    } catch {
      setAvisoFrete('Erro ao calcular. Tente novamente.')
    }
    setLoadingFrete(false)
  }, [itens])

  // Carrega CEP salvo e calcula automaticamente
  useEffect(() => {
    if (itens.length === 0) return
    const saved = localStorage.getItem(STORAGE_KEY)
    if (!saved) return
    try {
      const parsed = JSON.parse(saved)
      const cepSalvo = (parsed.cep || '').replace(/\D/g, '')
      if (cepSalvo.length === 8) {
        setCep(parsed.cep)
        calcularFrete(cepSalvo)
      }
    } catch {}
  }, [itens, calcularFrete])

  function handleCepChange(valor: string) {
    const formatado = valor.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2')
    setCep(formatado)
    setFreteCalculado(false)
    setOpcoesFrete([])
    // Salva CEP atualizado no localStorage
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      const atual = saved ? JSON.parse(saved) : {}
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...atual, cep: formatado }))
    } catch {}
  }

  if (itens.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <ShoppingBag size={64} className="mx-auto text-creme-dark mb-6" />
        <h1 className="heading text-3xl mb-3">Seu carrinho está vazio</h1>
        <p className="text-vinho/60 mb-8">Adicione produtos incríveis ao seu carrinho.</p>
        <Link href="/produtos" className="btn-primary">Explorar produtos</Link>
      </div>
    )
  }

  const menorFrete = opcoesFrete.length > 0 ? opcoesFrete[0] : null

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="heading text-3xl md:text-4xl mb-8">Carrinho</h1>

      <div className="grid md:grid-cols-3 gap-8">
        {/* Itens */}
        <div className="md:col-span-2 space-y-4">
          {itens.map(({ chave, produto, quantidade, variacao }) => (
            <div key={chave} className="card p-4 flex gap-4">
              <Link href={`/produto/${produto.slug}`} className="flex-shrink-0 w-24 h-24 relative rounded-xl overflow-hidden bg-creme-dark">
                <Image
                  src={produto.imagem || '/images/produto-placeholder.jpg'}
                  alt={produto.nome}
                  fill
                  className="object-cover"
                />
              </Link>
              <div className="flex-1 min-w-0">
                <Link href={`/produto/${produto.slug}`} className="font-fraunces font-medium text-vinho hover:text-vinho-light line-clamp-2">
                  {produto.nome}
                </Link>
                {variacao && Object.keys(variacao).length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {Object.entries(variacao).map(([tipo, valor]) => {
                      const cor = produto.variacoes
                        ?.find(v => v.tipo === tipo)
                        ?.opcoes.find(o => o.valor === valor)?.hex
                      return (
                        <span key={tipo} className="flex items-center gap-1 text-xs text-vinho/60 bg-creme rounded-full px-2 py-0.5">
                          {cor && (
                            <span className="w-2.5 h-2.5 rounded-full border border-white/60 flex-shrink-0" style={{ backgroundColor: cor }} />
                          )}
                          {tipo}: <strong className="text-vinho/80">{valor}</strong>
                        </span>
                      )
                    })}
                  </div>
                )}
                <p className="text-vinho font-bold mt-1">
                  R$ {produto.preco.toFixed(2).replace('.', ',')}
                </p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden text-sm">
                    <button onClick={() => alterarQuantidade(chave, quantidade - 1)} className="px-3 py-1.5 text-vinho hover:bg-creme-dark">−</button>
                    <span className="px-3 py-1.5 font-semibold text-vinho">{quantidade}</span>
                    <button onClick={() => alterarQuantidade(chave, quantidade + 1)} className="px-3 py-1.5 text-vinho hover:bg-creme-dark">+</button>
                  </div>
                  <button onClick={() => remover(chave)} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div>
          <div className="card p-6 sticky top-24 space-y-4">
            <h2 className="heading text-xl">Resumo</h2>

            <div className="space-y-2 text-sm">
              {itens.map(({ chave, produto, quantidade, variacao }) => (
                <div key={chave} className="flex justify-between text-vinho/70">
                  <span className="truncate mr-2">
                    {produto.nome}
                    {variacao && Object.keys(variacao).length > 0 && (
                      <span className="text-vinho/40">{' · '}{Object.values(variacao).join(' / ')}</span>
                    )}
                    {' '}×{quantidade}
                  </span>
                  <span className="font-medium">R$ {(produto.preco * quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              <div className="border-t border-creme-dark pt-3 flex justify-between font-bold text-vinho text-base">
                <span>Subtotal</span>
                <span>R$ {totalPreco.toFixed(2).replace('.', ',')}</span>
              </div>
              {menorFrete && (
                <div className="flex justify-between text-vinho/60 text-xs">
                  <span>Frete (estimativa)</span>
                  <span>{menorFrete.preco === 0 ? 'Grátis' : `a partir de R$ ${menorFrete.preco.toFixed(2).replace('.', ',')}`}</span>
                </div>
              )}
            </div>

            {/* Estimativa de frete */}
            <div className="border-t border-creme-dark pt-4">
              <p className="text-xs font-semibold text-vinho/50 uppercase tracking-wide mb-2 flex items-center gap-1.5">
                <Truck size={13} /> Estimar frete
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="00000-000"
                  value={cep}
                  onChange={e => handleCepChange(e.target.value)}
                  maxLength={9}
                  className="input flex-1 text-sm"
                />
                <button
                  onClick={() => calcularFrete(cep.replace(/\D/g, ''))}
                  disabled={loadingFrete || cep.replace(/\D/g, '').length !== 8}
                  className="px-3 py-2 bg-vinho text-creme text-sm font-medium rounded-xl disabled:opacity-40 hover:bg-vinho/90 transition-colors"
                >
                  {loadingFrete ? <Loader2 size={16} className="animate-spin" /> : 'OK'}
                </button>
              </div>

              {freteCalculado && opcoesFrete.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  {opcoesFrete.slice(0, 3).map(op => (
                    <div key={op.id} className="flex justify-between items-center text-xs bg-creme rounded-lg px-3 py-2">
                      <span className="text-vinho/70 truncate mr-2">{op.nome}</span>
                      <span className="text-vinho font-semibold flex-shrink-0">
                        {op.preco === 0 ? 'Grátis' : `R$ ${op.preco.toFixed(2).replace('.', ',')}`}
                        {op.prazo && <span className="text-vinho/40 font-normal ml-1">· {op.prazo}</span>}
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {avisoFrete && (
                <p className="text-xs text-vinho/50 mt-2">{avisoFrete}</p>
              )}
            </div>

            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Finalizar compra <ArrowRight size={18} />
            </Link>
            <Link href="/produtos" className="btn-secondary w-full flex items-center justify-center gap-2 text-sm">
              <ArrowLeft size={16} /> Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
