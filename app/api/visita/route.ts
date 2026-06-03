import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  let pagina = '/'
  try {
    const body = await req.json()
    pagina = body.pagina || '/'
  } catch {}

  const db = createServiceClient()
  await db.from('visitas').insert([{ pagina }])
  return NextResponse.json({ ok: true })
}
