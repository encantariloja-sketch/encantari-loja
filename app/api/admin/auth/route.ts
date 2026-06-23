import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

// Rate limiting simples em memória (por instância serverless)
// Protege contra força bruta — 5 tentativas por IP a cada 15 minutos
const tentativas = new Map<string, { count: number; resetAt: number }>()

function checarRateLimit(ip: string): boolean {
  const agora = Date.now()
  const limite = tentativas.get(ip)

  if (limite) {
    if (agora < limite.resetAt) {
      if (limite.count >= 5) return false
      limite.count++
    } else {
      tentativas.set(ip, { count: 1, resetAt: agora + 15 * 60 * 1000 })
    }
  } else {
    tentativas.set(ip, { count: 1, resetAt: agora + 15 * 60 * 1000 })
  }
  return true
}

function resetarTentativas(ip: string) {
  tentativas.delete(ip)
}

export async function POST(req: Request) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'

  if (!checarRateLimit(ip)) {
    return NextResponse.json(
      { erro: 'Muitas tentativas. Aguarde 15 minutos.' },
      { status: 429 }
    )
  }

  const { senha } = await req.json()
  const senhaCorreta = process.env.ADMIN_PASSWORD

  if (!senhaCorreta) {
    console.error('[AUTH] ADMIN_PASSWORD não configurado!')
    return NextResponse.json({ erro: 'Servidor não configurado' }, { status: 503 })
  }

  if (senha !== senhaCorreta) {
    return NextResponse.json({ erro: 'Senha incorreta' }, { status: 401 })
  }

  resetarTentativas(ip)

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin-key', senhaCorreta, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 60 * 60 * 8, // 8 horas
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin-key', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 0,
    path: '/',
  })
  return response
}

export async function GET() {
  const adminKey = cookies().get('admin-key')?.value
  const validKey = process.env.ADMIN_PASSWORD
  if (!validKey || adminKey !== validKey) {
    return NextResponse.json({ autenticado: false }, { status: 401 })
  }
  return NextResponse.json({ autenticado: true })
}
