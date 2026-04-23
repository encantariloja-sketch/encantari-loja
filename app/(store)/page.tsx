export const dynamic = 'force-dynamic'

import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { createClient } from '@supabase/supabase-js'
import Carrossel from '@/components/Carrossel'
import HeroCarrossel from '@/components/HeroCarrossel'
import { getHomeConfig } from '@/lib/homeConfig'
import { getCategorias } from '@/lib/getCategorias'
import type { Produto } from '@/data/produtos'

function normalizar(row: Record<string, any>): Produto {
  return {
    id: row.id,
    slug: row.slug || '',
    nome: row.nome || '',
    descricao: row.descricao || '',
    categoria: row.categoria || '',
    preco: Number(row.preco) || 0,
    precoAntigo: row.preco_antigo ? Number(row.preco_antigo) : undefined,
    sku: row.sku || undefined,
    imagem: row.imagem || '',
    imagens: row.imagens || [],
    estoque: row.estoque || 'disponivel',
    destaque: row.destaque ?? false,
    novo: row.novo ?? false,
    peso: row.peso ? Number(row.peso) : undefined,
    dimensoes: (row.comprimento && row.largura && row.altura)
      ? { comprimento: Number(row.comprimento), largura: Number(row.largura), altura: Number(row.altura) }
      : undefined,
    tags: row.tags || [],
  }
}

async function getVitrine(ids: string[], fallbackFiltro: 'novo' | 'destaque'): Promise<Produto[]> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) return []

  try {
    const db = createClient(url, key)

    if (ids.length > 0) {
      const { data } = await db.from('produtos').select('*').in('id', ids)
      if (data && data.length > 0) return data.map(normalizar)
    }

    // fallback: busca automática por flag
    const { data } = await db.from('produtos').select('*').eq(fallbackFiltro, true).limit(8)
    return data ? data.map(normalizar) : []
  } catch {
    return []
  }
}

export default async function Home() {
  const config = await getHomeConfig()

  const [todasCategorias, lancamentosFinais, maisVendidosFinais] = await Promise.all([
    getCategorias(),
    getVitrine(config.lancamentos_ids, 'novo'),
    getVitrine(config.mais_vendidos_ids, 'destaque'),
  ])

  const categoriasDestaque = config.categorias_destaque
    .map(id => todasCategorias.find(c => c.id === id))
    .filter(Boolean) as typeof todasCategorias

  return (
    <>
      {/* ═══════════════ HERO ═══════════════ */}
      <HeroCarrossel config={config.hero} />

      {/* ═══════════════ CATEGORIAS EM DESTAQUE ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <h2 className="section-title">Explorar por categoria</h2>
          </div>
          <Link href="/produtos" className="text-rosa text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
            Ver tudo <ArrowRight size={14} />
          </Link>
        </div>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {categoriasDestaque.map(cat => (
            <Link
              key={cat.id}
              href={`/produtos?categoria=${cat.id}`}
              className="group flex flex-col items-center gap-2 p-3 md:p-4 rounded-2xl border border-gray-100 hover:border-rosa/40 hover:shadow-sm bg-white transition-all"
            >
              <div
                className="w-12 h-12 md:w-14 md:h-14 rounded-2xl overflow-hidden flex items-center justify-center text-2xl md:text-3xl group-hover:scale-110 transition-transform flex-shrink-0"
                style={cat.imagem ? {} : { backgroundColor: cat.cor + '22' }}
              >
                {cat.imagem
                  ? <Image src={cat.imagem} alt={cat.nome} width={56} height={56} className="w-full h-full object-cover" />
                  : cat.icone
                }
              </div>
              <span className="text-xs font-medium text-vinho/80 text-center leading-tight">{cat.nome}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ LANÇAMENTOS ═══════════════ */}
      {lancamentosFinais.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12 md:pb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">Lançamentos</h2>
              <p className="section-subtitle">Novidades que você vai amar</p>
            </div>
            <Link href="/produtos?ordem=novos" className="text-rosa text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <Carrossel produtos={lancamentosFinais} />
        </section>
      )}

      {/* ═══════════════ BANNER EDITORIAL ═══════════════ */}
      <section className="px-4 pb-12 md:pb-16">
        <div
          className="max-w-7xl mx-auto rounded-3xl overflow-hidden relative"
          style={{ backgroundColor: config.banner_editorial.cor_fundo }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -bottom-8 -right-8 w-48 h-48 rounded-full opacity-10 bg-white" />
            <div className="absolute top-4 left-1/2 w-24 h-24 rounded-full opacity-5 bg-white" />
          </div>
          <div className="relative z-10 px-8 md:px-16 py-12 md:py-16 text-white max-w-xl">
            <p className="text-white/60 text-xs font-medium tracking-widest uppercase mb-3">Encantari</p>
            <h2 className="font-fraunces text-3xl md:text-4xl font-semibold mb-3 leading-tight">
              {config.banner_editorial.texto}
            </h2>
            <p className="text-white/70 text-base leading-relaxed mb-6">
              {config.banner_editorial.subtexto}
            </p>
            <Link
              href={config.banner_editorial.cta_link}
              className="inline-flex items-center gap-2 bg-white text-vinho px-6 py-3 rounded-full text-sm font-semibold hover:bg-creme transition-colors"
            >
              {config.banner_editorial.cta_texto} <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════ MAIS VENDIDOS ═══════════════ */}
      {maisVendidosFinais.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 pb-12 md:pb-16">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="section-title">Mais Vendidos</h2>
              <p className="section-subtitle">Os queridinhos da nossa loja</p>
            </div>
            <Link href="/produtos" className="text-rosa text-sm font-medium flex items-center gap-1 hover:gap-2 transition-all">
              Ver todos <ArrowRight size={14} />
            </Link>
          </div>
          <Carrossel produtos={maisVendidosFinais} />
        </section>
      )}

      {/* ═══════════════ BLOCO INSTITUCIONAL ═══════════════ */}
      <section className="bg-creme py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-rosa text-xs font-semibold tracking-widest uppercase mb-3">{config.institucional.label}</p>
              <h2 className="font-fraunces text-3xl md:text-4xl font-semibold text-vinho mb-5 leading-tight">
                {config.institucional.titulo}<br />
                <span className="italic text-rosa">{config.institucional.titulo_italic}</span>
              </h2>
              <p className="text-vinho/70 leading-relaxed mb-6">
                {config.institucional.corpo}
              </p>
              <Link href={config.institucional.cta_link} className="btn-primary">
                {config.institucional.cta_texto}
              </Link>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {config.institucional.beneficios.map(b => (
                <div key={b.titulo} className="bg-white rounded-2xl p-5 border border-white/80">
                  <span className="text-3xl block mb-2">{b.emoji}</span>
                  <p className="font-fraunces font-semibold text-vinho text-sm mb-0.5">{b.titulo}</p>
                  <p className="text-vinho/50 text-xs">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════ BANNERS MENORES ═══════════════ */}
      <section className="max-w-7xl mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {config.banners_menores.map((b, i) => (
            <Link
              key={i}
              href={b.link}
              className="group relative rounded-2xl overflow-hidden aspect-[4/3] flex items-end p-6 hover:shadow-lg transition-shadow"
              style={{ backgroundColor: b.cor }}
            >
              {b.imagem && (
                <Image src={b.imagem} alt={b.titulo} fill className="object-cover" />
              )}
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="relative z-10 text-white">
                <p className="font-fraunces text-xl font-semibold leading-tight">{b.titulo}</p>
                <p className="text-white/70 text-sm mt-1">{b.subtitulo}</p>
                <span className="inline-flex items-center gap-1 text-xs font-medium mt-2 text-white/80 group-hover:gap-2 transition-all">
                  Explorar <ArrowRight size={12} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ═══════════════ NEWSLETTER ═══════════════ */}
      <section className="bg-vinho py-14 px-4">
        <div className="max-w-2xl mx-auto text-center text-creme">
          <p className="text-rosa text-xs font-semibold tracking-widest uppercase mb-3">Newsletter</p>
          <h2 className="font-fraunces text-3xl md:text-4xl font-semibold mb-3">
            {config.newsletter.headline}
          </h2>
          <p className="text-creme/60 mb-7">
            {config.newsletter.subtitulo}
          </p>
          <form className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <input
              type="email"
              placeholder="seu@email.com.br"
              className="flex-1 px-5 py-3.5 rounded-full text-sm bg-white/10 border border-white/20 text-creme placeholder:text-creme/40 focus:outline-none focus:border-rosa backdrop-blur-sm"
            />
            <button type="submit" className="bg-rosa text-white px-7 py-3.5 rounded-full text-sm font-semibold hover:bg-rosa-light transition-colors whitespace-nowrap">
              Inscrever
            </button>
          </form>
        </div>
      </section>
    </>
  )
}
