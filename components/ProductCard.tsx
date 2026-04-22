'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ShoppingBag, Heart } from 'lucide-react'
import type { Produto } from '@/data/produtos'
import { useCart } from '@/lib/CartContext'

const PLACEHOLDER_COLORS: Record<string, string> = {
  'cafes-chas': '#C4956A',
  'canecas': '#EF9493',
  'vasos': '#8F9150',
  'flores-artificiais': '#D4848A',
  'ceramicas': '#9B6B50',
  'papelaria': '#6B7A8D',
  'silvanian': '#C49A6C',
}

const PLACEHOLDER_ICONS: Record<string, string> = {
  'cafes-chas': '☕',
  'canecas': '🫖',
  'vasos': '🏺',
  'flores-artificiais': '🌸',
  'ceramicas': '🪴',
  'papelaria': '📓',
  'silvanian': '🐿️',
}

export default function ProductCard({ produto }: { produto: Produto }) {
  const { adicionar } = useCart()

  const desconto = produto.precoAntigo
    ? Math.round((1 - produto.preco / produto.precoAntigo) * 100)
    : null

  const placeholderColor = PLACEHOLDER_COLORS[produto.categoria] || '#EF9493'
  const placeholderIcon = PLACEHOLDER_ICONS[produto.categoria] || '✨'

  return (
    <div className="produto-card group flex flex-col bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
      <Link href={`/produto/${produto.slug}`} className="relative aspect-square overflow-hidden flex-shrink-0">
        {produto.imagem ? (
          <Image
            src={produto.imagem}
            alt={produto.nome}
            fill
            className="produto-card-img object-cover"
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-2"
            style={{ backgroundColor: placeholderColor + '22' }}
          >
            <span className="text-4xl md:text-5xl">{placeholderIcon}</span>
          </div>
        )}
        {produto.novo && (
          <span className="absolute top-2 left-2 bg-vinho text-white text-[10px] font-semibold px-2 py-0.5 rounded-full tracking-wide">
            NOVO
          </span>
        )}
        {desconto && (
          <span className="absolute top-2 right-2 bg-oliva text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
            -{desconto}%
          </span>
        )}
        {produto.estoque !== 'disponivel' && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
            <span className="text-vinho text-xs font-semibold bg-white px-3 py-1.5 rounded-full border border-vinho/20">
              {produto.estoque === 'indisponivel' ? 'Esgotado' : 'Sob consulta'}
            </span>
          </div>
        )}
      </Link>
      <div className="p-3 md:p-4 flex flex-col flex-1">
        <Link href={`/produto/${produto.slug}`} className="flex-1">
          <p className="text-vinho/50 text-[10px] uppercase tracking-wider mb-1 font-medium">
            {produto.categoria.replace(/-/g, ' ')}
          </p>
          <h3 className="font-fraunces text-vinho font-medium text-sm md:text-[15px] leading-snug hover:text-vinho-light transition-colors line-clamp-2">
            {produto.nome}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-3 gap-2">
          <div>
            <p className="text-vinho font-bold text-sm md:text-base">
              R$ {produto.preco.toFixed(2).replace('.', ',')}
            </p>
            {produto.precoAntigo && (
              <p className="text-gray-400 text-xs line-through leading-none mt-0.5">
                R$ {produto.precoAntigo.toFixed(2).replace('.', ',')}
              </p>
            )}
          </div>
          {produto.estoque === 'disponivel' && (
            <button
              onClick={(e) => { e.preventDefault(); adicionar(produto) }}
              className="flex-shrink-0 w-9 h-9 flex items-center justify-center bg-vinho text-creme rounded-full hover:bg-vinho-light transition-colors active:scale-90"
              aria-label="Adicionar ao carrinho"
            >
              <ShoppingBag size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
