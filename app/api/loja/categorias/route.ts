import { NextResponse } from 'next/server'
import { categorias as fallback } from '@/data/produtos'

export async function GET() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ categorias: fallback })
    }
    const { createServiceClient } = await import('@/lib/supabase')
    const db = createServiceClient()
    const { data, error } = await db.from('categorias').select('*').order('ordem')
    if (error) throw error
    return NextResponse.json({ categorias: data?.length ? data : fallback })
  } catch {
    return NextResponse.json({ categorias: fallback })
  }
}
