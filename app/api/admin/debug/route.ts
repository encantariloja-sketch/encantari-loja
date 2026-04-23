import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function isAuthorized() {
  const key = cookies().get('admin-key')?.value
  return key === (process.env.ADMIN_PASSWORD || 'encantari2024')
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const resultado: Record<string, any> = {
    env: {
      NEXT_PUBLIC_SUPABASE_URL: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
    }
  }

  try {
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()

    const { data: todasLinhas, error: errLinhas } = await db
      .from('configuracoes_home')
      .select('id, config')

    resultado.configuracoes_home = {
      erro: errLinhas?.message ?? null,
      total_linhas: todasLinhas?.length ?? 0,
      linhas: todasLinhas?.map(r => ({
        id: r.id,
        lancamentos_ids: r.config?.lancamentos_ids ?? 'NÃO TEM',
        mais_vendidos_ids: r.config?.mais_vendidos_ids ?? 'NÃO TEM',
        hero_cta2: r.config?.hero?.cta2_texto ?? 'NÃO TEM',
      })) ?? [],
    }
  } catch (err: any) {
    resultado.configuracoes_home = { erro: err.message }
  }

  try {
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data, error } = await db.from('categorias').select('id, nome').order('ordem')
    resultado.categorias = { erro: error?.message ?? null, ids: data?.map(c => c.id) ?? [] }
  } catch (err: any) {
    resultado.categorias = { erro: err.message }
  }

  return NextResponse.json(resultado, { status: 200 })
}
