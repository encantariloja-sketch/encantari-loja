export type OpcaoVariacao = { valor: string; hex?: string }
export type Variacao = { tipo: string; opcoes: OpcaoVariacao[] }
export type VariacaoSelecionada = Record<string, string>

export type Produto = {
  id: string
  slug: string
  nome: string
  descricao: string
  categoria: string
  subcategoria?: string
  preco: number
  precoAntigo?: number
  sku?: string
  imagem: string
  imagens?: string[]
  estoque: 'disponivel' | 'sob-consulta' | 'indisponivel'
  destaque?: boolean
  novo?: boolean
  maisVendido?: boolean
  peso?: number
  dimensoes?: { comprimento: number; largura: number; altura: number }
  tags?: string[]
  variacoes?: Variacao[]
}

export const produtos: Produto[] = [
  // ─── Cafés e Chás ───
  {
    id: 'p1',
    slug: 'chacolate-mistura-especial',
    nome: 'Chácolate — Mistura Especial',
    descricao: 'Uma fusão mágica de cacau premium com especiarias selecionadas. Cada xícara é um abraço quentinho que aquece a alma. Perfeito para presentear ou para o seu ritual de pausa.',
    categoria: 'cafes-chas',
    preco: 38.90,
    sku: 'CAF-001',
    imagem: '',
    estoque: 'disponivel',
    destaque: true,
    novo: true,
    peso: 0.25,
    dimensoes: { comprimento: 15, largura: 8, altura: 8 },
    tags: ['chocolate', 'presente', 'chá'],
  },

  // ─── Canecas ───
  {
    id: 'p2',
    slug: 'caneca-mickey-porcelana',
    nome: 'Caneca Mickey — Porcelana',
    descricao: 'Caneca de porcelana com estampa oficial do Mickey Mouse, para começar o dia com a alegria de um clássico eterno. Capacidade 350ml, resistente à lava-louças.',
    categoria: 'canecas',
    preco: 59.90,
    precoAntigo: 79.90,
    sku: 'CAN-001',
    imagem: '',
    estoque: 'disponivel',
    destaque: true,
    maisVendido: true,
    peso: 0.35,
    dimensoes: { comprimento: 12, largura: 9, altura: 10 },
    tags: ['caneca', 'disney', 'mickey', 'presente'],
  },

  // ─── Vasos ───
  {
    id: 'p3',
    slug: 'vaso-decorativo-ceramico',
    nome: 'Vaso Decorativo Cerâmico',
    descricao: 'Vaso artesanal moldado à mão em cerâmica de alta qualidade. Cada peça é única — pequenas variações de cor e textura fazem parte do charme artesanal. Ideal para flores secas, galhos e arranjos decorativos.',
    categoria: 'vasos',
    preco: 89.90,
    sku: 'VAS-001',
    imagem: '',
    estoque: 'disponivel',
    destaque: true,
    novo: true,
    peso: 0.6,
    dimensoes: { comprimento: 14, largura: 14, altura: 22 },
    tags: ['vaso', 'cerâmica', 'decoração', 'artesanal'],
  },

  // ─── Flores Artificiais ───
  {
    id: 'p4',
    slug: 'arranjo-floral-decorativo',
    nome: 'Arranjo Floral Decorativo',
    descricao: 'Arranjo com flores artificiais de altíssima qualidade, com aparência tão real que surpreende. Beleza permanente, sem água, sem manutenção — só o encanto de sempre. Composição exclusiva, não repete.',
    categoria: 'flores-artificiais',
    preco: 129.90,
    precoAntigo: 159.90,
    sku: 'FLO-001',
    imagem: '',
    estoque: 'disponivel',
    maisVendido: true,
    peso: 0.4,
    dimensoes: { comprimento: 30, largura: 20, altura: 40 },
    tags: ['flores', 'arranjo', 'decoração', 'presente'],
  },

  // ─── Cerâmicas Decorativas ───
  {
    id: 'p5',
    slug: 'cachepot-ceramico',
    nome: 'Cachepô Cerâmico Rústico',
    descricao: 'Cachepô em cerâmica com acabamento rústico e textura única. Perfeito para plantas, suculentas e cactos — transforma qualquer cantinho em um cenário especial. Acompanha prato protetor.',
    categoria: 'ceramicas',
    preco: 74.90,
    sku: 'CER-001',
    imagem: '',
    estoque: 'disponivel',
    destaque: true,
    peso: 0.5,
    dimensoes: { comprimento: 13, largura: 13, altura: 12 },
    tags: ['cachepô', 'cerâmica', 'planta', 'decoração'],
  },

  // ─── Papelaria ───
  {
    id: 'p6',
    slug: 'caderno-decorativo',
    nome: 'Caderno Decorativo',
    descricao: 'Caderno com capa especial em material resistente e miolo pautado de 80 folhas. Para registrar pensamentos, planejar sonhos ou presentear quem você ama. Formato A5, compacto e elegante.',
    categoria: 'papelaria',
    preco: 49.90,
    precoAntigo: 59.90,
    sku: 'PAP-001',
    imagem: '',
    estoque: 'disponivel',
    maisVendido: true,
    novo: true,
    peso: 0.22,
    dimensoes: { comprimento: 21, largura: 15, altura: 1.5 },
    tags: ['caderno', 'papelaria', 'presente', 'escrita'],
  },

  // ─── Silvanian Families ───
  {
    id: 'p7',
    slug: 'kit-casa-silvanian-families',
    nome: 'Kit Casa — Silvanian Families',
    descricao: 'Um mini mundo encantador onde cada detalhe conta uma história. Kit oficial Silvanian Families com casinha e personagens — presente perfeito para crianças e colecionadores. Cria memórias que duram para sempre.',
    categoria: 'silvanian',
    preco: 219.90,
    precoAntigo: 259.90,
    sku: 'SIL-001',
    imagem: '',
    estoque: 'disponivel',
    destaque: true,
    maisVendido: true,
    peso: 0.8,
    dimensoes: { comprimento: 30, largura: 20, altura: 25 },
    tags: ['silvanian', 'brinquedo', 'colecionável', 'presente', 'infantil'],
  },
]

export const categorias = [
  { id: 'cafes-chas',       nome: 'Cafés e Chás',          icone: '☕', cor: '#C4956A', ordem: 1 },
  { id: 'canecas',          nome: 'Canecas',               icone: '🫖', cor: '#EF9493', ordem: 2 },
  { id: 'vasos',            nome: 'Vasos',                 icone: '🏺', cor: '#8F9150', ordem: 3 },
  { id: 'flores-artificiais', nome: 'Flores Artificiais',  icone: '🌸', cor: '#D4848A', ordem: 4 },
  { id: 'ceramicas',        nome: 'Cerâmicas',             icone: '🪴', cor: '#9B6B50', ordem: 5 },
  { id: 'papelaria',        nome: 'Papelaria',             icone: '📓', cor: '#6B7A8D', ordem: 6 },
  { id: 'silvanian',        nome: 'Silvanian Families',    icone: '🐿️', cor: '#C49A6C', ordem: 7 },
]
