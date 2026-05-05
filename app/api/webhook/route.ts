import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { enviarEmail, emailConfirmacaoPedido } from '@/lib/email'

export const maxDuration = 30

async function salvarPedido(paymentId: string) {
  const token = process.env.MP_ACCESS_TOKEN
  if (!token) { console.error('Webhook: MP_ACCESS_TOKEN nao configurado'); return }

  const paymentRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!paymentRes.ok) {
    console.error('Webhook: erro ao buscar pagamento', paymentRes.status, await paymentRes.text())
    return
  }
  const payment = await paymentRes.json()
  console.log('Webhook: payment status =', payment.status, 'id =', payment.id)

  if (payment.status !== 'approved') return

  const db = createServiceClient()
  const meta = payment.metadata || {}

  const { error: upsertError } = await db.from('pedidos').upsert({
    mp_payment_id: String(payment.id),
    mp_preference_id: payment.preference_id,
    status: 'pago',
    itens: payment.additional_info?.items || [],
    comprador: meta.dados || {},
    frete_nome: meta.frete?.nome || '',
    frete_preco: meta.frete?.preco || 0,
    total: payment.transaction_amount,
    atualizado_em: new Date().toISOString(),
  }, { onConflict: 'mp_payment_id' })

  if (upsertError) {
    console.error('Webhook: erro ao salvar pedido', upsertError)
  } else {
    console.log('Webhook: pedido salvo com sucesso', payment.id)
  }

  // Email de confirmação de pedido
  if (meta.dados?.email) {
    await enviarEmail({
      to: meta.dados.email,
      subject: 'Pedido confirmado — Encantari ✨',
      html: emailConfirmacaoPedido({
        nome: meta.dados.nome || 'cliente',
        paymentId: String(payment.id),
        itens: payment.additional_info?.items || [],
        total: payment.transaction_amount,
        frete: meta.frete?.nome ? { nome: meta.frete.nome, preco: meta.frete.preco || 0 } : undefined,
      }),
    })
  }
}

// GET: verificação de URL pelo Mercado Pago
export async function GET() {
  return NextResponse.json({ ok: true })
}

export async function POST(req: Request) {
  // Responde imediatamente 200 para o Mercado Pago não retentar
  try {
    const url = new URL(req.url)

    // Formato IPN: query params ?topic=payment&id=...
    const topic = url.searchParams.get('topic')
    const idParam = url.searchParams.get('id')
    if (topic === 'payment' && idParam) {
      await salvarPedido(idParam)
      return NextResponse.json({ ok: true })
    }

    // Formato Webhooks: JSON body { type, data: { id } }
    let body: any = {}
    try { body = await req.json() } catch {}

    if (body.type === 'payment' && body.data?.id) {
      await salvarPedido(String(body.data.id))
      return NextResponse.json({ ok: true })
    }

    // Outros eventos (payment.updated, etc.) — ignorar
    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('Webhook error:', err)
    return NextResponse.json({ ok: true })
  }
}
