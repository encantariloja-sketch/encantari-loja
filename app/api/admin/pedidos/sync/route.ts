import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function isAuthorized() {
  const key = cookies().get('admin-key')?.value
  return key === (process.env.ADMIN_PASSWORD || 'encantari2024')
}

export async function POST() {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const token = process.env.MP_ACCESS_TOKEN
  if (!token) return NextResponse.json({ erro: 'MP_ACCESS_TOKEN não configurado' }, { status: 500 })
  if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ erro: 'Supabase não configurado' }, { status: 500 })

  try {
    // Busca até 100 pagamentos aprovados no MP
    const mpRes = await fetch(
      'https://api.mercadopago.com/v1/payments/search?status=approved&limit=100&sort=date_created&criteria=desc',
      { headers: { Authorization: `Bearer ${token}` } }
    )
    if (!mpRes.ok) {
      const txt = await mpRes.text()
      return NextResponse.json({ erro: `MP API ${mpRes.status}: ${txt.slice(0, 200)}` }, { status: 500 })
    }
    const mpData = await mpRes.json()
    const payments: any[] = mpData.results || []

    if (payments.length === 0) return NextResponse.json({ importados: 0, total: 0 })

    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()

    // IDs já existentes no banco
    const ids = payments.map(p => String(p.id))
    const { data: existentes } = await db
      .from('pedidos')
      .select('mp_payment_id')
      .in('mp_payment_id', ids)
    const idsExistentes = new Set((existentes || []).map((e: any) => e.mp_payment_id))

    // Insere só os que estão faltando
    const novos = payments.filter(p => !idsExistentes.has(String(p.id)))

    if (novos.length === 0) return NextResponse.json({ importados: 0, total: payments.length })

    const rows = novos.map(payment => {
      const meta = payment.metadata || {}
      return {
        mp_payment_id: String(payment.id),
        mp_preference_id: payment.preference_id || null,
        status: 'pago',
        itens: payment.additional_info?.items || [],
        comprador: meta.dados || {},
        frete_nome: meta.frete?.nome || '',
        frete_preco: meta.frete?.preco || 0,
        total: payment.transaction_amount,
        atualizado_em: new Date().toISOString(),
      }
    })

    const { error } = await db.from('pedidos').insert(rows)
    if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

    return NextResponse.json({ importados: novos.length, total: payments.length })
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || String(err) }, { status: 500 })
  }
}
