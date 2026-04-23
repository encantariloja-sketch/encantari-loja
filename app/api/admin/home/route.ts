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
      return NextResponse.json({ config: null })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data, error } = await db
      .from('configuracoes_home')
      .select('config')
      .order('atualizado_em', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()
    if (error) throw error
    // Return raw saved config — client merges with defaultConfig via mergeConfig()
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

    // Always get the most recent row (ORDER BY prevents non-deterministic LIMIT 1)
    const { data: existe, error: errSel } = await db
      .from('configuracoes_home')
      .select('id')
      .order('atualizado_em', { ascending: false, nullsFirst: false })
      .limit(1)
      .maybeSingle()

    if (errSel) throw errSel

    let savedId: string

    if (existe) {
      const { error } = await db
        .from('configuracoes_home')
        .update({ config, atualizado_em: new Date().toISOString() })
        .eq('id', existe.id)
      if (error) throw error
      savedId = existe.id
    } else {
      const { data: inserted, error } = await db
        .from('configuracoes_home')
        .insert({ config, atualizado_em: new Date().toISOString() })
        .select('id')
        .single()
      if (error) throw error
      savedId = inserted.id
    }

    // Remove duplicate rows — this is a singleton config table
    await db.from('configuracoes_home').delete().neq('id', savedId)

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || String(err) }, { status: 500 })
  }
}
