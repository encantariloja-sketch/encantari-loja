'use client'
import { useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Heart } from 'lucide-react'
import { Suspense } from 'react'

function SucessoContent() {
  const searchParams = useSearchParams()
  const paymentId = searchParams.get('payment_id') || searchParams.get('collection_id')
  const status = searchParams.get('status') || searchParams.get('collection_status')

  useEffect(() => {
    if (paymentId && status === 'approved') {
      // Backup: garante que o pedido seja salvo mesmo se o webhook falhou
      fetch('/api/pedido/confirmar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ payment_id: paymentId }),
      }).catch(() => {})
    }
  }, [paymentId, status])

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <CheckCircle size={64} className="mx-auto text-oliva mb-6" />
        <h1 className="heading text-3xl mb-3">Pedido confirmado!</h1>
        <p className="text-vinho/70 leading-relaxed mb-8">
          Obrigada pela sua compra! Você receberá um email de confirmação em breve.
          Embalamos cada pedido com muito carinho. <Heart size={16} className="inline text-rosa" />
        </p>
        <Link href="/produtos" className="btn-primary">
          Continuar comprando
        </Link>
      </div>
    </div>
  )
}

export default function PedidoSucessoPage() {
  return (
    <Suspense fallback={null}>
      <SucessoContent />
    </Suspense>
  )
}
