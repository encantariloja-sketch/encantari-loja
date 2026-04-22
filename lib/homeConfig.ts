export type HomeConfig = {
  topbar: string
  hero: {
    headline: string
    subheadline: string
    cta_texto: string
    cta_link: string
    cor_fundo: string
    imagem?: string
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
}

export const defaultConfig: HomeConfig = {
  topbar: 'Frete grátis para todo o Brasil acima de R$ 199 • Parcelamento em até 12×',
  hero: {
    headline: 'Presentes que encantam, decoração que transforma',
    subheadline: 'Curadoria especial de itens únicos para a sua casa e para as pessoas que você ama.',
    cta_texto: 'Explorar loja',
    cta_link: '/produtos',
    cor_fundo: '#491E2F',
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
}

export async function getHomeConfig(): Promise<HomeConfig> {
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
    if (data?.config) return { ...defaultConfig, ...(data.config as HomeConfig) }
    return defaultConfig
  } catch {
    return defaultConfig
  }
}
