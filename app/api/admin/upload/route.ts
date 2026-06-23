import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServiceClient } from '@/lib/supabase'

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const EXTENSOES_PERMITIDAS = ['jpg', 'jpeg', 'png', 'webp', 'gif']
const TAMANHO_MAXIMO = 8 * 1024 * 1024 // 8 MB

export async function POST(req: Request) {
  const adminKey = cookies().get('admin-key')?.value
  const validKey = process.env.ADMIN_PASSWORD
  if (!validKey || adminKey !== validKey) {
    return NextResponse.json({ erro: 'Não autorizado' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file') as File | null
  if (!file) return NextResponse.json({ erro: 'Arquivo não enviado' }, { status: 400 })

  // Validar tamanho
  if (file.size > TAMANHO_MAXIMO) {
    return NextResponse.json({ erro: 'Arquivo muito grande. Máximo: 8 MB' }, { status: 400 })
  }

  // Validar Content-Type declarado
  if (!TIPOS_PERMITIDOS.includes(file.type)) {
    return NextResponse.json({ erro: 'Tipo de arquivo não permitido. Use JPG, PNG, WebP ou GIF.' }, { status: 400 })
  }

  // Validar extensão (independente do Content-Type declarado)
  const partes = file.name.split('.')
  const ext = partes.pop()?.toLowerCase() || ''
  if (!EXTENSOES_PERMITIDAS.includes(ext)) {
    return NextResponse.json({ erro: 'Extensão não permitida.' }, { status: 400 })
  }

  // Validar magic bytes (primeiros bytes do arquivo para confirmar tipo real)
  const buffer = Buffer.from(await file.arrayBuffer())
  const tipoReal = detectarTipo(buffer)
  if (!tipoReal) {
    return NextResponse.json({ erro: 'Conteúdo do arquivo não é uma imagem válida.' }, { status: 400 })
  }

  const prefix = (formData.get('prefix') as string) || 'produtos'
  // Nome aleatório — não usa o nome original do arquivo
  const nome = `${prefix}/${Date.now()}-${Math.random().toString(36).slice(2)}.${tipoReal.ext}`

  const db = createServiceClient()
  const { error } = await db.storage
    .from('product-images')
    .upload(nome, buffer, { contentType: tipoReal.mime, upsert: false })

  if (error) return NextResponse.json({ erro: error.message }, { status: 500 })

  const { data } = db.storage.from('product-images').getPublicUrl(nome)
  return NextResponse.json({ url: data.publicUrl })
}

function detectarTipo(buf: Buffer): { mime: string; ext: string } | null {
  // JPEG: FF D8 FF
  if (buf[0] === 0xFF && buf[1] === 0xD8 && buf[2] === 0xFF) {
    return { mime: 'image/jpeg', ext: 'jpg' }
  }
  // PNG: 89 50 4E 47
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4E && buf[3] === 0x47) {
    return { mime: 'image/png', ext: 'png' }
  }
  // GIF: 47 49 46 38
  if (buf[0] === 0x47 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x38) {
    return { mime: 'image/gif', ext: 'gif' }
  }
  // WebP: 52 49 46 46 ... 57 45 42 50
  if (buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 &&
      buf[8] === 0x57 && buf[9] === 0x45 && buf[10] === 0x42 && buf[11] === 0x50) {
    return { mime: 'image/webp', ext: 'webp' }
  }
  return null
}
