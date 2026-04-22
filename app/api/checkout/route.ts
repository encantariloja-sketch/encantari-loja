import { NextResponse } from 'next/server'
import MercadoPagoConfig, { Preference } from 'mercadopago'

export async function POST(req: Request) {
  const { itens, dados, frete } = await req.json()

  const token = process.env.MP_ACCESS_TOKEN
  if (!token) {
    return NextResponse.json({ erro: 'Mercado Pago não configurado' }, { status: 500 })
  }

  const client = new MercadoPagoConfig({ accessToken: token })
  const preference = new Preference(client)

  const items = itens.map((i: any) => ({
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

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'
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
        back_urls: {
          success: `${siteUrl}/pedido/sucesso`,
          failure: `${siteUrl}/pedido/erro`,
          pending: `${siteUrl}/pedido/pendente`,
        },
        auto_return: 'approved',
        notification_url: `${siteUrl}/api/webhook`,
        metadata: { dados, frete },
      },
    })

    const url = sandbox ? result.sandbox_init_point : result.init_point
    return NextResponse.json({ url })
  } catch (err: any) {
    console.error('Erro MP:', err)
    return NextResponse.json({ erro: 'Erro ao criar preferência de pagamento' }, { status: 500 })
  }
}
