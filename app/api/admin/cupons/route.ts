import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'

function checkAdmin() {
  const key = cookies().get('admin-key')?.value
  return key === (process.env.ADMIN_PASSWORD || 'encantari2024')
}

export async function GET() {
  if (!checkAdmin()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('cupons')
    .select('*')
    .order('criado_em', { ascending: false })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ cupons: data })
}

export async function POST(req: Request) {
  if (!checkAdmin()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const db = createServiceClient()

  const { data, error } = await db
    .from('cupons')
    .insert([{
      codigo: (body.codigo as string)?.toUpperCase().trim(),
      descricao: body.descricao || null,
      tipo_limite: body.tipo_limite,
      max_usos: body.max_usos ? Number(body.max_usos) : null,
      data_expiracao: body.data_expiracao || null,
      tipo_desconto: body.tipo_desconto,
      valor: body.valor != null ? Number(body.valor) : null,
      valor_minimo: body.valor_minimo ? Number(body.valor_minimo) : 0,
      ativo: true,
      clientes_usados: [],
    }])
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ cupom: data })
}

export async function PATCH(req: Request) {
  if (!checkAdmin()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const body = await req.json()
  const { id, ...updates } = body
  if (!id) return NextResponse.json({ erro: 'ID não fornecido' }, { status: 400 })

  const db = createServiceClient()
  const { data, error } = await db
    .from('cupons')
    .update(updates)
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ cupom: data })
}

export async function DELETE(req: Request) {
  if (!checkAdmin()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ erro: 'ID não fornecido' }, { status: 400 })

  const db = createServiceClient()
  const { error } = await db.from('cupons').delete().eq('id', id)
  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
