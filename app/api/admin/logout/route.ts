import { NextResponse } from 'next/server'

export async function POST() {
  const res = NextResponse.redirect(new URL('/admin/login', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3002'))
  res.cookies.delete('admin-key')
  return res
}
