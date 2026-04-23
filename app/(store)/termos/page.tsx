export const metadata = { title: 'Termos de Uso — Encantari' }

export default function TermosPage() {
  return (
    <main className="min-h-screen bg-creme/30 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-rosa/20 p-8 md:p-12">
          <h1 className="text-3xl font-bold text-vinho mb-2">Termos de Uso</h1>
          <p className="text-sm text-gray-400 mb-8">Última atualização: abril de 2025</p>

          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">1. Aceitação dos termos</h2>
              <p>
                Ao acessar e utilizar o site da Encantari, você concorda com os presentes Termos de Uso.
                Caso não concorde, pedimos que não utilize nossos serviços.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">2. Produtos e preços</h2>
              <p>
                Todos os preços exibidos estão em Reais (R$) e podem ser alterados sem aviso prévio.
                Nos esforçamos para manter as informações atualizadas, mas erros podem ocorrer.
                Em caso de divergência de preço, entraremos em contato antes de prosseguir com o pedido.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">3. Pagamentos</h2>
              <p>
                Aceitamos cartão de crédito, Pix e boleto bancário, processados com segurança pelo
                Mercado Pago. Seus dados financeiros não são armazenados em nossos servidores.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">4. Entrega e frete</h2>
              <p>
                As entregas são realizadas via Melhor Envio para todo o Brasil. Os prazos e valores
                de frete são calculados no momento da compra com base no CEP de destino. Não nos
                responsabilizamos por atrasos causados por transportadoras ou eventos externos.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">5. Trocas e devoluções</h2>
              <p>
                Conforme o Código de Defesa do Consumidor, você tem até 7 dias após o recebimento
                para solicitar a devolução de produtos adquiridos online. Produtos com defeito serão
                trocados sem custo adicional. Entre em contato conosco para iniciar o processo.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">6. Privacidade</h2>
              <p>
                Os dados coletados (nome, e-mail, endereço) são utilizados exclusivamente para
                processar pedidos e melhorar sua experiência. Não compartilhamos suas informações
                com terceiros, exceto as transportadoras necessárias para a entrega.
              </p>
            </section>

            <section>
              <h2 className="text-lg font-semibold text-gray-800 mb-2">7. Contato</h2>
              <p>
                Dúvidas sobre estes termos? Fale conosco pelo{' '}
                <a href="/contato" className="text-vinho hover:underline">canal de atendimento</a>.
              </p>
            </section>
          </div>
        </div>
      </div>
    </main>
  )
}
