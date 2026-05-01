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
      return NextResponse.json({ pedidos: [] })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data, error } = await db
      .from('pedidos')
      .select('id, status, total, criado_em, frete_nome, frete_preco, comprador, itens, mp_payment_id')
      .order('criado_em', { ascending: false })
    if (error) throw error
    return NextResponse.json({ pedidos: data || [] })
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || String(err) }, { status: 500 })
  }
}

export async function PATCH(req: Request) {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { id, status } = await req.json()
  try {
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { error } = await db
      .from('pedidos')
      .update({ status, atualizado_em: new Date().toISOString() })
      .eq('id', id)
    if (error) throw error
    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || String(err) }, { status: 500 })
  }
}
