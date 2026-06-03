'use client'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { Package, ShoppingCart, ChevronRight, Loader2, Eye, Users } from 'lucide-react'

export default function AdminDashboard() {
  const [prodStats, setProdStats] = useState({ total: 0, disponiveis: 0, novos: 0 })
  const [siteStats, setSiteStats] = useState<{ visitas: { hoje: number; semana: number; mes: number }; clientes: number } | null>(null)
  const [carregandoProd, setCarregandoProd] = useState(true)
  const [carregandoSite, setCarregandoSite] = useState(true)

  useEffect(() => {
    fetch('/api/admin/produtos')
      .then(r => r.json())
      .then(d => {
        const prods = d.produtos || []
        setProdStats({
          total: prods.length,
          disponiveis: prods.filter((p: any) => p.estoque === 'disponivel').length,
          novos: prods.filter((p: any) => p.novo).length,
        })
      })
      .catch(() => {})
      .finally(() => setCarregandoProd(false))

    fetch('/api/admin/stats')
      .then(r => r.json())
      .then(d => { if (d.visitas) setSiteStats(d) })
      .catch(() => {})
      .finally(() => setCarregandoSite(false))
  }, [])

  const acoes = [
    { href: '/admin/produtos/novo', emoji: '📸', titulo: 'Novo produto',     sub: 'Adicione com foto da câmera',                                      cor: 'border-rosa/40 hover:border-rosa hover:bg-rosa/5' },
    { href: '/admin/home',         emoji: '🏠', titulo: 'Configurar home',   sub: 'Lançamentos, banners, categorias',                                 cor: 'border-vinho/30 hover:border-vinho hover:bg-vinho/5' },
    { href: '/admin/paginas',      emoji: '📄', titulo: 'Páginas',           sub: 'Sobre e Termos de Uso',                                            cor: 'border-rosa/30 hover:border-rosa hover:bg-rosa/5' },
    { href: '/admin/produtos',     emoji: '📦', titulo: 'Ver produtos',      sub: carregandoProd ? '...' : `${prodStats.total} produtos cadastrados`, cor: 'border-oliva/30 hover:border-oliva hover:bg-oliva/5' },
    { href: '/admin/pedidos',      emoji: '🛍️', titulo: 'Pedidos',           sub: 'Acompanhar vendas',                                                cor: 'border-bege/60 hover:border-bege hover:bg-bege/10' },
  ]

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900">Olá! ✨</h1>
        <p className="text-gray-500 text-sm mt-0.5">Painel da Encantari</p>
      </div>

      {/* Cards de produtos */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {carregandoProd ? (
          <div className="col-span-3 flex justify-center py-6">
            <Loader2 size={24} className="animate-spin text-vinho" />
          </div>
        ) : (
          [
            { label: 'Produtos',    value: prodStats.total,       emoji: '📦' },
            { label: 'Disponíveis', value: prodStats.disponiveis, emoji: '✅' },
            { label: 'Novos',       value: prodStats.novos,       emoji: '🆕' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <p className="text-2xl mb-1">{s.emoji}</p>
              <p className="text-2xl font-bold text-vinho leading-none">{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Cards de acessos e clientes */}
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Acessos ao site</p>
      <div className="grid grid-cols-3 gap-3 mb-3">
        {carregandoSite ? (
          <div className="col-span-3 flex justify-center py-6">
            <Loader2 size={24} className="animate-spin text-vinho" />
          </div>
        ) : (
          [
            { label: 'Hoje',      value: siteStats?.visitas.hoje   ?? 0 },
            { label: '7 dias',    value: siteStats?.visitas.semana ?? 0 },
            { label: '30 dias',   value: siteStats?.visitas.mes    ?? 0 },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-4 border border-gray-100 text-center">
              <Eye size={18} className="mx-auto mb-1 text-vinho/30" />
              <p className="text-2xl font-bold text-vinho leading-none">{s.value}</p>
              <p className="text-gray-400 text-xs mt-1">{s.label}</p>
            </div>
          ))
        )}
      </div>

      {/* Card de clientes */}
      <div className="bg-white rounded-2xl p-4 border border-gray-100 flex items-center gap-4 mb-6">
        <div className="w-10 h-10 rounded-xl bg-vinho/5 flex items-center justify-center flex-shrink-0">
          <Users size={20} className="text-vinho/60" />
        </div>
        <div>
          <p className="text-xs text-gray-400">Clientes cadastrados</p>
          <p className="text-2xl font-bold text-vinho leading-tight">
            {carregandoSite ? '...' : (siteStats?.clientes ?? 0)}
          </p>
        </div>
      </div>

      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">O que deseja fazer?</p>
      <div className="space-y-2">
        {acoes.map(a => (
          <Link key={a.href} href={a.href}
            className={`flex items-center gap-4 p-4 bg-white rounded-2xl border-2 transition-all touch-target ${a.cor}`}>
            <span className="text-3xl">{a.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm">{a.titulo}</p>
              <p className="text-gray-400 text-xs mt-0.5 truncate">{a.sub}</p>
            </div>
            <ChevronRight size={18} className="text-gray-300 flex-shrink-0" />
          </Link>
        ))}
      </div>

      <div className="mt-6 p-4 bg-vinho/5 rounded-2xl border border-vinho/10 flex items-center justify-between">
        <p className="text-sm text-vinho font-medium">Ver o site</p>
        <Link href="/" target="_blank" className="text-xs text-vinho/60 underline">
          encantari-loja.vercel.app →
        </Link>
      </div>
    </div>
  )
}
