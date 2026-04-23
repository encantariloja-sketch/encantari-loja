import Image from 'next/image'
import Link from 'next/link'
import { getHomeConfig } from '@/lib/homeConfig'

export const metadata = { title: 'Sobre a Encantari' }

export default async function SobrePage() {
  const config = await getHomeConfig()
  const { institucional } = config

  return (
    <main className="min-h-screen bg-creme/30">
      {/* Hero */}
      <div className="bg-vinho text-creme py-20 px-4 text-center">
        <p className="text-rosa text-sm font-medium uppercase tracking-widest mb-3">
          {institucional.label}
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          {institucional.titulo}{' '}
          <em className="font-light not-italic text-rosa">{institucional.titulo_italic}</em>
        </h1>
      </div>

      {/* Corpo */}
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="bg-white rounded-2xl shadow-sm border border-rosa/20 p-8 md:p-12">
          <p className="text-gray-600 text-lg leading-relaxed mb-10">
            {institucional.corpo}
          </p>

          {/* Benefícios */}
          <div className="grid sm:grid-cols-2 gap-6 mb-10">
            {institucional.beneficios.map(b => (
              <div key={b.titulo} className="flex items-start gap-4 p-4 rounded-xl bg-creme/40">
                <span className="text-3xl">{b.emoji}</span>
                <div>
                  <p className="font-semibold text-gray-800">{b.titulo}</p>
                  <p className="text-sm text-gray-500">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <Link
              href={institucional.cta_link}
              className="inline-block bg-vinho text-creme px-8 py-3 rounded-full font-medium hover:bg-vinho/90 transition-colors"
            >
              {institucional.cta_texto}
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
