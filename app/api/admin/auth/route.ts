import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { senha } = await req.json()
  const senhaCorreta = process.env.ADMIN_PASSWORD || 'encantari2024'

  if (senha !== senhaCorreta) {
    return NextResponse.json({ erro: 'Senha incorreta' }, { status: 401 })
  }

  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin-key', senhaCorreta, {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 dias
    path: '/',
  })
  return response
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set('admin-key', '', {
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return response
}

export async function GET() {
  const adminKey = cookies().get('admin-key')?.value
  const validKey = process.env.ADMIN_PASSWORD || 'encantari2024'
  if (adminKey !== validKey) {
    return NextResponse.json({ autenticado: false }, { status: 401 })
  }
  return NextResponse.json({ autenticado: true })
}
