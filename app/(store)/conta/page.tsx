'use client'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { LogOut, Package, User, Eye, EyeOff, Loader2, ArrowRight, ChevronDown, Truck } from 'lucide-react'

type SupabaseSession = {
  access_token: string
  user: {
    email: string
    user_metadata: { nome?: string }
  }
} | null

type Item = { title: string; quantity: number; unit_price: number }
type Pedido = {
  id: string
  mp_payment_id?: string
  status: string
  total: number
  criado_em: string
  frete_nome: string
  frete_preco: number
  itens: Item[]
  rastreio?: string
  retirada?: boolean
}

export default function ContaPage() {
  const [sessao, setSessao] = useState<SupabaseSession>(null)
  const [carregando, setCarregando] = useState(true)
  const [tab, setTab] = useState<'entrar' | 'criar'>('entrar')
  const [form, setForm] = useState({ nome: '', email: '', senha: '', confirmar: '' })
  const [erro, setErro] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [mostrarSenha, setMostrarSenha] = useState(false)

  const fetchPedidos = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/conta/pedidos', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      setPedidos(data.pedidos || [])
    } catch {}
  }, [])

  useEffect(() => {
    let unsubscribe: (() => void) | undefined
    import('@/lib/supabase').then(({ getSupabase }) => {
      const sb = getSupabase()
      sb.auth.getSession().then(({ data: { session } }) => {
        setSessao(session as SupabaseSession)
        if (session) fetchPedidos(session.access_token)
        setCarregando(false)
      })
      const { data: { subscription } } = sb.auth.onAuthStateChange((_event, session) => {
        setSessao(session as SupabaseSession)
        if (session) fetchPedidos(session.access_token)
      })
      unsubscribe = () => subscription.unsubscribe()
    })
    return () => unsubscribe?.()
  }, [fetchPedidos])

  async function entrar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    setEnviando(true)
    const { getSupabase } = await import('@/lib/supabase')
    const { error } = await getSupabase().auth.signInWithPassword({
      email: form.email,
      password: form.senha,
    })
    if (error) {
      setErro(error.message.includes('Invalid login') ? 'Email ou senha incorretos.' : error.message)
    }
    setEnviando(false)
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault()
    setErro('')
    if (form.senha !== form.confirmar) return setErro('As senhas não coincidem.')
    if (form.senha.length < 6) return setErro('A senha deve ter pelo menos 6 caracteres.')
    setEnviando(true)
    const { getSupabase } = await import('@/lib/supabase')
    const { error } = await getSupabase().auth.signUp({
      email: form.email,
      password: form.senha,
      options: { data: { nome: form.nome } },
    })
    if (error) {
      setErro(error.message)
    } else {
      setErro('✉️ Verifique seu email para confirmar o cadastro antes de entrar.')
    }
    setEnviando(false)
  }

  async function sair() {
    const { getSupabase } = await import('@/lib/supabase')
    await getSupabase().auth.signOut()
    setSessao(null)
    setPedidos([])
  }

  const [expandido, setExpandido] = useState<string | null>(null)

  const statusLabel: Record<string, { label: string; cls: string }> = {
    approved:  { label: 'Pago',      cls: 'bg-green-100 text-green-700' },
    pago:      { label: 'Pago',      cls: 'bg-green-100 text-green-700' },
    enviado:   { label: 'Enviado',   cls: 'bg-blue-100 text-blue-700'   },
    entregue:  { label: 'Entregue',  cls: 'bg-green-200 text-green-800' },
    cancelado: { label: 'Cancelado', cls: 'bg-red-100 text-red-600'     },
    pendente:  { label: 'Pendente',  cls: 'bg-yellow-100 text-yellow-700' },
    pending:   { label: 'Pendente',  cls: 'bg-yellow-100 text-yellow-700' },
    rejected:  { label: 'Recusado',  cls: 'bg-red-100 text-red-600'     },
  }

  if (carregando) return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-vinho" />
    </div>
  )

  /* ─── Logado ─── */
  if (sessao) {
    const nome = sessao.user.user_metadata?.nome || sessao.user.email.split('@')[0]
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-fraunces text-2xl font-semibold text-vinho">Olá, {nome}!</h1>
            <p className="text-gray-400 text-sm mt-0.5">{sessao.user.email}</p>
          </div>
          <button
            onClick={sair}
            className="flex items-center gap-2 text-sm text-gray-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={16} /> Sair
          </button>
        </div>

        <h2 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package size={18} className="text-rosa" /> Meus Pedidos
        </h2>

        {pedidos.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-gray-50 rounded-2xl">
            <p className="text-3xl mb-3">📦</p>
            <p className="text-sm">Você ainda não fez nenhum pedido.</p>
            <Link href="/produtos" className="inline-flex items-center gap-1 text-rosa text-sm font-medium mt-4 hover:gap-2 transition-all">
              Explorar loja <ArrowRight size={14} />
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {pedidos.map(p => {
              const st = statusLabel[p.status] || { label: p.status, cls: 'bg-gray-100 text-gray-600' }
              const aberto = expandido === p.id
              const itens: Item[] = Array.isArray(p.itens) ? p.itens : []
              const codigo = p.mp_payment_id || p.id.slice(0, 8).toUpperCase()
              return (
                <div key={p.id} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                  {/* Cabeçalho */}
                  <button
                    className="w-full flex items-center justify-between gap-3 p-4 text-left hover:bg-gray-50 transition-colors"
                    onClick={() => setExpandido(aberto ? null : p.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                        <span className="text-xs text-gray-400 font-mono">#{codigo}</span>
                      </div>
                      <p className="font-semibold text-gray-900">R$ {Number(p.total).toFixed(2).replace('.', ',')}</p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(p.criado_em).toLocaleDateString('pt-BR')}
                        {p.frete_nome ? ` • ${p.frete_nome}` : ''}
                      </p>
                    </div>
                    <ChevronDown size={16} className={`text-gray-400 flex-shrink-0 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Detalhes expandidos */}
                  {aberto && (
                    <div className="border-t border-gray-100 p-4 space-y-4">

                      {/* Rastreamento */}
                      {p.status === 'enviado' || p.rastreio ? (
                        <div className="bg-blue-50 rounded-xl p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <Truck size={14} className="text-blue-600" />
                            <p className="text-xs font-semibold text-blue-700">
                              {p.retirada ? 'Pronto para retirada' : 'Código de rastreamento'}
                            </p>
                          </div>
                          {p.rastreio ? (
                            <>
                              <p className="font-mono font-bold text-blue-900 text-lg tracking-wider">{p.rastreio}</p>
                              <a
                                href="https://rastreamento.correios.com.br/app/index.php"
                                target="_blank" rel="noopener noreferrer"
                                className="inline-block mt-2 text-xs text-blue-600 underline underline-offset-2"
                              >
                                Rastrear nos Correios →
                              </a>
                            </>
                          ) : p.retirada ? (
                            <p className="text-sm text-blue-800">Seu pedido está pronto! Entre em contato para combinar a retirada.</p>
                          ) : (
                            <p className="text-sm text-blue-700">Seu pedido foi enviado. O código de rastreamento será atualizado em breve.</p>
                          )}
                        </div>
                      ) : null}

                      {/* Itens */}
                      {itens.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-gray-500 mb-2">Itens do pedido</p>
                          <div className="space-y-1.5">
                            {itens.map((item, i) => (
                              <div key={i} className="flex justify-between text-sm">
                                <span className="text-gray-700">{item.title} <span className="text-gray-400">×{item.quantity}</span></span>
                                <span className="text-gray-900 whitespace-nowrap">R$ {(Number(item.unit_price) * Number(item.quantity)).toFixed(2).replace('.', ',')}</span>
                              </div>
                            ))}
                            {p.frete_preco > 0 && (
                              <div className="flex justify-between text-sm text-gray-400">
                                <span>Frete — {p.frete_nome}</span>
                                <span>R$ {Number(p.frete_preco).toFixed(2).replace('.', ',')}</span>
                              </div>
                            )}
                            <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-sm">
                              <span>Total</span>
                              <span>R$ {Number(p.total).toFixed(2).replace('.', ',')}</span>
                            </div>
                          </div>
                        </div>
                      )}

                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  /* ─── Não logado ─── */
  const inputCls = 'w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rosa'

  return (
    <div className="min-h-[65vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-creme rounded-2xl flex items-center justify-center mx-auto mb-4">
            <User size={28} className="text-vinho" />
          </div>
          <h1 className="font-fraunces text-2xl font-semibold text-vinho">Minha Conta</h1>
          <p className="text-gray-400 text-sm mt-1">Acesse seus pedidos e dados pessoais</p>
        </div>

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
          <button
            onClick={() => { setTab('entrar'); setErro('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'entrar' ? 'bg-white text-vinho shadow-sm' : 'text-gray-500'}`}
          >
            Entrar
          </button>
          <button
            onClick={() => { setTab('criar'); setErro('') }}
            className={`flex-1 py-2.5 rounded-lg text-sm font-medium transition-all ${tab === 'criar' ? 'bg-white text-vinho shadow-sm' : 'text-gray-500'}`}
          >
            Criar conta
          </button>
        </div>

        {tab === 'entrar' ? (
          <form onSubmit={entrar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={inputCls} placeholder="seu@email.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'} required value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  className={inputCls + ' pr-12'} placeholder="••••••••"
                />
                <button type="button" onClick={() => setMostrarSenha(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {erro && <p className="text-sm text-red-500 text-center">{erro}</p>}
            <button
              type="submit" disabled={enviando}
              className="w-full py-3.5 bg-vinho text-creme rounded-full font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {enviando && <Loader2 size={16} className="animate-spin" />}
              Entrar
            </button>
          </form>
        ) : (
          <form onSubmit={criar} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nome</label>
              <input
                type="text" required value={form.nome}
                onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
                className={inputCls} placeholder="Seu nome completo"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input
                type="email" required value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className={inputCls} placeholder="seu@email.com.br"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Senha</label>
              <div className="relative">
                <input
                  type={mostrarSenha ? 'text' : 'password'} required value={form.senha}
                  onChange={e => setForm(f => ({ ...f, senha: e.target.value }))}
                  className={inputCls + ' pr-12'} placeholder="Mínimo 6 caracteres"
                />
                <button type="button" onClick={() => setMostrarSenha(v => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {mostrarSenha ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirmar senha</label>
              <input
                type="password" required value={form.confirmar}
                onChange={e => setForm(f => ({ ...f, confirmar: e.target.value }))}
                className={inputCls} placeholder="••••••••"
              />
            </div>
            {erro && (
              <p className={`text-sm text-center ${erro.startsWith('✉️') ? 'text-green-600 bg-green-50 p-3 rounded-xl' : 'text-red-500'}`}>
                {erro}
              </p>
            )}
            <button
              type="submit" disabled={enviando}
              className="w-full py-3.5 bg-vinho text-creme rounded-full font-semibold text-sm flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {enviando && <Loader2 size={16} className="animate-spin" />}
              Criar conta
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
