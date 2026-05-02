'use client'
import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, Package, ChevronDown, Download, User, MapPin, ShoppingBag } from 'lucide-react'

type Item = { title: string; quantity: number; unit_price: number }
type Comprador = {
  nome?: string
  email?: string
  telefone?: string
  cpf?: string
  cep?: string
  rua?: string
  numero?: string
  complemento?: string
  bairro?: string
  cidade?: string
  estado?: string
}
type Pedido = {
  id: string
  status: string
  total: number
  criado_em: string
  frete_nome: string
  frete_preco: number
  mp_payment_id: string
  comprador: Comprador
  itens: Item[]
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  approved:  { label: 'Pago',      cls: 'bg-green-100 text-green-700' },
  pago:      { label: 'Pago',      cls: 'bg-green-100 text-green-700' },
  enviado:   { label: 'Enviado',   cls: 'bg-blue-100 text-blue-700' },
  entregue:  { label: 'Entregue',  cls: 'bg-green-200 text-green-800' },
  cancelado: { label: 'Cancelado', cls: 'bg-red-100 text-red-600' },
  pendente:  { label: 'Pendente',  cls: 'bg-yellow-100 text-yellow-700' },
  pending:   { label: 'Pendente',  cls: 'bg-yellow-100 text-yellow-700' },
  rejected:  { label: 'Recusado', cls: 'bg-red-100 text-red-600' },
}

const STATUS_OPCOES = ['pago', 'enviado', 'entregue', 'cancelado', 'pendente']

function Campo({ label, value }: { label: string; value?: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-gray-400 leading-none mb-0.5">{label}</p>
      <p className="text-sm text-gray-800">{value}</p>
    </div>
  )
}

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [atualizando, setAtualizando] = useState<string | null>(null)
  const [sincronizando, setSincronizando] = useState(false)

  async function sincronizar() {
    setSincronizando(true)
    try {
      const res = await fetch('/api/admin/pedidos/sync', { method: 'POST' })
      const data = await res.json()
      if (data.erro) {
        alert('Erro: ' + data.erro)
      } else if (data.importados === 0) {
        alert(`Todos os ${data.total} pedidos já estavam no banco.`)
      } else {
        alert(`${data.importados} pedido(s) importado(s) do Mercado Pago!`)
        await carregar()
      }
    } catch {
      alert('Erro de conexão.')
    }
    setSincronizando(false)
  }

  async function carregar() {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/pedidos')
      const data = await res.json()
      setPedidos(data.pedidos || [])
    } catch {}
    setCarregando(false)
  }

  useEffect(() => { carregar() }, [])

  async function atualizarStatus(id: string, status: string) {
    setAtualizando(id)
    try {
      await fetch('/api/admin/pedidos', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      })
      setPedidos(p => p.map(x => x.id === id ? { ...x, status } : x))
    } catch {}
    setAtualizando(null)
  }

  if (carregando) {
    return <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-vinho" /></div>
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Pedidos</h1>
          <p className="text-gray-400 text-sm mt-0.5">{pedidos.length} pedido(s) no total</p>
        </div>
        <div className="flex gap-2">
          <button onClick={sincronizar} disabled={sincronizando}
            className="flex items-center gap-2 px-4 py-2 text-sm text-vinho border border-vinho/30 rounded-full hover:bg-vinho/5 transition-colors disabled:opacity-50"
            title="Importa pedidos aprovados diretamente do Mercado Pago">
            {sincronizando ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            {sincronizando ? 'Importando...' : 'Importar do MP'}
          </button>
          <button onClick={carregar} className="flex items-center gap-2 px-4 py-2 text-sm text-vinho border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
            <RefreshCw size={15} /> Atualizar
          </button>
        </div>
      </div>

      {pedidos.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
          <Package size={40} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-400 text-sm">Nenhum pedido ainda.</p>
          <p className="text-gray-300 text-xs mt-1">Os pedidos aparecem aqui após a confirmação do Mercado Pago.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pedidos.map(p => {
            const st = STATUS_MAP[p.status] || { label: p.status, cls: 'bg-gray-100 text-gray-600' }
            const aberto = expandido === p.id
            const itens: Item[] = Array.isArray(p.itens) ? p.itens : []
            const c = p.comprador || {}
            const enderecoLinha2 = [c.bairro, c.cidade && c.estado ? `${c.cidade}/${c.estado}` : c.cidade || c.estado].filter(Boolean).join(' — ')
            const dataFormatada = new Date(p.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                {/* Cabeçalho do card — sempre visível */}
                <button
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandido(aberto ? null : p.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                      <p className="text-xs font-mono text-gray-400">#{p.mp_payment_id || p.id.slice(0, 8).toUpperCase()}</p>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{c.nome || '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{dataFormatada}</p>
                  </div>
                  <div className="text-right flex-shrink-0 flex flex-col items-end gap-1">
                    <p className="font-bold text-vinho text-base">R$ {Number(p.total).toFixed(2).replace('.', ',')}</p>
                    <ChevronDown size={16} className={`text-gray-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {aberto && (
                  <div className="border-t border-gray-100">

                    {/* Corpo expandido — grid de seções */}
                    <div className="p-4 grid md:grid-cols-3 gap-4">

                      {/* Coluna 1: Dados do cliente */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <User size={12} /> Cliente
                        </div>
                        <Campo label="Nome" value={c.nome} />
                        <Campo label="Email" value={c.email} />
                        <Campo label="CPF" value={c.cpf} />
                        <Campo label="Telefone" value={c.telefone} />
                      </div>

                      {/* Coluna 2: Endereço */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <MapPin size={12} /> Endereço
                        </div>
                        {c.rua ? (
                          <>
                            <Campo label="Rua" value={`${c.rua}, ${c.numero || 's/n'}${c.complemento ? ` — ${c.complemento}` : ''}`} />
                            <Campo label="Bairro / Cidade" value={enderecoLinha2} />
                            <Campo label="CEP" value={c.cep} />
                          </>
                        ) : (
                          <p className="text-sm text-gray-400 italic">Sem endereço</p>
                        )}
                        <Campo label="Frete" value={p.frete_nome ? `${p.frete_nome}${p.frete_preco > 0 ? ` — R$ ${Number(p.frete_preco).toFixed(2).replace('.', ',')}` : ' — Grátis'}` : undefined} />
                      </div>

                      {/* Coluna 3: Itens do pedido */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                          <ShoppingBag size={12} /> Itens
                        </div>
                        <div className="space-y-2">
                          {itens.map((item, i) => (
                            <div key={i} className="flex justify-between text-sm">
                              <span className="text-gray-700 pr-2">{item.title} <span className="text-gray-400">×{item.quantity}</span></span>
                              <span className="text-gray-800 whitespace-nowrap">R$ {(Number(item.unit_price) * Number(item.quantity)).toFixed(2).replace('.', ',')}</span>
                            </div>
                          ))}
                        </div>
                        <div className="border-t border-gray-100 pt-2 flex justify-between font-semibold text-sm text-gray-900">
                          <span>Total</span>
                          <span>R$ {Number(p.total).toFixed(2).replace('.', ',')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Alterar status — rodapé */}
                    <div className="border-t border-gray-100 px-4 py-3 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-gray-400 mr-1">Status:</span>
                      {STATUS_OPCOES.map(s => (
                        <button
                          key={s}
                          onClick={() => atualizarStatus(p.id, s)}
                          disabled={atualizando === p.id || p.status === s}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all disabled:opacity-50 ${
                            p.status === s
                              ? 'bg-vinho text-white border-vinho'
                              : 'bg-white text-gray-600 border-gray-200 hover:border-vinho hover:text-vinho'
                          }`}
                        >
                          {atualizando === p.id && p.status !== s
                            ? <Loader2 size={12} className="animate-spin inline" />
                            : STATUS_MAP[s]?.label || s}
                        </button>
                      ))}
                    </div>

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
