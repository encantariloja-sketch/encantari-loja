import { Package, Search } from 'lucide-react'

export const metadata = { title: 'Rastrear Pedido — Encantari' }

export default function RastrearPage() {
  return (
    <main className="min-h-screen bg-creme/30 py-16 px-4">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-vinho/10 mb-4">
            <Package size={32} className="text-vinho" />
          </div>
          <h1 className="text-3xl font-bold text-vinho mb-2">Rastrear pedido</h1>
          <p className="text-gray-500">Acompanhe a entrega do seu pedido em tempo real.</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-rosa/20 p-8">
          <p className="text-sm text-gray-600 mb-6 leading-relaxed">
            Após a confirmação do pagamento, você receberá o código de rastreamento por e-mail.
            Use-o abaixo ou acesse diretamente o site dos Correios ou transportadora.
          </p>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de rastreamento
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: BR123456789BR"
                  className="flex-1 border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-vinho/30"
                />
                <a
                  href="https://rastreamento.correios.com.br"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-vinho text-white px-4 py-2.5 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-vinho/90 transition-colors"
                >
                  <Search size={16} /> Rastrear
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Links úteis</h2>
            <div className="space-y-2">
              <a href="https://rastreamento.correios.com.br" target="_blank" rel="noopener noreferrer"
                className="block text-sm text-vinho hover:underline">
                → Rastreamento Correios
              </a>
              <a href="https://www.melhorenvio.com.br/rastreamento" target="_blank" rel="noopener noreferrer"
                className="block text-sm text-vinho hover:underline">
                → Rastreamento Melhor Envio
              </a>
            </div>
          </div>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">
          Dúvidas?{' '}
          <a href="/contato" className="text-vinho hover:underline">Entre em contato conosco</a>
        </p>
      </div>
    </main>
  )
}
