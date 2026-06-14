import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Política de Trocas e Devoluções — Encantari' }

export default function TrocasDevolucoesPage() {
  return (
    <main className="min-h-screen bg-creme/30">
      {/* Hero */}
      <div className="bg-vinho text-creme py-16 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-2">Trocas e Devoluções</h1>
        <p className="text-creme/60 text-sm">Política vigente da Encantari</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-rosa/20 p-8 md:p-12 space-y-10 text-gray-600 text-sm leading-relaxed">

          {/* Introdução */}
          <p>
            Na Encantari, buscamos oferecer produtos de qualidade e uma experiência de compra especial.
            Como somos uma loja de pequeno porte, pedimos que todas as informações dos produtos sejam
            lidas atentamente antes da compra e que eventuais dúvidas sejam esclarecidas conosco
            previamente, evitando transtornos e custos desnecessários para ambas as partes.
          </p>

          {/* 1 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              1. Solicitação de Troca, Devolução ou Registro de Problemas
            </h2>
            <p className="mb-3">
              Toda solicitação de troca, devolução, avaria, divergência no pedido ou defeito deve ser
              realizada exclusivamente por e-mail, através do endereço:
            </p>
            <div className="bg-creme/60 border border-rosa/30 rounded-xl px-5 py-4 text-center my-4">
              <a href="mailto:encantari.loja@gmail.com"
                className="font-semibold text-vinho hover:underline">
                encantari.loja@gmail.com
              </a>
            </div>
            <p className="mb-3">
              Solicitações realizadas por outros canais de comunicação não serão consideradas válidas.
            </p>
            <p className="mb-3">
              De acordo com o Art. 49 do Código de Defesa do Consumidor, o cliente possui até{' '}
              <strong className="text-gray-800">7 (sete) dias corridos após o recebimento do produto</strong>{' '}
              para solicitar a desistência da compra, troca ou devolução.
            </p>
            <p>
              A solicitação somente será considerada válida após o envio do e-mail contendo todas as
              informações exigidas.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              2. Como Solicitar uma Troca ou Devolução
            </h2>
            <p className="mb-3">
              Envie um e-mail para{' '}
              <a href="mailto:encantari.loja@gmail.com" className="font-semibold text-vinho hover:underline">
                encantari.loja@gmail.com
              </a>{' '}
              com o assunto:
            </p>
            <ul className="list-disc list-inside space-y-1 mb-4 ml-2">
              <li>"Troca de Produto" ou</li>
              <li>"Devolução de Produto"</li>
            </ul>
            <p className="mb-3">No corpo do e-mail, informe:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>Nome completo;</li>
              <li>Número do pedido;</li>
              <li>Motivo da solicitação;</li>
              <li>Produto(s) a ser(em) trocado(s) ou devolvido(s);</li>
              <li>Em caso de troca, informar o modelo desejado.</li>
            </ul>
            <p className="mt-3">
              Após o recebimento das informações, enviaremos as orientações para o envio do produto.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              3. Condições para Aceitação
            </h2>
            <p className="mb-3">
              Ao recebermos o produto em nosso escritório, teremos até{' '}
              <strong className="text-gray-800">3 (três) dias úteis</strong> para realizar a análise.
            </p>
            <p className="mb-3">A solicitação poderá ser recusada nos seguintes casos:</p>
            <ul className="list-disc list-inside space-y-1 ml-2 mb-3">
              <li>Ausência do defeito informado pelo cliente;</li>
              <li>Indícios de uso inadequado;</li>
              <li>Danos acidentais;</li>
              <li>Desgaste natural decorrente do uso;</li>
              <li>Alterações realizadas pelo cliente;</li>
              <li>Remoção de etiquetas, TAGs ou lacres de segurança;</li>
              <li>Sinais de uso do produto.</li>
            </ul>
            <p>
              Caso a solicitação seja reprovada, o produto será devolvido ao cliente mediante pagamento
              de novo frete, sendo cancelado o processo de troca ou devolução.
            </p>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              4. Envio do Produto
            </h2>
            <p className="mb-3">Os produtos deverão ser enviados pelos Correios.</p>
            <p className="mb-3">
              Ao aprovarmos a solicitação, disponibilizaremos um código de postagem reversa, válido por{' '}
              <strong className="text-gray-800">7 (sete) dias corridos</strong>, para envio gratuito do produto.
            </p>
            <p className="mb-3">
              Caso a postagem não seja realizada dentro desse prazo, a solicitação será automaticamente cancelada.
            </p>
            <p className="mb-5">
              O produto deve ser enviado preferencialmente em sua embalagem original, acompanhado de
              todos os acessórios recebidos.
            </p>
            <h3 className="font-semibold text-gray-700 mb-2">Pedidos Retirados na Loja</h3>
            <p className="mb-3">
              Para pedidos realizados na modalidade{' '}
              <strong className="text-gray-800">"Retirar Pessoalmente"</strong>, não será fornecido
              código de postagem reversa.
            </p>
            <p>
              Nesses casos, os produtos deverão ser entregues em nosso endereço ou enviados por conta
              do cliente em até 7 (sete) dias após a resposta da solicitação.
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              5. Recebimento do Pedido
            </h2>
            <p>
              No momento da entrega, recomendamos que o cliente recuse o recebimento caso a embalagem
              esteja aberta, violada ou visivelmente danificada.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              6. Trocas
            </h2>
            <p className="mb-3">
              A substituição será efetuada somente por produto do mesmo modelo e cadastro, desde que
              haja disponibilidade em estoque.
            </p>
            <p className="mb-3">
              Caso o produto não esteja mais disponível, o cliente poderá optar pelo cancelamento da compra.
            </p>
            <p className="mb-3">
              Após aprovação da análise, será disponibilizado um{' '}
              <strong className="text-gray-800">cupom de crédito correspondente ao valor do(s) produto(s)</strong>{' '}
              para utilização no site.
            </p>
            <p className="mb-3">
              O crédito terá validade de <strong className="text-gray-800">6 (seis) meses</strong>.
            </p>
            <p className="mb-5">
              O frete referente ao envio do novo pedido realizado com o crédito será de responsabilidade do cliente.
            </p>
            <h3 className="font-semibold text-gray-700 mb-2">Segunda Troca</h3>
            <p className="mb-3">
              Em caso de segunda troca referente ao mesmo pedido ou a um cupom de crédito já emitido,
              os custos de envio dos produtos para o nosso escritório serão de responsabilidade do cliente.
            </p>
            <p>
              Os cupons de crédito emitidos não poderão ser convertidos em reembolso financeiro.
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              7. Devoluções e Reembolsos
            </h2>
            <p className="mb-3">
              Após a aprovação da análise, o reembolso será realizado através do mesmo intermediador
              de pagamento utilizado na compra.
            </p>
            <p className="mb-5">
              O prazo para processamento da devolução é de até{' '}
              <strong className="text-gray-800">10 (dez) dias úteis</strong> após a aprovação da análise.
            </p>
            <h3 className="font-semibold text-gray-700 mb-2">Devoluções Parciais</h3>
            <p>
              Caso tenha sido utilizado algum cupom de desconto no pedido, o valor devolvido será
              calculado proporcionalmente ao valor do produto devolvido.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              8. Brindes
            </h2>
            <p className="mb-3">
              Em caso de devolução total do pedido, todos os brindes recebidos deverão ser devolvidos.
            </p>
            <p className="mb-3">
              Nas devoluções parciais, caso o valor final do pedido fique abaixo do mínimo exigido para
              recebimento do brinde, este também deverá ser devolvido.
            </p>
            <p>
              Caso algum brinde não seja devolvido quando necessário, seu valor de venda (sem descontos
              promocionais) será descontado do valor a ser reembolsado.
            </p>
          </section>

          {/* 9 */}
          <section>
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              9. Considerações Finais
            </h2>
            <p className="mb-3">
              A Encantari reserva-se o direito de recusar solicitações que não atendam às condições
              descritas nesta política.
            </p>
            <p>
              Ao realizar uma compra em nossa loja, o cliente declara estar ciente e de acordo com
              todas as condições acima.
            </p>
          </section>

          {/* CTA email */}
          <div className="border-t border-gray-100 pt-8 text-center">
            <p className="text-gray-500 mb-3">Dúvidas? Entre em contato:</p>
            <a
              href="mailto:encantari.loja@gmail.com"
              className="inline-block bg-vinho text-creme px-6 py-3 rounded-full text-sm font-medium hover:bg-vinho/90 transition-colors"
            >
              encantari.loja@gmail.com
            </a>
          </div>

        </div>
      </div>
    </main>
  )
}
