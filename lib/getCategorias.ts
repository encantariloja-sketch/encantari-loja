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
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!url || !key) return defaultCategorias

    const { createClient } = await import('@supabase/supabase-js')
    const db = createClient(url, key)
    const { data } = await db.from('categorias').select('*').order('ordem')
    return data?.length ? (data as CategoriaFull[]) : defaultCategorias
  } catch {
    return defaultCategorias
  }
})
