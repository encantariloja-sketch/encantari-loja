import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const { codigo, email, subtotal } = await req.json()

  if (!codigo) return NextResponse.json({ valido: false, erro: 'Código não informado' })

  const db = createServiceClient()
  const { data: cupom, error } = await db
    .from('cupons')
    .select('*')
    .eq('codigo', (codigo as string).toUpperCase().trim())
    .eq('ativo', true)
    .single()

  // Mensagem genérica para todos os erros de validade — evita enumeração
  const INVALIDO = { valido: false, erro: 'Cupom inválido ou expirado' }

  if (error || !cupom) return NextResponse.json(INVALIDO)

  // Verifica expiração
  if (cupom.data_expiracao && new Date(cupom.data_expiracao) < new Date()) {
    return NextResponse.json(INVALIDO)
  }

  // Verifica limite de usos
  if (cupom.tipo_limite === 'primeiros_usos' && cupom.max_usos !== null) {
    if (cupom.usos_atuais >= cupom.max_usos) {
      return NextResponse.json(INVALIDO)
    }
  }

  if (cupom.tipo_limite === 'uso_unico') {
    if (cupom.usos_atuais >= 1) {
      return NextResponse.json(INVALIDO)
    }
  }

  // Verifica por cliente
  if (cupom.tipo_limite === 'por_cliente' && email) {
    const clientesUsados: string[] = cupom.clientes_usados || []
    if (clientesUsados.includes(email.toLowerCase())) {
      return NextResponse.json({ valido: false, erro: 'Você já utilizou este cupom' })
    }
  }

  // Verifica valor mínimo
  const sub = Number(subtotal) || 0
  if (cupom.valor_minimo > 0 && sub < cupom.valor_minimo) {
    const minFmt = (cupom.valor_minimo as number).toFixed(2).replace('.', ',')
    return NextResponse.json({
      valido: false,
      erro: `Valor mínimo para este cupom: R$ ${minFmt}`,
    })
  }

  // Calcula desconto
  let desconto_calculado = 0
  if (cupom.tipo_desconto === 'percentual') {
    desconto_calculado = Math.round(sub * (cupom.valor / 100) * 100) / 100
  } else if (cupom.tipo_desconto === 'valor_fixo') {
    desconto_calculado = Math.min(Number(cupom.valor), sub)
  }
  // frete_gratis: desconto_calculado fica 0 (o frete é zerado no checkout)

  return NextResponse.json({
    valido: true,
    codigo: cupom.codigo,
    descricao: cupom.descricao,
    tipo_desconto: cupom.tipo_desconto,
    valor: cupom.valor,
    desconto_calculado,
  })
}
