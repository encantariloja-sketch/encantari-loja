import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'

export async function POST(req: Request) {
  const adminKey = cookies().get('admin-key')?.value
  if (adminKey !== (process.env.ADMIN_PASSWORD || 'encantari2024')) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ erro: 'Arquivo não enviado' }, { status: 400 })

  const ext = file.name.split('.').pop() || 'jpg'
  const prefix = (formData.get('prefix') as string) || 'produtos'
  const nome = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`

  const db = createServiceClient()
  const buffer = Buffer.from(await file.arrayBuffer())

  const { error } = await db.storage
    .from('product-images')
    .upload(nome, buffer, { contentType: file.type, upsert: false })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

  const { data } = db.storage.from('product-images').getPublicUrl(nome)
  return NextResponse.json({ url: data.publicUrl })
}
