import { Instagram, Mail, MapPin, Phone, Clock } from 'lucide-react'
import { getHomeConfig } from '@/lib/homeConfig'

export const metadata = { title: 'Contato — Encantari' }

export default async function ContatoPage() {
  const config = await getHomeConfig()
  const { rodape } = config
  const waNum = config.whatsapp.replace(/\D/g, '')
  const waFormatado = waNum.length >= 12
    ? `(${waNum.slice(2, 4)}) ${waNum.slice(4, 9)}-${waNum.slice(9)}`
    : config.whatsapp

  return (
    <main className="min-h-screen bg-creme/30 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-vinho mb-2">Fale conosco</h1>
          <p className="text-gray-500">Estamos aqui para ajudar. Escolha o canal que preferir.</p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 mb-8">
          {waNum && (
            <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-rosa/20 p-6 hover:shadow-md transition-shadow flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-100 transition-colors">
                <Phone size={22} className="text-green-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">WhatsApp</p>
                <p className="text-sm text-gray-500 mt-0.5">{waFormatado}</p>
                <p className="text-xs text-green-600 mt-2 font-medium">Falar agora →</p>
              </div>
            </a>
          )}

          {rodape.email && (
            <a href={`mailto:${rodape.email}`}
              className="bg-white rounded-2xl border border-rosa/20 p-6 hover:shadow-md transition-shadow flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-100 transition-colors">
                <Mail size={22} className="text-blue-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">E-mail</p>
                <p className="text-sm text-gray-500 mt-0.5">{rodape.email}</p>
                <p className="text-xs text-blue-600 mt-2 font-medium">Enviar mensagem →</p>
              </div>
            </a>
          )}

          {rodape.instagram && (
            <a href={`https://instagram.com/${rodape.instagram}`} target="_blank" rel="noopener noreferrer"
              className="bg-white rounded-2xl border border-rosa/20 p-6 hover:shadow-md transition-shadow flex items-start gap-4 group">
              <div className="w-12 h-12 rounded-full bg-pink-50 flex items-center justify-center flex-shrink-0 group-hover:bg-pink-100 transition-colors">
                <Instagram size={22} className="text-pink-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Instagram</p>
                <p className="text-sm text-gray-500 mt-0.5">@{rodape.instagram}</p>
                <p className="text-xs text-pink-600 mt-2 font-medium">Ver perfil →</p>
              </div>
            </a>
          )}

          {rodape.endereco && (
            <div className="bg-white rounded-2xl border border-rosa/20 p-6 flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-50 flex items-center justify-center flex-shrink-0">
                <MapPin size={22} className="text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-gray-800">Endereço</p>
                <p className="text-sm text-gray-500 mt-0.5 whitespace-pre-line">{rodape.endereco}</p>
              </div>
            </div>
          )}
        </div>

        {rodape.horario && (
          <div className="bg-white rounded-2xl border border-rosa/20 p-6 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-vinho/10 flex items-center justify-center flex-shrink-0">
              <Clock size={22} className="text-vinho" />
            </div>
            <div>
              <p className="font-semibold text-gray-800">Horário de atendimento</p>
              <p className="text-sm text-gray-500 mt-0.5">{rodape.horario}</p>
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
