import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { defaultConfig } from '@/lib/homeConfig'

function isAuthorized() {
  const key = cookies().get('admin-key')?.value
  return key === (process.env.ADMIN_PASSWORD || 'encantari2024')
}

export async function GET() {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ config: defaultConfig })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data } = await db.from('configuracoes_home').select('config').limit(1).maybeSingle()
    return NextResponse.json({ config: data?.config ? { ...defaultConfig, ...data.config } : defaultConfig })
  } catch {
    return NextResponse.json({ config: defaultConfig })
  }
}

export async function POST(req: Request) {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { config } = await req.json()

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ ok: true, aviso: 'Supabase não configurado — alterações não persistidas' })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()

    // Upsert: se existe, atualiza; se não, cria
    const { data: existe } = await db.from('configuracoes_home').select('id').limit(1).maybeSingle()
    if (existe) {
      await db.from('configuracoes_home').update({ config, atualizado_em: new Date().toISOString() }).eq('id', existe.id)
    } else {
      await db.from('configuracoes_home').insert({ config })
    }
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || 'Erro ao salvar' }, { status: 500 })
  }
}
