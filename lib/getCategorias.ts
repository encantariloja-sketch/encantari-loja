import { cache } from 'react'
import { categorias as defaultCategorias } from '@/data/produtos'

export type CategoriaFull = {
  id: string
  nome: string
  icone: string
  cor: string
  ordem: number
  imagem?: string
}

export const getCategorias = cache(async (): Promise<CategoriaFull[]> => {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return defaultCategorias
    }
    const { createServiceClient } = await import('./supabase')
    const db = createServiceClient()
    const { data } = await db.from('categorias').select('*').order('ordem')
    return data?.length ? (data as CategoriaFull[]) : defaultCategorias
  } catch {
    return defaultCategorias
  }
})
