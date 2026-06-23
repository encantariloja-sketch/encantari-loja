import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'
import { enviarEmail, emailConfirmacaoPedido } from '@/lib/email'
import crypto from 'crypto'

export const maxDuration = 30

function verificarAssinaturaMP(req: Request, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  if (!secret) return true // sem secret configurado, aceita (retrocompatível)

  const xSignature = req.headers.get('x-signature') || ''
  const xRequestId = req.headers.get('x-request-id') || ''

  // Extrai ts e v1 do header x-signature
  const partes: Record<string, string> = {}
  xSignature.split(',').forEach(part => {
    const [k, v] = part.trim().split('=')
    if (k && v) partes[k] = v
  })

  const ts = partes['ts']
  const v1 = partes['v1']
  if (!ts || !v1) return false

  // Extrai o data.id do body ou query
  const url = new URL(req.url)
  const dataId = url.searchParams.get('data.id') || url.searchParams.get('id') || ''

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`
  const hash = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(v1))
}

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

    // Registra uso do cupom se houver
    if (meta.cupom?.codigo) {
      try {
        const { data: cupomAtual } = await db
          .from('cupons')
          .select('usos_atuais, tipo_limite, clientes_usados')
          .eq('codigo', meta.cupom.codigo)
          .single()
        if (cupomAtual) {
          const updates: Record<string, unknown> = { usos_atuais: (cupomAtual.usos_atuais || 0) + 1 }
          if (cupomAtual.tipo_limite === 'por_cliente' && meta.dados?.email) {
            updates.clientes_usados = [...(cupomAtual.clientes_usados || []), meta.dados.email.toLowerCase()]
          }
          await db.from('cupons').update(updates).eq('codigo', meta.cupom.codigo)
        }
      } catch (e) {
        console.error('Webhook: erro ao registrar uso do cupom', e)
      }
    }
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
  try {
    const rawBody = await req.text()

    // Verificar assinatura HMAC se MP_WEBHOOK_SECRET estiver configurado
    if (!verificarAssinaturaMP(req, rawBody)) {
      console.error('[WEBHOOK] Assinatura inválida — possível spoofing')
      return NextResponse.json({ ok: false }, { status: 401 })
    }

    // Recriar body para parsear JSON
    let body: any = {}
    try { body = JSON.parse(rawBody) } catch {}

    const url = new URL(req.url)

    // Formato IPN: query params ?topic=payment&id=...
    const topic = url.searchParams.get('topic')
    const idParam = url.searchParams.get('id')
    if (topic === 'payment' && idParam) {
      await salvarPedido(idParam)
      return NextResponse.json({ ok: true })
    }

    // Formato Webhooks: JSON body { type, data: { id } }

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
