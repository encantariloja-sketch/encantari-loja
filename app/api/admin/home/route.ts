import { NextResponse } from 'next/server'
import { defaultConfig } from '@/lib/homeConfig'

function isAuthorized(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const key = cookie.match(/admin-key=([^;]+)/)?.[1]
  return key === (process.env.ADMIN_PASSWORD || 'encantari2024')
}

export async function GET(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

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
  if (!isAuthorized(req)) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

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
  } catch (err) {
    return NextResponse.json({ erro: 'Erro ao salvar' }, { status: 500 })
  }
}
