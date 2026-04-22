import { NextResponse } from 'next/server'

type ProdutoFrete = {
  id: string
  quantidade: number
  peso: number
  dimensoes?: { comprimento: number; largura: number; altura: number }
}

export async function POST(req: Request) {
  const { cep_destino, produtos } = await req.json() as {
    cep_destino: string
    produtos: ProdutoFrete[]
  }

  const cepOrigem = (process.env.MELHOR_ENVIO_FROM_CEP || '').replace(/\D/g, '')
  const token = process.env.MELHOR_ENVIO_TOKEN
  const sandbox = process.env.MELHOR_ENVIO_SANDBOX === 'true'
  const baseUrl = sandbox
    ? 'https://sandbox.melhorenvio.com.br'
    : 'https://melhorenvio.com.br'

  if (!token || !cepOrigem) {
    return NextResponse.json({
      opcoes: [{
        id: 'me-placeholder',
        nome: 'Melhor Envio',
        preco: 0,
        prazo: 'Calculado após confirmação',
      }]
    })
  }

  try {
    const pesoTotal = produtos.reduce((acc, p) => acc + p.peso * p.quantidade, 0)
    const dim = produtos[0]?.dimensoes || { comprimento: 20, largura: 15, altura: 10 }

    const body = {
      from: { postal_code: cepOrigem },
      to: { postal_code: cep_destino },
      package: {
        height: dim.altura,
        width: dim.largura,
        length: dim.comprimento,
        weight: Math.max(pesoTotal, 0.1),
      },
      options: {
        receipt: false,
        own_hand: false,
      },
      services: '1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17',
    }

    const res = await fetch(`${baseUrl}/api/v2/me/shipment/calculate`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'User-Agent': 'Encantari Loja (encantari.loja@gmail.com)',
      },
      body: JSON.stringify(body),
    })

    const data = await res.json()

    if (!Array.isArray(data)) {
      throw new Error('Resposta inválida da API')
    }

    const opcoes = data
      .filter((s: any) => !s.error && s.price)
      .map((s: any) => ({
        id: String(s.id),
        nome: `${s.company.name} — ${s.name}`,
        preco: parseFloat(s.price),
        prazo: `${s.delivery_time} dias úteis`,
      }))
      .sort((a: any, b: any) => a.preco - b.preco)
      .slice(0, 5)

    return NextResponse.json({ opcoes })
  } catch (err) {
    console.error('Erro Melhor Envio:', err)
    return NextResponse.json({
      opcoes: [{
        id: 'me-erro',
        nome: 'Frete padrão',
        preco: 0,
        prazo: 'Calculado após confirmação',
      }]
    })
  }
}
