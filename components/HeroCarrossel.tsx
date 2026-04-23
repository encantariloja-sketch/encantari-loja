'use client'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight, Star, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import type { HomeConfig } from '@/lib/homeConfig'

type HeroConfig = HomeConfig['hero']

export default function HeroCarrossel({ config }: { config: HeroConfig }) {
  const imagens = config.imagens ?? []
  const [atual, setAtual] = useState(0)
  const [pausado, setPausado] = useState(false)

  const proximo = useCallback(() => {
    setAtual(i => (i + 1) % imagens.length)
  }, [imagens.length])

  const anterior = useCallback(() => {
    setAtual(i => (i - 1 + imagens.length) % imagens.length)
  }, [imagens.length])

  useEffect(() => {
    if (imagens.length <= 1 || pausado) return
    const t = setInterval(proximo, 5000)
    return () => clearInterval(t)
  }, [imagens.length, pausado, proximo])

  const temImagens = imagens.length > 0

  return (
    <section
      className="relative overflow-hidden"
      style={{ backgroundColor: config.cor_fundo, minHeight: temImagens ? 480 : undefined }}
      onMouseEnter={() => setPausado(true)}
      onMouseLeave={() => setPausado(false)}
    >
      {/* Imagens de fundo com cross-fade */}
      {temImagens && imagens.map((src, i) => (
        <div
          key={src}
          className="absolute inset-0 transition-opacity duration-700"
          style={{ opacity: i === atual ? 1 : 0 }}
        >
          <Image
            src={src}
            alt={`Banner ${i + 1}`}
            fill
            className="object-cover"
            priority={i === 0}
          />
        </div>
      ))}

      {/* Overlay escuro quando tem imagem */}
      {temImagens && <div className="absolute inset-0 bg-black/45" />}

      {/* Decorações (só sem imagem) */}
      {!temImagens && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-96 h-96 rounded-full opacity-10" style={{ backgroundColor: '#EF9493' }} />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full opacity-10" style={{ backgroundColor: '#F6CA99' }} />
          <div className="absolute top-1/2 right-1/4 w-32 h-32 rounded-full opacity-5" style={{ backgroundColor: '#FEF4F3' }} />
        </div>
      )}

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 py-16 md:py-24 relative z-10">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-3 py-1.5 rounded-full mb-6 backdrop-blur-sm">
            <Star size={12} className="fill-current text-bege" />
            Curadoria especial para você
          </div>
          <h1 className="font-fraunces text-4xl sm:text-5xl md:text-6xl font-semibold text-white leading-[1.1] mb-5">
            {config.headline}
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-8 max-w-xl">
            {config.subheadline}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={config.cta_link}
              className="inline-flex items-center gap-2 bg-white text-vinho px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-creme transition-colors shadow-lg"
            >
              {config.cta_texto} <ArrowRight size={16} />
            </Link>
            {config.cta2_texto && (
              <Link
                href={config.cta2_link}
                className="inline-flex items-center gap-2 border border-white/30 text-white px-7 py-3.5 rounded-full font-medium text-sm hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                {config.cta2_texto}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Setas de navegação (só com múltiplas imagens) */}
      {imagens.length > 1 && (
        <>
          <button
            onClick={anterior}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            aria-label="Foto anterior"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={proximo}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all"
            aria-label="Próxima foto"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots */}
      {imagens.length > 1 && (
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {imagens.map((_, i) => (
            <button
              key={i}
              onClick={() => setAtual(i)}
              className={`h-2 rounded-full transition-all ${i === atual ? 'bg-white w-6' : 'bg-white/40 w-2'}`}
              aria-label={`Foto ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
