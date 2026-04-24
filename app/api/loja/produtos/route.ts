export const dynamic = 'force-dynamic'
import { NextResponse } from 'next/server'
import { produtos as fallback } from '@/data/produtos'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const slug = searchParams.get('slug')

  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const data = slug ? fallback.filter(p => p.slug === slug) : fallback
      return NextResponse.json({ produtos: data })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    let query = db.from('produtos').select('*').neq('estoque', 'indisponivel').order('nome')
    if (slug) query = db.from('produtos').select('*').eq('slug', slug).limit(1)
    const { data, error } = await query
    if (error) throw error
    if (data && data.length > 0) return NextResponse.json({ produtos: data })
    return NextResponse.json({ produtos: [] })
  } catch {
    const data = slug ? fallback.filter(p => p.slug === slug) : fallback
    return NextResponse.json({ produtos: data })
  }
}
