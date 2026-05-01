'use client'
import { useState, useEffect } from 'react'
import { Loader2, RefreshCw, Package, ChevronDown } from 'lucide-react'

type Item = { title: string; quantity: number; unit_price: number }
type Pedido = {
  id: string
  status: string
  total: number
  criado_em: string
  frete_nome: string
  frete_preco: number
  mp_payment_id: string
  comprador: { nome?: string; email?: string; telefone?: string; cep?: string; rua?: string; numero?: string; cidade?: string; estado?: string }
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

export default function AdminPedidosPage() {
  const [pedidos, setPedidos] = useState<Pedido[]>([])
  const [carregando, setCarregando] = useState(true)
  const [expandido, setExpandido] = useState<string | null>(null)
  const [atualizando, setAtualizando] = useState<string | null>(null)

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
        <button onClick={carregar} className="flex items-center gap-2 px-4 py-2 text-sm text-vinho border border-gray-200 rounded-full hover:bg-gray-50 transition-colors">
          <RefreshCw size={15} /> Atualizar
        </button>
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
            return (
              <div key={p.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                <button
                  className="w-full flex items-center gap-4 p-4 text-left hover:bg-gray-50 transition-colors"
                  onClick={() => setExpandido(aberto ? null : p.id)}
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <p className="text-xs font-mono text-gray-400">#{p.mp_payment_id?.slice(0, 10) || p.id.slice(0, 8).toUpperCase()}</p>
                      <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${st.cls}`}>{st.label}</span>
                    </div>
                    <p className="font-semibold text-gray-900 text-sm">{p.comprador?.nome || '—'}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {new Date(p.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {' · '}{p.frete_nome || 'Sem frete'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-vinho">R$ {Number(p.total).toFixed(2).replace('.', ',')}</p>
                    <ChevronDown size={16} className={`ml-auto mt-1 text-gray-400 transition-transform ${aberto ? 'rotate-180' : ''}`} />
                  </div>
                </button>

                {aberto && (
                  <div className="border-t border-gray-100 p-4 space-y-4">
                    {/* Itens */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Itens</p>
                      <div className="space-y-1">
                        {itens.map((item, i) => (
                          <div key={i} className="flex justify-between text-sm text-gray-600">
                            <span>{item.title} × {item.quantity}</span>
                            <span>R$ {(Number(item.unit_price) * Number(item.quantity)).toFixed(2).replace('.', ',')}</span>
                          </div>
                        ))}
                        {p.frete_preco > 0 && (
                          <div className="flex justify-between text-sm text-gray-400">
                            <span>Frete — {p.frete_nome}</span>
                            <span>R$ {Number(p.frete_preco).toFixed(2).replace('.', ',')}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Comprador */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Cliente</p>
                      <div className="text-sm text-gray-600 space-y-0.5">
                        <p>{p.comprador?.email}</p>
                        <p>{p.comprador?.telefone}</p>
                        {p.comprador?.rua && (
                          <p>{p.comprador.rua}, {p.comprador.numero} — {p.comprador.cidade}/{p.comprador.estado} — CEP {p.comprador.cep}</p>
                        )}
                      </div>
                    </div>

                    {/* Alterar status */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 mb-2">Alterar status</p>
                      <div className="flex flex-wrap gap-2">
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
                            {atualizando === p.id && p.status !== s ? <Loader2 size={12} className="animate-spin inline" /> : STATUS_MAP[s]?.label || s}
                          </button>
                        ))}
                      </div>
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
