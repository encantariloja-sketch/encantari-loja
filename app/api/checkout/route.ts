import { NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

type CupomAplicado = {
  codigo: string
  tipo_desconto: 'percentual' | 'valor_fixo' | 'frete_gratis'
  valor: number | null
  desconto_calculado: number
}

function aplicarDescontoNosItens(items: any[], cupom: CupomAplicado) {
  if (cupom.tipo_desconto === 'frete_gratis') {
    return items.filter(i => i.id !== 'frete')
  }

  const desconto = cupom.desconto_calculado
  if (desconto <= 0) return items

  const itensNaoFrete = items.filter(i => i.id !== 'frete')
  const subtotal = itensNaoFrete.reduce((s, i) => s + i.unit_price * i.quantity, 0)

  // Distribui desconto proporcionalmente, ajusta o último para evitar diferença de centavos
  let restante = desconto
  const descontosMap = new Map<number, number>()
  itensNaoFrete.forEach((item, idx) => {
    if (idx === itensNaoFrete.length - 1) {
      descontosMap.set(idx, restante)
    } else {
      const proporcao = (item.unit_price * item.quantity) / subtotal
      const d = Math.round(proporcao * desconto * 100) / 100
      descontosMap.set(idx, d)
      restante -= d
    }
  })

  let nfIdx = 0
  return items.map(item => {
    if (item.id === 'frete') return item
    const d = descontosMap.get(nfIdx++) || 0
    const novoTotal = Math.max(0.01 * item.quantity, item.unit_price * item.quantity - d)
    const novoUnitPrice = Math.max(0.01, Math.round(novoTotal / item.quantity * 100) / 100)
    return { ...item, unit_price: novoUnitPrice }
  })
}

export async function POST(req: Request) {
  const { itens, dados, frete, cupom } = await req.json() as {
    itens: any[]
    dados: any
    frete: any
    cupom?: CupomAplicado | null
  }

  const token = process.env.MP_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ erro: 'Mercado Pago não configurado' }, { status: 500 })
  }

  const client = new MercadoPagoConfig({ accessToken: token })
  const preference = new Preference(client)

  let items: any[] = itens.map((i: any) => ({
    id: i.produto.id,
    title: i.produto.nome,
    quantity: i.quantidade,
    unit_price: i.produto.preco,
    currency_id: 'BRL',
  }))

  if (frete?.preco > 0) {
    items.push({
      id: 'frete',
      title: `Frete — ${frete.nome}`,
      quantity: 1,
      unit_price: frete.preco,
      currency_id: 'BRL',
    })
  }

  // Aplica desconto do cupom nos itens antes de enviar ao MP
  if (cupom) {
    items = aplicarDescontoNosItens(items, cupom)
  }

  const host = req.headers.get('host') || 'localhost:3002'
  const proto = req.headers.get('x-forwarded-proto') || 'https'
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`
  const sandbox = process.env.MP_SANDBOX === 'true'

  try {
    const result = await preference.create({
      body: {
        items,
        payer: {
          name: dados.nome,
          email: dados.email,
          identification: { type: 'CPF', number: dados.cpf?.replace(/\D/g, '') },
          phone: { number: dados.telefone?.replace(/\D/g, '') },
          address: {
            zip_code: dados.cep?.replace(/\D/g, ''),
            street_name: dados.rua,
            street_number: dados.numero,
          },
        },
        shipments: {
          receiver_address: {
            zip_code: dados.cep?.replace(/\D/g, ''),
            street_name: dados.rua,
            street_number: dados.numero,
            apartment: dados.complemento,
          },
        },
        payment_methods: {
          installments: 12,
        },
        back_urls: {
          success: `${siteUrl}/pedido/sucesso`,
          failure: `${siteUrl}/pedido/erro`,
          pending: `${siteUrl}/pedido/pendente`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/webhook`,
        metadata: { dados, frete, cupom: cupom || null },
      },
    })

    const url = sandbox ? result.sandbox_init_point : result.init_point
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Erro MP:', err)
    return NextResponse.json({ erro: 'Erro ao criar preferência de pagamento' }, { status: 500 })
  }
}
