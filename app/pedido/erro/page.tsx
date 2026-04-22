import Link from 'next/link'
import { XCircle } from 'lucide-react'

export default function PedidoErroPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <XCircle size={64} className="mx-auto text-red-400 mb-6" />
        <h1 className="heading text-3xl mb-3">Pagamento não realizado</h1>
        <p className="text-vinho/70 mb-8">
          Ocorreu um problema com o pagamento. Seus itens ainda estão no carrinho.
        </p>
        <div className="flex gap-3 justify-center">
          <Link href="/carrinho" className="btn-primary">Voltar ao carrinho</Link>
          <Link href="/produtos" className="btn-secondary">Ver produtos</Link>
        </div>
      </div>
    </div>
  )
}
