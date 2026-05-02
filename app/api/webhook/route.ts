import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

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

  // Email de confirmação via Resend
  const resendKey = process.env.RESEND_API_KEY
  if (resendKey && meta.dados?.email) {
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: process.env.EMAIL_FROM || 'Encantari <encantari.loja@gmail.com>',
        to: [meta.dados.email],
        subject: `Pedido confirmado — Encantari ✨`,
        html: `
          <div style="font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:32px;background:#FEF4F3;border-radius:16px">
            <h1 style="color:#491E2F;font-size:28px;margin-bottom:8px">encantari</h1>
            <p style="color:#491E2F;font-size:16px">Obrigada pela sua compra, ${meta.dados.nome?.split(' ')[0] || ''}! ✨</p>
            <p style="color:#8a6a6a;font-size:14px">Seu pedido #${payment.id} foi aprovado e em breve entraremos em contato com o rastreamento.</p>
            <div style="background:white;border-radius:12px;padding:20px;margin:20px 0">
              <p style="color:#491E2F;font-weight:bold;margin-bottom:12px">Resumo do pedido:</p>
              ${(payment.additional_info?.items || []).map((i: any) =>
                `<p style="color:#666;font-size:14px;margin:4px 0">${i.title} × ${i.quantity} — R$ ${(parseFloat(i.unit_price) * parseInt(i.quantity)).toFixed(2).replace('.', ',')}</p>`
              ).join('')}
              <p style="color:#491E2F;font-weight:bold;margin-top:12px">Total: R$ ${payment.transaction_amount?.toFixed(2).replace('.', ',')}</p>
            </div>
            <p style="color:#8a6a6a;font-size:13px">Dúvidas? <a href="mailto:encantari.loja@gmail.com" style="color:#EF9493">encantari.loja@gmail.com</a></p>
          </div>
        `,
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
