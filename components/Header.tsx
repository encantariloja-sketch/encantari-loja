'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { ShoppingBag, Search, Menu, X, User } from 'lucide-react'
import { useCart } from '@/lib/CartContext'
import { categorias } from '@/data/produtos'

export default function Header({ topbar }: { topbar?: string }) {
  const { totalItens } = useCart()
  const [menuAberto, setMenuAberto] = useState(false)
  const [buscaAberta, setBuscaAberta] = useState(false)
  const [busca, setBusca] = useState('')
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  return (
    <>
      {/* Top bar */}
      {topbar && (
        <div className="bg-vinho text-creme text-xs py-2 text-center px-4 font-medium tracking-wide hidden sm:block">
          {topbar}
        </div>
      )}

      <header className={`sticky top-0 z-50 bg-white transition-shadow ${scrolled ? 'shadow-sm' : ''}`}>
        {/* Header principal */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16 md:h-20 gap-4">
            {/* Logo */}
            <Link href="/" className="flex-shrink-0">
              <Image
                src="/logo-escura.png"
                alt="Encantari"
                width={140}
                height={60}
                className="h-10 md:h-12 w-auto object-contain"
                priority
              />
            </Link>

            {/* Busca desktop */}
            <div className="hidden md:flex flex-1 max-w-lg mx-4">
              <div className="relative w-full">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="O que você procura?"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-rosa bg-gray-50 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Ícones direita */}
            <div className="flex items-center gap-1 md:gap-2">
              <button
                onClick={() => setBuscaAberta(!buscaAberta)}
                className="md:hidden p-2.5 text-vinho/70 hover:text-vinho"
                aria-label="Buscar"
              >
                <Search size={21} />
              </button>
              <Link
                href="/conta"
                className="p-2.5 text-vinho/70 hover:text-vinho transition-colors"
                aria-label="Minha conta"
              >
                <User size={21} />
              </Link>
              <Link
                href="/carrinho"
                className="relative p-2.5 text-vinho/70 hover:text-vinho transition-colors"
                aria-label="Carrinho"
              >
                <ShoppingBag size={21} />
                {totalItens > 0 && (
                  <span className="absolute top-1 right-1 w-4.5 h-4.5 min-w-[18px] h-[18px] bg-rosa text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
                    {totalItens > 9 ? '9+' : totalItens}
                  </span>
                )}
              </Link>
              <button
                onClick={() => setMenuAberto(!menuAberto)}
                className="md:hidden p-2.5 text-vinho"
                aria-label="Menu"
              >
                {menuAberto ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Busca mobile expandida */}
        {buscaAberta && (
          <div className="md:hidden px-4 pb-3 border-t border-gray-100">
            <div className="relative mt-3">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                autoFocus
                type="text"
                placeholder="O que você procura?"
                className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-full text-sm focus:outline-none focus:border-rosa bg-gray-50"
              />
            </div>
          </div>
        )}

        {/* Nav desktop */}
        <nav className="hidden md:block border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4">
            <ul className="flex items-center gap-0 overflow-x-auto scroll-hide">
              {[
                { label: '🎉 Lançamentos', href: '/produtos?ordem=novos' },
                { label: '🏷️ Ofertas', href: '/produtos?ordem=ofertas' },
                ...categorias.map(c => ({ label: `${c.icone} ${c.nome}`, href: `/produtos?categoria=${c.id}` })),
              ].map(item => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="block px-3.5 py-3.5 text-sm text-vinho/70 hover:text-vinho font-medium whitespace-nowrap border-b-2 border-transparent hover:border-vinho transition-all"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        {/* Menu mobile drawer */}
        {menuAberto && (
          <div className="md:hidden fixed inset-0 top-0 z-40 bg-black/40" onClick={() => setMenuAberto(false)}>
            <div
              className="absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-xl flex flex-col"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between p-5 border-b border-gray-100">
                <Image src="/logo-escura.png" alt="Encantari" width={120} height={50} className="h-8 w-auto" />
                <button onClick={() => setMenuAberto(false)} className="p-2 text-vinho/60">
                  <X size={20} />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto py-4">
                {[
                  { label: '👤 Minha conta', href: '/conta' },
                  { label: '🎉 Lançamentos', href: '/produtos?ordem=novos' },
                  { label: '🏷️ Ofertas', href: '/produtos?ordem=ofertas' },
                  ...categorias.map(c => ({ label: `${c.icone} ${c.nome}`, href: `/produtos?categoria=${c.id}` })),
                ].map(item => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuAberto(false)}
                    className="flex items-center px-5 py-4 text-vinho font-medium border-b border-gray-50 hover:bg-creme transition-colors"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>
          </div>
        )}
      </header>
    </>
  )
}
