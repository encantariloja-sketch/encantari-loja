import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { defaultConfig } from '@/lib/homeConfig'

// ID fixo — garante que sempre existe exatamente uma linha na tabela
const SINGLETON_ID = '00000000-0000-0000-0000-000000000001'

function isAuthorized() {
  const key = cookies().get('admin-key')?.value
  return key === (process.env.ADMIN_PASSWORD || 'encantari2024')
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ config: null })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data, error } = await db
      .from('configuracoes_home')
      .select('config')
      .eq('id', SINGLETON_ID)
      .maybeSingle()
    if (error) throw error
    return NextResponse.json({ config: data?.config ?? null })
  } catch (err: any) {
    return NextResponse.json({ config: null, aviso: 'Erro ao carregar config: ' + (err?.message || err) })
  }
}

export async function POST(req: Request) {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { config } = await req.json()

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: true, aviso: 'SUPABASE_SERVICE_ROLE_KEY não configurado no servidor — alterações não persistidas' })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()

    const { error } = await db
      .from('configuracoes_home')
      .upsert({ id: SINGLETON_ID, config }, { onConflict: 'id' })

    if (error) throw error

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || String(err) }, { status: 500 })
  }
}
