'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ArrowLeft, Truck, CreditCard, Loader2 } from 'lucide-react'
import { useCart } from '@/lib/CartContext'

type Frete = { nome: string; preco: number; prazo: string; id: string }

const STORAGE_KEY = 'encantari_checkout_dados'

const dadosVazios = {
  nome: '', email: '', cpf: '', telefone: '',
  cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
}

export default function CheckoutPage() {
  const { itens, totalPreco, limpar } = useCart()
  const [etapa, setEtapa] = useState<'dados' | 'frete' | 'pagamento'>('dados')
  const [loading, setLoading] = useState(false)
  const [opcoesFretes, setOpcoesFretes] = useState<Frete[]>([])
  const [freteEscolhido, setFreteEscolhido] = useState<Frete | null>(null)
  const [dados, setDados] = useState(dadosVazios)

  // Carrega dados salvos + sessão do usuário logado
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try { setDados(JSON.parse(saved)) } catch {}
    }
    // Pré-preenche todos os campos da sessão Supabase se logado
    import('@/lib/supabase').then(({ getSupabase }) => {
      getSupabase().auth.getSession().then(({ data: { session } }) => {
        if (!session) return
        const meta = session.user.user_metadata || {}
        setDados(d => ({
          nome: d.nome || meta.nome || '',
          email: d.email || session.user.email || '',
          cpf: d.cpf || meta.cpf || '',
          telefone: d.telefone || meta.telefone || '',
          cep: d.cep || meta.cep || '',
          rua: d.rua || meta.rua || '',
          numero: d.numero || meta.numero || '',
          complemento: d.complemento || meta.complemento || '',
          bairro: d.bairro || meta.bairro || '',
          cidade: d.cidade || meta.cidade || '',
          estado: d.estado || meta.estado || '',
        }))
      })
    }).catch(() => {})
  }, [])

  // Persiste no localStorage sempre que dados mudar
  useEffect(() => {
    if (Object.values(dados).some(v => v)) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dados))
    }
  }, [dados])

  function atualizar(campo: string, valor: string) {
    setDados(d => ({ ...d, [campo]: valor }))
  }

  async function buscarCep() {
    const cepLimpo = dados.cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const d = await res.json()
      if (!d.erro) setDados(p => ({ ...p, rua: d.logradouro, bairro: d.bairro, cidade: d.localidade, estado: d.uf }))
    } catch {}
  }

  async function calcularFrete() {
    setLoading(true)
    try {
      const res = await fetch('/api/frete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cep_destino: dados.cep.replace(/\D/g, ''),
          produtos: itens.map(i => ({
            id: i.produto.id,
            quantidade: i.quantidade,
            peso: i.produto.peso || 0.3,
            dimensoes: i.produto.dimensoes,
          })),
        }),
      })
      const data = await res.json()
      setOpcoesFretes(data.opcoes || [])
      setEtapa('frete')
    } catch {
      alert('Erro ao calcular frete. Tente novamente.')
    }
    setLoading(false)
  }

  async function finalizarCompra() {
    if (!freteEscolhido) return
    setLoading(true)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itens, dados, frete: freteEscolhido }),
      })
      const data = await res.json()
      if (data.url) {
        limpar()
        localStorage.removeItem(STORAGE_KEY)
        // Salva dados do cliente no perfil Supabase (sem aguardar)
        import('@/lib/supabase').then(({ getSupabase }) => {
          const sb = getSupabase()
          sb.auth.getSession().then(({ data: { session } }) => {
            if (!session) return
            sb.auth.updateUser({ data: {
              nome: dados.nome, cpf: dados.cpf, telefone: dados.telefone,
              cep: dados.cep, rua: dados.rua, numero: dados.numero,
              complemento: dados.complemento, bairro: dados.bairro,
              cidade: dados.cidade, estado: dados.estado,
            }})
          })
        }).catch(() => {})
        window.location.href = data.url
      }
    } catch {
      alert('Erro ao finalizar compra. Tente novamente.')
    }
    setLoading(false)
  }

  if (itens.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center">
        <p className="text-vinho/60 mb-4">Seu carrinho está vazio.</p>
        <Link href="/produtos" className="btn-primary">Ver produtos</Link>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <Link href="/carrinho" className="inline-flex items-center gap-2 text-vinho/60 hover:text-vinho mb-8 text-sm">
        <ArrowLeft size={16} /> Voltar ao carrinho
      </Link>
      <h1 className="heading text-3xl mb-8">Checkout</h1>

      {/* Progresso */}
      <div className="flex items-center gap-2 mb-10 text-sm">
        {(['dados', 'frete', 'pagamento'] as const).map((e, i) => (
          <div key={e} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${etapa === e || (i < ['dados','frete','pagamento'].indexOf(etapa)) ? 'bg-vinho text-creme' : 'bg-creme-dark text-vinho/40'}`}>
              {i + 1}
            </div>
            <span className={etapa === e ? 'text-vinho font-medium' : 'text-vinho/40'}>
              {e === 'dados' ? 'Dados' : e === 'frete' ? 'Frete' : 'Pagamento'}
            </span>
            {i < 2 && <div className="w-6 h-px bg-gray-200" />}
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          {/* Etapa 1: Dados */}
          {etapa === 'dados' && (
            <div className="space-y-4">
              <h2 className="heading text-xl">Dados pessoais</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Nome completo <span className="text-rosa">*</span></label>
                  <input className="input" value={dados.nome} onChange={e => atualizar('nome', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Email <span className="text-rosa">*</span></label>
                  <input type="email" className="input" value={dados.email} onChange={e => atualizar('email', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">CPF</label>
                  <input className="input" placeholder="000.000.000-00" value={dados.cpf} onChange={e => atualizar('cpf', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Telefone</label>
                  <input className="input" placeholder="(00) 00000-0000" value={dados.telefone} onChange={e => atualizar('telefone', e.target.value)} />
                </div>
              </div>
              <h2 className="heading text-xl pt-4">Endereço de entrega</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">CEP <span className="text-rosa">*</span></label>
                  <input className="input" placeholder="00000-000" value={dados.cep}
                    onChange={e => atualizar('cep', e.target.value)}
                    onBlur={buscarCep}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Rua <span className="text-rosa">*</span></label>
                  <input className="input" value={dados.rua} onChange={e => atualizar('rua', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Número <span className="text-rosa">*</span></label>
                  <input className="input" value={dados.numero} onChange={e => atualizar('numero', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Complemento</label>
                  <input className="input" value={dados.complemento} onChange={e => atualizar('complemento', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Bairro <span className="text-rosa">*</span></label>
                  <input className="input" value={dados.bairro} onChange={e => atualizar('bairro', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Cidade <span className="text-rosa">*</span></label>
                  <input className="input" value={dados.cidade} onChange={e => atualizar('cidade', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Estado <span className="text-rosa">*</span></label>
                  <input className="input" maxLength={2} value={dados.estado} onChange={e => atualizar('estado', e.target.value)} />
                </div>
              </div>
              <button
                onClick={calcularFrete}
                disabled={loading || !dados.nome || !dados.email || !dados.cep || !dados.rua || !dados.numero || !dados.bairro || !dados.cidade || !dados.estado}
                className="btn-primary w-full flex items-center justify-center gap-2 mt-4"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Truck size={18} />}
                Calcular frete
              </button>
            </div>
          )}

          {/* Etapa 2: Frete */}
          {etapa === 'frete' && (
            <div className="space-y-4">
              <h2 className="heading text-xl">Escolha o frete</h2>
              {opcoesFretes.map(op => (
                <label
                  key={op.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                    freteEscolhido?.id === op.id ? 'border-vinho bg-creme' : 'border-gray-200 hover:border-rosa'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="frete"
                      checked={freteEscolhido?.id === op.id}
                      onChange={() => setFreteEscolhido(op)}
                      className="accent-vinho"
                    />
                    <div>
                      <p className="font-medium text-vinho">{op.nome}</p>
                      <p className="text-vinho/50 text-sm">{op.prazo}</p>
                    </div>
                  </div>
                  <span className="font-bold text-vinho">
                    {op.preco === 0 ? 'Grátis' : `R$ ${op.preco.toFixed(2).replace('.', ',')}`}
                  </span>
                </label>
              ))}
              <button
                onClick={() => { if (freteEscolhido) setEtapa('pagamento') }}
                disabled={!freteEscolhido}
                className="btn-primary w-full"
              >
                Continuar para pagamento
              </button>
            </div>
          )}

          {/* Etapa 3: Pagamento */}
          {etapa === 'pagamento' && (
            <div className="space-y-4">
              <h2 className="heading text-xl">Pagamento</h2>
              <div className="bg-creme-dark rounded-2xl p-6 text-center">
                <CreditCard size={48} className="mx-auto text-vinho/40 mb-3" />
                <p className="text-vinho/70 mb-2">Você será redirecionado para o Mercado Pago.</p>
                <p className="text-xs text-vinho/50">Aceitamos cartão de crédito, débito, Pix e boleto.</p>
              </div>
              <button
                onClick={finalizarCompra}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <CreditCard size={18} />}
                Pagar com Mercado Pago
              </button>
            </div>
          )}
        </div>

        {/* Resumo lateral */}
        <div>
          <div className="card p-5 sticky top-24">
            <h3 className="heading text-lg mb-4">Seu pedido</h3>
            <div className="space-y-2 text-sm mb-4">
              {itens.map(({ produto, quantidade, chave }) => (
                <div key={chave} className="flex justify-between text-vinho/70">
                  <span className="truncate mr-2">{produto.nome} ×{quantidade}</span>
                  <span>R$ {(produto.preco * quantidade).toFixed(2).replace('.', ',')}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-creme-dark pt-3 space-y-1 text-sm">
              <div className="flex justify-between text-vinho/70">
                <span>Subtotal</span>
                <span>R$ {totalPreco.toFixed(2).replace('.', ',')}</span>
              </div>
              {freteEscolhido && (
                <div className="flex justify-between text-vinho/70">
                  <span>Frete ({freteEscolhido.nome})</span>
                  <span>{freteEscolhido.preco === 0 ? 'Grátis' : `R$ ${freteEscolhido.preco.toFixed(2).replace('.', ',')}`}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-vinho text-base pt-1">
                <span>Total</span>
                <span>R$ {(totalPreco + (freteEscolhido?.preco || 0)).toFixed(2).replace('.', ',')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
