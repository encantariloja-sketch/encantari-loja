import { NextResponse } from 'next/server'

export async function GET(req: Request) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '')
  if (!token) return NextResponse.json({ pedidos: [] })

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ pedidos: [] })
    }

    // Valida o token com a chave anon para obter o email do usuário
    const { createClient } = await import('@supabase/supabase-js')
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const { data: { user }, error } = await anonClient.auth.getUser(token)
    if (error || !user?.email) return NextResponse.json({ pedidos: [] })

    // Busca pedidos pelo email (service role, bypassa RLS)
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data } = await db
      .from('pedidos')
      .select('id, status, total, criado_em, frete_nome, frete_preco, itens, rastreio, retirada, mp_payment_id')
      .filter('comprador->>email', 'eq', user.email)
      .order('criado_em', { ascending: false })

    return NextResponse.json({ pedidos: data || [] })
  } catch {
    return NextResponse.json({ pedidos: [] })
  }
}
