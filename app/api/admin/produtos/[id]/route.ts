import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

function isAuthorized() {
  const key = cookies().get('admin-key')?.value
  return key === (process.env.ADMIN_PASSWORD || 'encantari2024')
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  if (!isAuthorized()) return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  try {
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data, error } = await db.from('produtos').select('*').eq('id', params.id).single()
    if (error) throw error
    return NextResponse.json({ produto: data })
  } catch (err: any) {
    return NextResponse.json({ erro: err.message }, { status: 404 })
  }
}
