import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function isAuthorized() {
  const key = cookies().get('admin-key')?.value
  return key === (process.env.ADMIN_PASSWORD || 'encantari2024')
}

export async function GET(req: Request) {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const { produtos } = await import('@/data/produtos')
      return NextResponse.json({ produtos })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data, error } = await db.from('produtos').select('*').order('criado_em', { ascending: false })
    if (error) throw error
    return NextResponse.json({ produtos: data })
  } catch {
    const { produtos } = await import('@/data/produtos')
    return NextResponse.json({ produtos })
  }
}

export async function POST(req: Request) {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true, aviso: 'Supabase não configurado' })
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data, error } = await db.from('produtos').insert([body]).select().single()
    if (error) throw error
    return NextResponse.json({ produto: data }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  const { id, ...updates } = await req.json()
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true, aviso: 'Supabase não configurado' })
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { error } = await db.from('produtos').update({ ...updates, atualizado_em: new Date().toISOString() }).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ erro: 'ID obrigatório' }, { status: 400 })
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true, aviso: 'Supabase não configurado' })
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { error } = await db.from('produtos').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}
