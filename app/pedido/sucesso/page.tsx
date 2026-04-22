import Link from 'next/link'
import { CheckCircle, Heart } from 'lucide-react'

export default function PedidoSucessoPage() {
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
