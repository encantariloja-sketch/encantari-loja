import { getHomeConfig } from '@/lib/homeConfig'

export const metadata = { title: 'Termos de Uso — Encantari' }

export default async function TermosPage() {
  const config = await getHomeConfig()
  const { termos } = config

  return (
    <main className="min-h-screen bg-creme/30">
      {/* Hero */}
      <div className="relative bg-vinho text-creme py-16 px-4 text-center overflow-hidden">
        {termos.banner_imagem && (
          <div className="absolute inset-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={termos.banner_imagem} alt="" className="w-full h-full object-cover opacity-40" />
            <div className="absolute inset-0 bg-vinho/60" />
          </div>
        )}
        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-2">Termos de Uso</h1>
          <p className="text-creme/60 text-sm">Última atualização: {termos.ultima_atualizacao}</p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-rosa/20 p-8 md:p-12">
          <div className="prose prose-sm max-w-none text-gray-600 space-y-6">
            {termos.secoes.map((secao, i) => (
              <section key={i}>
                <h2 className="text-lg font-semibold text-gray-800 mb-2">{secao.titulo}</h2>
                <p>{secao.conteudo}</p>
              </section>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
