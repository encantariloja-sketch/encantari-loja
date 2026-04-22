import { NextResponse } from 'next/server'
import { categorias as defaultCategorias } from '@/data/produtos'

function isAuthorized(req: Request) {
  const cookie = req.headers.get('cookie') || ''
  const key = cookie.match(/admin-key=([^;]+)/)?.[1]
  return key === (process.env.ADMIN_PASSWORD || 'encantari2024')
}

export async function GET() {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ categorias: defaultCategorias })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data } = await db.from('categorias').select('*').order('ordem')
    return NextResponse.json({ categorias: data?.length ? data : defaultCategorias })
  } catch {
    return NextResponse.json({ categorias: defaultCategorias })
  }
}

export async function POST(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  const body = await req.json()
  if (!body.id || !body.nome) return NextResponse.json({ erro: 'id e nome obrigatórios' }, { status: 400 })

  // gera id a partir do nome se não informado
  if (!body.id) {
    body.id = body.nome.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true, aviso: 'Supabase não configurado' })
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { error } = await db.from('categorias').insert(body)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  const { id, ...updates } = await req.json()
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true, aviso: 'Supabase não configurado' })
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { error } = await db.from('categorias').update(updates).eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  if (!isAuthorized(req)) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ erro: 'ID obrigatório' }, { status: 400 })
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: true, aviso: 'Supabase não configurado' })
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { error } = await db.from('categorias').delete().eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 500 })
  }
}
