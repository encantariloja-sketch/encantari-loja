import { cache } from 'react'

export type HomeConfig = {
  whatsapp: string
  topbar: string
  secoes_ativas: {
    categorias: boolean
    lancamentos: boolean
    banner_editorial: boolean
    mais_vendidos: boolean
    institucional: boolean
    banners_menores: boolean
    newsletter: boolean
  }
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
    banner_imagem?: string
    beneficios: Array<{ emoji: string; titulo: string; sub: string }>
  }
  newsletter: {
    headline: string
    subtitulo: string
  }
  termos: {
    banner_imagem?: string
    ultima_atualizacao: string
    secoes: Array<{ titulo: string; conteudo: string }>
  }
  beneficios_footer: Array<{ titulo: string; sub: string }>
  rodape: {
    email: string
    instagram: string
    endereco: string
    horario: string
    ajuda: Array<{ label: string; href: string }>
    institucional: Array<{ label: string; href: string }>
  }
}

export const defaultConfig: HomeConfig = {
  whatsapp: '5541995872092',
  topbar: 'Entregamos para todo o Brasil • Pague com Pix ou cartão',
  beneficios_footer: [
    { titulo: 'Frete para todo Brasil', sub: 'Via Melhor Envio' },
    { titulo: 'Compra segura', sub: 'Site protegido SSL' },
    { titulo: 'Cartão ou Pix', sub: 'Parcelamento com juros' },
    { titulo: 'Troca fácil', sub: 'Política flexível' },
  ],
  secoes_ativas: {
    categorias: true,
    lancamentos: true,
    banner_editorial: true,
    mais_vendidos: true,
    institucional: true,
    banners_menores: true,
    newsletter: true,
  },
  hero: {
    headline: 'Presentes que encantam, decoração que transforma',
    subheadline: 'Curadoria especial de itens únicos para a sua casa e para as pessoas que você ama.',
    cta_texto: 'Explorar loja',
    cta_link: '/produtos',
    cta2_texto: '',
    cta2_link: '',
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
  termos: {
    ultima_atualizacao: 'abril de 2025',
    secoes: [
      { titulo: '1. Aceitação dos termos', conteudo: 'Ao acessar e utilizar o site da Encantari, você concorda com os presentes Termos de Uso. Caso não concorde, pedimos que não utilize nossos serviços.' },
      { titulo: '2. Produtos e preços', conteudo: 'Todos os preços exibidos estão em Reais (R$) e podem ser alterados sem aviso prévio. Nos esforçamos para manter as informações atualizadas, mas erros podem ocorrer. Em caso de divergência de preço, entraremos em contato antes de prosseguir com o pedido.' },
      { titulo: '3. Pagamentos', conteudo: 'Aceitamos cartão de crédito, Pix e boleto bancário, processados com segurança pelo Mercado Pago. Seus dados financeiros não são armazenados em nossos servidores.' },
      { titulo: '4. Entrega e frete', conteudo: 'As entregas são realizadas via Correios (pelos serviços PAC e SEDEX) para todo o Brasil. Os prazos e valores de frete são calculados no momento da compra com base no CEP de destino. Não nos responsabilizamos por atrasos causados por transportadoras ou eventos externos.' },
      { titulo: '5. Trocas e devoluções', conteudo: 'Conforme o Código de Defesa do Consumidor, você tem até 7 dias após o recebimento para solicitar a devolução de produtos adquiridos online. Produtos com defeito serão trocados sem custo adicional. Entre em contato conosco para iniciar o processo.' },
      { titulo: '6. Privacidade', conteudo: 'Os dados coletados (nome, e-mail, endereço) são utilizados exclusivamente para processar pedidos e melhorar sua experiência. Não compartilhamos suas informações com terceiros, exceto as transportadoras necessárias para a entrega.' },
      { titulo: '7. Contato', conteudo: 'Dúvidas sobre estes termos? Fale conosco pelo nosso canal de atendimento em /contato.' },
    ],
  },
  rodape: {
    email: 'encantari.loja@gmail.com',
    instagram: 'encantari.loja',
    endereco: 'R. Léa Vialle Cury, 146 - Centro\nMatinhos - PR, 83260-000',
    horario: 'Seg–Sex, 9h às 18h',
    ajuda: [
      { label: 'Rastrear pedido', href: '/rastrear' },
      { label: 'Fale conosco', href: '/contato' },
    ],
    institucional: [
      { label: 'Sobre a Encantari', href: '/sobre' },
      { label: 'Termos de uso', href: '/termos' },
    ],
  },
}

const SINGLETON_ID = '00000000-0000-0000-0000-000000000001'

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
      .eq('id', SINGLETON_ID)
      .maybeSingle()
    if (!data?.config) return defaultConfig
    const saved = data.config as Partial<HomeConfig>
    const savedRodape = (saved.rodape || {}) as Partial<HomeConfig['rodape']>
    const savedTermos = (saved.termos || {}) as Partial<HomeConfig['termos']>
    return {
      ...defaultConfig,
      ...saved,
      secoes_ativas: { ...defaultConfig.secoes_ativas, ...(saved.secoes_ativas || {}) },
      beneficios_footer: saved.beneficios_footer ?? defaultConfig.beneficios_footer,
      hero: { ...defaultConfig.hero, ...(saved.hero || {}) },
      banner_editorial: { ...defaultConfig.banner_editorial, ...(saved.banner_editorial || {}) },
      institucional: {
        ...defaultConfig.institucional,
        ...(saved.institucional || {}),
        beneficios: saved.institucional?.beneficios ?? defaultConfig.institucional.beneficios,
      },
      newsletter: { ...defaultConfig.newsletter, ...(saved.newsletter || {}) },
      termos: {
        ...defaultConfig.termos,
        ...savedTermos,
        secoes: savedTermos.secoes ?? defaultConfig.termos.secoes,
      },
      rodape: {
        ...defaultConfig.rodape,
        ...savedRodape,
        ajuda: savedRodape.ajuda ?? defaultConfig.rodape.ajuda,
        institucional: savedRodape.institucional ?? defaultConfig.rodape.institucional,
      },
    }
  } catch {
    return defaultConfig
  }
})
