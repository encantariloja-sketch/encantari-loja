import { NextResponse } from 'next/server'

type ProdutoFrete = {
  id: string
  quantidade: number
  peso: number
  dimensoes?: { comprimento: number; largura: number; altura: number }
}

const RETIRADA = {
  id: 'retirada',
  nome: 'Retirada na loja — Matinhos/PR',
  preco: 0,
  prazo: 'Combinar pelo WhatsApp',
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
      opcoes: [RETIRADA],
      aviso: 'Frete não configurado. Configure MELHOR_ENVIO_TOKEN e MELHOR_ENVIO_FROM_CEP nas variáveis de ambiente do Vercel.',
    })
  }

  try {
    const pesoTotal = produtos.reduce((acc, p) => acc + p.peso * p.quantidade, 0)
    const dim = produtos[0]?.dimensoes || { comprimento: 20, largura: 15, altura: 10 }

    const body = {
      from: { postal_code: cepOrigem },
      to: { postal_code: cep_destino },
      package: {
        height: Math.max(dim.altura || 10, 1),
        width: Math.max(dim.largura || 15, 1),
        length: Math.max(dim.comprimento || 20, 1),
        weight: Math.max(pesoTotal, 0.1),
      },
      options: {
        receipt: false,
        own_hand: false,
      },
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
      cache: 'no-store',
    })

    if (!res.ok) {
      const txt = await res.text()
      if (res.status === 401) {
        throw new Error('Token inválido. Gere um novo token em melhorenvio.com.br → Gerenciar → Tokens de acesso e atualize MELHOR_ENVIO_TOKEN no Vercel. Certifique-se também de que MELHOR_ENVIO_SANDBOX corresponde ao ambiente do token (true = sandbox, false = produção).')
      }
      throw new Error(`ME API ${res.status}: ${txt.slice(0, 200)}`)
    }

    const data = await res.json()

    if (!Array.isArray(data)) {
      throw new Error(`Resposta inesperada: ${JSON.stringify(data).slice(0, 200)}`)
    }

    const correios = data
      .filter((s: any) => !s.error && s.price && s.company?.id === 1)
      .map((s: any) => ({
        id: String(s.id),
        nome: `${s.company?.name ?? 'Correios'} — ${s.name}`,
        preco: parseFloat(s.price),
        prazo: s.delivery_time ? `${s.delivery_time} dias úteis` : '',
      }))
      .sort((a: any, b: any) => a.preco - b.preco)
      .slice(0, 5)

    return NextResponse.json({ opcoes: [...correios, RETIRADA] })
  } catch (err: any) {
    console.error('Erro Melhor Envio:', err?.message || err)
    return NextResponse.json({
      opcoes: [RETIRADA],
      aviso: `Erro ao calcular frete: ${err?.message || 'Tente novamente.'}`,
    })
  }
}
