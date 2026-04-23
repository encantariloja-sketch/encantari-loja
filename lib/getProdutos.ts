import { cache } from 'react'
import { produtos as fallback, type Produto } from '@/data/produtos'

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

export const getProdutos = cache(async (): Promise<Produto[]> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return fallback
    }
    const { createServiceClient } = await import('./supabase')
    const db = createServiceClient()
    const { data } = await db.from('produtos').select('*')
    return data?.length ? data.map(normalizar) : fallback
  } catch {
    return fallback
  }
})
