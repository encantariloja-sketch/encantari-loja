import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { enviarEmail, emailPedidoEnviado, emailPedidoProntoRetirada } from '@/lib/email'

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

  const { id, status, rastreio, retirada } = await req.json()

  if (status === 'enviado' && !rastreio && !retirada) {
    return NextResponse.json({ erro: 'Informe o código de rastreamento ou marque como retirada.' }, { status: 400 })
  }

  try {
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()

    const update: Record<string, any> = { status, atualizado_em: new Date().toISOString() }
    if (rastreio) update.rastreio = rastreio
    if (retirada) update.retirada = true

    const { error } = await db.from('pedidos').update(update).eq('id', id)
    if (error) throw error

    // Busca dados do pedido para enviar email
    if (status === 'enviado') {
      const { data: pedido } = await db
        .from('pedidos')
        .select('comprador, mp_payment_id, frete_nome')
        .eq('id', id)
        .single()

      const email = pedido?.comprador?.email
      const nome = pedido?.comprador?.nome || 'cliente'
      const paymentId = pedido?.mp_payment_id || id

      if (email) {
        const resultado = retirada
          ? await enviarEmail({
              to: email,
              subject: 'Seu pedido está pronto para retirada — Encantari 🎀',
              html: emailPedidoProntoRetirada({ nome, paymentId }),
            })
          : await enviarEmail({
              to: email,
              subject: 'Seu pedido foi enviado — Encantari 📦',
              html: emailPedidoEnviado({ nome, paymentId, rastreio, transportadora: pedido?.frete_nome || undefined }),
            })

        return NextResponse.json({ ok: true, email_enviado: resultado.ok, email_destino: email, email_erro: resultado.erro })
      }

      return NextResponse.json({ ok: true, email_enviado: false, email_erro: 'Email do cliente não encontrado no pedido' })
    }

    return NextResponse.json({ ok: true })
  } catch (err: any) {
    return NextResponse.json({ erro: err?.message || String(err) }, { status: 500 })
  }
}
