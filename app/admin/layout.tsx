'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { LayoutDashboard, Package, ShoppingCart, Home, Tag, LogOut } from 'lucide-react'

const navLinks = [
  { href: '/admin',             label: 'Início',     icon: LayoutDashboard, mobile: true  },
  { href: '/admin/home',        label: 'Home',       icon: Home,            mobile: true  },
  { href: '/admin/produtos',    label: 'Produtos',   icon: Package,         mobile: true  },
  { href: '/admin/categorias',  label: 'Categorias', icon: Tag,             mobile: false },
  { href: '/admin/pedidos',     label: 'Pedidos',    icon: ShoppingCart,    mobile: true  },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  async function sair() {
    await fetch('/api/admin/auth', { method: 'DELETE' })
    router.push('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Sidebar desktop ─── */}
      <aside className="hidden md:flex flex-col w-60 bg-vinho text-creme fixed inset-y-0 left-0 z-30">
        <div className="px-5 py-6 border-b border-creme/10">
          <Image src="/logo-clara.png" alt="Encantari" width={110} height={45} className="h-8 w-auto brightness-0 invert opacity-90" />
          <p className="text-creme/40 text-[11px] mt-2 font-medium tracking-wide uppercase">Painel Admin</p>
        </div>
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  active ? 'bg-creme/15 text-creme' : 'text-creme/60 hover:text-creme hover:bg-creme/10'
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </nav>
        <div className="px-3 py-4 border-t border-creme/10">
          <button
            onClick={sair}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-creme/50 hover:text-creme hover:bg-creme/10 transition-all text-sm"
          >
            <LogOut size={18} />
            Sair
          </button>
        </div>
      </aside>

      {/* ─── Header mobile ─── */}
      <div className="md:hidden fixed top-0 inset-x-0 z-30 bg-vinho px-4 h-14 flex items-center justify-between">
        <Image src="/logo-clara.png" alt="Encantari" width={90} height={38} className="h-7 w-auto brightness-0 invert opacity-90" />
        <span className="text-creme/50 text-xs font-medium uppercase tracking-widest">Admin</span>
      </div>

      {/* ─── Conteúdo ─── */}
      <main className="md:ml-60 pt-14 md:pt-0 min-h-screen pb-24 md:pb-0">
        <div className="p-4 md:p-8 max-w-4xl">{children}</div>
      </main>

      {/* ─── Bottom nav mobile ─── */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-white border-t border-gray-100 safe-area-bottom">
        <div className="flex">
          {navLinks.filter(l => l.mobile).map(({ href, label, icon: Icon }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={`flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium transition-colors ${
                  active ? 'text-vinho' : 'text-gray-400'
                }`}
              >
                <Icon size={22} strokeWidth={active ? 2.5 : 1.8} />
                {label}
              </Link>
            )
          })}
          <button
            onClick={sair}
            className="flex-1 flex flex-col items-center justify-center py-2.5 gap-1 text-[10px] font-medium text-gray-400"
          >
            <LogOut size={22} strokeWidth={1.8} />
            Sair
          </button>
        </div>
      </nav>
    </div>
  )
}
