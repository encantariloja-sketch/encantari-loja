import { cache } from 'react'

export type HomeConfig = {
  whatsapp: string
  topbar: string
  hero: {
    headline: string
    subheadline: string
    cta_texto: string
    cta_link: string
    cta2_texto: string
    cta2_link: string
    cor_fundo: string
    imagens: string[]
  }
  categorias_destaque: string[]
  lancamentos_ids: string[]
  mais_vendidos_ids: string[]
  banner_editorial: {
    texto: string
    subtexto: string
    cta_texto: string
    cta_link: string
    cor_fundo: string
    imagem?: string
  }
  banners_menores: Array<{
    titulo: string
    subtitulo: string
    link: string
    cor: string
    imagem?: string
  }>
  institucional: {
    label: string
    titulo: string
    titulo_italic: string
    corpo: string
    cta_texto: string
    cta_link: string
    beneficios: Array<{ emoji: string; titulo: string; sub: string }>
  }
  newsletter: {
    headline: string
    subtitulo: string
  }
}

export const defaultConfig: HomeConfig = {
  whatsapp: '',
  topbar: 'Frete grátis para todo o Brasil acima de R$ 199 • Parcelamento em até 12×',
  hero: {
    headline: 'Presentes que encantam, decoração que transforma',
    subheadline: 'Curadoria especial de itens únicos para a sua casa e para as pessoas que você ama.',
    cta_texto: 'Explorar loja',
    cta_link: '/produtos',
    cta2_texto: 'Silvanian Families',
    cta2_link: '/produtos?categoria=silvanian',
    cor_fundo: '#491E2F',
    imagens: [],
  },
  categorias_destaque: ['cafes-chas', 'canecas', 'vasos', 'flores-artificiais', 'ceramicas', 'papelaria', 'silvanian'],
  lancamentos_ids: [],
  mais_vendidos_ids: [],
  banner_editorial: {
    texto: 'Uma curadoria com alma',
    subtexto: 'Cada produto é escolhido com cuidado para trazer beleza e afeto para o seu dia a dia.',
    cta_texto: 'Conhecer coleção',
    cta_link: '/produtos',
    cor_fundo: '#8F9150',
  },
  banners_menores: [
    { titulo: 'Silvanian Families', subtitulo: 'Para colecionadores e crianças', link: '/produtos?categoria=silvanian', cor: '#F6CA99' },
    { titulo: 'Cafés e Chás', subtitulo: 'Momentos de puro prazer', link: '/produtos?categoria=cafes-chas', cor: '#EF9493' },
    { titulo: 'Papelaria', subtitulo: 'Para quem ama escrever', link: '/produtos?categoria=papelaria', cor: '#491E2F' },
  ],
  institucional: {
    label: 'Nossa proposta',
    titulo: 'Presentes com alma,',
    titulo_italic: 'escolhidos com amor',
    corpo: 'A Encantari é uma curadoria especial de produtos únicos para decoração e presentes afetivos. Cada item é selecionado com carinho para trazer beleza, aconchego e emoção para o seu dia a dia e para as pessoas que você ama.',
    cta_texto: 'Conhecer a loja',
    cta_link: '/produtos',
    beneficios: [
      { emoji: '🚚', titulo: 'Entrega para todo Brasil', sub: 'Via Melhor Envio' },
      { emoji: '✨', titulo: 'Produtos selecionados', sub: 'Curadoria especial' },
      { emoji: '💌', titulo: 'Atendimento próximo', sub: 'Respondemos rápido' },
      { emoji: '🎁', titulo: 'Embalagem presente', sub: 'Enviamos com cuidado' },
    ],
  },
  newsletter: {
    headline: 'Fique por dentro',
    subtitulo: 'Receba novidades, lançamentos e ofertas exclusivas diretamente no seu email.',
  },
}

export const getHomeConfig = cache(async (): Promise<HomeConfig> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return defaultConfig
    }
    const { createServiceClient } = await import('./supabase')
    const db = createServiceClient()
    const { data } = await db
      .from('configuracoes_home')
      .select('config')
      .limit(1)
      .maybeSingle()
    if (!data?.config) return defaultConfig
    const saved = data.config as Partial<HomeConfig>
    return {
      ...defaultConfig,
      ...saved,
      hero: { ...defaultConfig.hero, ...(saved.hero || {}) },
      banner_editorial: { ...defaultConfig.banner_editorial, ...(saved.banner_editorial || {}) },
      institucional: {
        ...defaultConfig.institucional,
        ...(saved.institucional || {}),
        beneficios: saved.institucional?.beneficios ?? defaultConfig.institucional.beneficios,
      },
      newsletter: { ...defaultConfig.newsletter, ...(saved.newsletter || {}) },
    }
  } catch {
    return defaultConfig
  }
})
