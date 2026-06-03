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

  // Calcula início do dia no horário de Brasília (UTC-3)
  const now = new Date()
  const brasilMs = now.getTime() - 3 * 60 * 60 * 1000
  const brasilDate = new Date(brasilMs).toISOString().split('T')[0]
  // Meia-noite em Brasília = 03:00 UTC
  const todayStart = new Date(brasilDate + 'T03:00:00.000Z')
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

  const [hoje, semana, mes, pedidos] = await Promise.all([
    db.from('visitas').select('*', { count: 'exact', head: true }).gte('created_at', todayStart.toISOString()),
    db.from('visitas').select('*', { count: 'exact', head: true }).gte('created_at', weekStart.toISOString()),
    db.from('visitas').select('*', { count: 'exact', head: true }).gte('created_at', monthStart.toISOString()),
    db.from('pedidos').select('comprador'),
  ])

  const clientesUnicos = new Set(
    (pedidos.data || [])
      .map((p: any) => p.comprador?.email)
      .filter(Boolean)
  ).size

  return NextResponse.json({
    visitas: {
      hoje: hoje.count ?? 0,
      semana: semana.count ?? 0,
      mes: mes.count ?? 0,
    },
    clientes: clientesUnicos,
  })
}
