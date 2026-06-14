'use client'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export default function PageTracker() {
  const pathname = usePathname()

  useEffect(() => {
    if (pathname?.startsWith('/admin')) return

    // Data de hoje no horário de Brasília (UTC-3)
    const brasilMs = Date.now() - 3 * 60 * 60 * 1000
    const brasilDate = new Date(brasilMs).toISOString().split('T')[0]
    const key = `enc_v_${brasilDate}`

    if (localStorage.getItem(key)) return

    // Marca imediatamente para evitar duplo envio em navegação rápida
    localStorage.setItem(key, '1')

    fetch('/api/visita', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pagina: pathname }),
    }).catch(() => {
      // Se falhar, remove a marca para tentar novamente
      localStorage.removeItem(key)
    })
  }, []) // roda só na primeira montagem, não a cada troca de página

  return null
}
