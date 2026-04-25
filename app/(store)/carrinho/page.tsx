'use client'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, ShoppingBag, ArrowLeft, ArrowRight } from 'lucide-react'
import { useCart } from '@/lib/CartContext'

export default function CarrinhoPage() {
  const { itens, totalPreco, remover, alterarQuantidade } = useCart()

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
                {/* Variações selecionadas */}
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
                    <button
                      onClick={() => alterarQuantidade(chave, quantidade - 1)}
                      className="px-3 py-1.5 text-vinho hover:bg-creme-dark"
                    >−</button>
                    <span className="px-3 py-1.5 font-semibold text-vinho">{quantidade}</span>
                    <button
                      onClick={() => alterarQuantidade(chave, quantidade + 1)}
                      className="px-3 py-1.5 text-vinho hover:bg-creme-dark"
                    >+</button>
                  </div>
                  <button
                    onClick={() => remover(chave)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumo */}
        <div>
          <div className="card p-6 sticky top-24">
            <h2 className="heading text-xl mb-4">Resumo</h2>
            <div className="space-y-3 text-sm mb-6">
              {itens.map(({ chave, produto, quantidade, variacao }) => (
                <div key={chave} className="flex justify-between text-vinho/70">
                  <span className="truncate mr-2">
                    {produto.nome}
                    {variacao && Object.keys(variacao).length > 0 && (
                      <span className="text-vinho/40">
                        {' · '}{Object.values(variacao).join(' / ')}
                      </span>
                    )}
                    {' '}×{quantidade}
                  </span>
                  <span className="font-medium">R$ {(produto.preco * quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
              <div className="border-t border-creme-dark pt-3 flex justify-between font-bold text-vinho text-base">
                <span>Total</span>
                <span>R$ {totalPreco.toFixed(2).replace('.', ',')}</span>
              </div>
              <p className="text-vinho/50 text-xs">+ frete calculado no checkout</p>
            </div>
            <Link href="/checkout" className="btn-primary w-full flex items-center justify-center gap-2">
              Finalizar compra <ArrowRight size={18} />
            </Link>
            <Link href="/produtos" className="btn-secondary w-full flex items-center justify-center gap-2 mt-3 text-sm">
              <ArrowLeft size={16} /> Continuar comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
