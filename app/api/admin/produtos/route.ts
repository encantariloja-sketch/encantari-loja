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
    const { data, error } = await db.from('produtos').select('*').order('nome', { ascending: true })
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

    // Tenta o slug base; se já existir, adiciona sufixo -2, -3, ...
    const slugBase: string = body.slug || 'produto'
    let data: any = null
    let error: any = null
    for (let i = 0; i <= 20; i++) {
      const slug = i === 0 ? slugBase : `${slugBase}-${i + 1}`
      const res = await db.from('produtos').insert([{ ...body, slug }]).select().single()
      data = res.data
      error = res.error
      if (!error || !String(error.message).includes('produtos_slug_key')) break
    }
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
    const { data, error } = await db
      .from('produtos')
      .update(updates)
      .eq('id', id)
      .select('id, variacoes, subcategoria')
      .single()
    if (error) throw error
    if (!data) throw new Error('Produto não encontrado ou sem permissão para atualizar.')
    return NextResponse.json({ ok: true, produto: data })
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
