import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { payment_id } = await req.json()
    if (!payment_id) return NextResponse.json({ ok: false })

    const token = process.env.MP_ACCESS_TOKEN
    if (!token) return NextResponse.json({ ok: false })

    const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${payment_id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
    if (!paymentRes.ok) return NextResponse.json({ ok: false })
    const payment = await paymentRes.json()

    if (payment.status !== 'approved') return NextResponse.json({ ok: false })

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) return NextResponse.json({ ok: false })

    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const meta = payment.metadata || {}

    // Verifica se o pedido já foi salvo pelo webhook
    const { data: existente } = await db
      .from('pedidos')
      .select('id')
      .eq('mp_payment_id', String(payment.id))
      .maybeSingle()

    if (existente) return NextResponse.json({ ok: true, ja_existia: true })

    await db.from('pedidos').insert({
      mp_payment_id: String(payment.id),
      mp_preference_id: payment.preference_id,
      status: 'pago',
      itens: payment.additional_info?.items || [],
      comprador: meta.dados || {},
      frete_nome: meta.frete?.nome || '',
      frete_preco: meta.frete?.preco || 0,
      total: payment.transaction_amount,
      atualizado_em: new Date().toISOString(),
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Confirmar pedido error:', err)
    return NextResponse.json({ ok: false })
  }
}
