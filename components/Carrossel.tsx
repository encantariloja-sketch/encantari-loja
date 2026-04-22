'use client'
import { useRef } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import ProductCard from './ProductCard'
import type { Produto } from '@/data/produtos'

export default function Carrossel({ produtos }: { produtos: Produto[] }) {
  const ref = useRef<HTMLDivElement>(null)

  function scroll(dir: 'left' | 'right') {
    if (!ref.current) return
    const cardWidth = ref.current.querySelector(':first-child')?.clientWidth || 220
    ref.current.scrollBy({ left: dir === 'right' ? cardWidth * 2 : -cardWidth * 2, behavior: 'smooth' })
  }

  if (!produtos.length) return null

  return (
    <div className="relative group">
      {/* Botão esquerdo */}
      <button
        onClick={() => scroll('left')}
        className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 items-center justify-center text-vinho hover:bg-vinho hover:text-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Anterior"
      >
        <ChevronLeft size={18} />
      </button>

      {/* Carrossel */}
      <div
        ref={ref}
        className="flex gap-3 md:gap-4 overflow-x-auto scroll-hide pb-2"
        style={{ scrollSnapType: 'x mandatory' }}
      >
        {produtos.map(p => (
          <div
            key={p.id}
            className="flex-shrink-0 w-[160px] sm:w-[190px] md:w-[220px]"
            style={{ scrollSnapAlign: 'start' }}
          >
            <ProductCard produto={p} />
          </div>
        ))}
      </div>

      {/* Botão direito */}
      <button
        onClick={() => scroll('right')}
        className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-10 h-10 bg-white rounded-full shadow-md border border-gray-100 items-center justify-center text-vinho hover:bg-vinho hover:text-white transition-all opacity-0 group-hover:opacity-100"
        aria-label="Próximo"
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}
