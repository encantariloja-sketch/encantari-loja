import Link from 'next/link'
import Image from 'next/image'
import { Instagram, Mail, MapPin, Phone, CreditCard, Shield, Truck, RefreshCcw } from 'lucide-react'
import { getHomeConfig } from '@/lib/homeConfig'
import { getCategorias } from '@/lib/getCategorias'

export default async function Footer() {
  const [config, categorias] = await Promise.all([getHomeConfig(), getCategorias()])
  const { rodape } = config
  const waNum = config.whatsapp.replace(/\D/g, '')

  return (
    <footer className="bg-vinho text-creme/80 mt-16">
      {/* Benefícios */}
      <div className="border-b border-creme/10">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { icon: <Truck size={22} />, titulo: 'Frete para todo Brasil', sub: 'Via Melhor Envio' },
              { icon: <Shield size={22} />, titulo: 'Compra segura', sub: 'Site protegido SSL' },
              { icon: <CreditCard size={22} />, titulo: 'Parcele em até 12×', sub: 'Sem juros no cartão' },
              { icon: <RefreshCcw size={22} />, titulo: 'Troca fácil', sub: 'Política flexível' },
            ].map(b => (
              <div key={b.titulo} className="flex items-start gap-3">
                <div className="text-rosa mt-0.5 flex-shrink-0">{b.icon}</div>
                <div>
                  <p className="text-creme font-medium text-sm">{b.titulo}</p>
                  <p className="text-creme/50 text-xs">{b.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Links */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Marca */}
          <div className="col-span-2 md:col-span-1">
            <Image
              src="/logo-clara.png"
              alt="Encantari"
              width={130}
              height={55}
              className="h-10 w-auto object-contain mb-4 brightness-0 invert opacity-90"
            />
            <p className="text-creme/60 text-xs leading-relaxed">
              Curadoria especial de presentes, decoração e lifestyle para encantar cada momento.
            </p>
            <div className="flex gap-3 mt-4">
              {rodape.instagram && (
                <a href={`https://instagram.com/${rodape.instagram}`} target="_blank" rel="noopener noreferrer"
                  className="w-9 h-9 rounded-full bg-creme/10 flex items-center justify-center hover:bg-rosa transition-colors">
                  <Instagram size={16} />
                </a>
              )}
              {rodape.email && (
                <a href={`mailto:${rodape.email}`}
                  className="w-9 h-9 rounded-full bg-creme/10 flex items-center justify-center hover:bg-rosa transition-colors">
                  <Mail size={16} />
                </a>
              )}
            </div>
          </div>

          {/* Categorias */}
          <div>
            <h4 className="text-creme font-semibold text-sm mb-4">Categorias</h4>
            <ul className="space-y-2.5">
              {categorias.map(c => (
                <li key={c.id}>
                  <Link href={`/produtos?categoria=${c.id}`} className="text-xs hover:text-creme transition-colors">
                    {c.nome}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Ajuda */}
          <div>
            <h4 className="text-creme font-semibold text-sm mb-4">Ajuda</h4>
            <ul className="space-y-2.5">
              {rodape.ajuda.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs hover:text-creme transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Institucional */}
          <div>
            <h4 className="text-creme font-semibold text-sm mb-4">Institucional</h4>
            <ul className="space-y-2.5">
              {rodape.institucional.map(l => (
                <li key={l.href}>
                  <Link href={l.href} className="text-xs hover:text-creme transition-colors">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contato */}
          <div>
            <h4 className="text-creme font-semibold text-sm mb-4">Contato</h4>
            <ul className="space-y-3">
              {rodape.instagram && (
                <li>
                  <a href={`https://instagram.com/${rodape.instagram}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs hover:text-creme transition-colors">
                    <Instagram size={14} /> @{rodape.instagram}
                  </a>
                </li>
              )}
              {rodape.email && (
                <li>
                  <a href={`mailto:${rodape.email}`}
                    className="flex items-center gap-2 text-xs hover:text-creme transition-colors">
                    <Mail size={14} /> {rodape.email}
                  </a>
                </li>
              )}
              {waNum && (
                <li>
                  <a href={`https://wa.me/${waNum}`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 text-xs hover:text-creme transition-colors">
                    <Phone size={14} /> WhatsApp
                  </a>
                </li>
              )}
              {rodape.endereco && (
                <li className="flex items-start gap-2 text-xs text-creme/60">
                  <MapPin size={14} className="mt-0.5 flex-shrink-0" />
                  <span className="whitespace-pre-line">{rodape.endereco}</span>
                </li>
              )}
            </ul>
            {rodape.horario && (
              <div className="mt-4">
                <p className="text-creme/50 text-xs">Atendimento</p>
                <p className="text-xs mt-0.5">{rodape.horario}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-creme/10">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-creme/40">
          <p>© {new Date().getFullYear()} Encantari. Todos os direitos reservados.</p>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <span className="bg-creme/10 px-2 py-1 rounded text-xs">Visa</span>
            <span className="bg-creme/10 px-2 py-1 rounded text-xs">Mastercard</span>
            <span className="bg-creme/10 px-2 py-1 rounded text-xs">Pix</span>
            <span className="bg-creme/10 px-2 py-1 rounded text-xs">Boleto</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
