'use client'
import { useState, useEffect } from 'react'
import { Ticket, Plus, Trash2, Power, Loader2, X, Tag, Percent, DollarSign, Truck } from 'lucide-react'

type TipoLimite = 'vitalicio' | 'primeiros_usos' | 'uso_unico' | 'data_expiracao' | 'por_cliente'
type TipoDesconto = 'percentual' | 'valor_fixo' | 'frete_gratis'

interface Cupom {
  id: string
  codigo: string
  descricao: string | null
  tipo_limite: TipoLimite
  max_usos: number | null
  usos_atuais: number
  data_expiracao: string | null
  tipo_desconto: TipoDesconto
  valor: number | null
  valor_minimo: number
  ativo: boolean
  clientes_usados: string[]
  criado_em: string
}

const TIPOS_LIMITE: { id: TipoLimite; label: string; desc: string }[] = [
  { id: 'vitalicio',      label: 'Vitalício',          desc: 'Válido até você desativar' },
  { id: 'primeiros_usos', label: 'Primeiros N usos',   desc: 'Válido para os primeiros N clientes' },
  { id: 'uso_unico',      label: 'Uso único',           desc: 'Pode ser usado apenas uma vez no total' },
  { id: 'data_expiracao', label: 'Data de expiração',   desc: 'Válido até uma data específica' },
  { id: 'por_cliente',    label: 'Por cliente',         desc: 'Cada email pode usar somente uma vez' },
]

const TIPOS_DESCONTO: { id: TipoDesconto; label: string; icon: React.ElementType }[] = [
  { id: 'percentual',  label: 'Percentual (%)',   icon: Percent     },
  { id: 'valor_fixo',  label: 'Valor fixo (R$)',  icon: DollarSign  },
  { id: 'frete_gratis', label: 'Frete grátis',   icon: Truck       },
]

const emptyForm = {
  codigo: '',
  descricao: '',
  tipo_limite: 'vitalicio' as TipoLimite,
  max_usos: '',
  data_expiracao: '',
  tipo_desconto: 'percentual' as TipoDesconto,
  valor: '',
  valor_minimo: '',
}

export default function CuponsPage() {
  const [cupons, setCupons] = useState<Cupom[]>([])
  const [loading, setLoading] = useState(true)
  const [mostrarModal, setMostrarModal] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [erro, setErro] = useState('')

  async function carregar() {
    setLoading(true)
    const res = await fetch('/api/admin/cupons')
    const data = await res.json()
    setCupons(data.cupons || [])
    setLoading(false)
  }

  useEffect(() => { carregar() }, [])

  function atualizarForm(campo: string, valor: string) {
    setForm(f => ({ ...f, [campo]: valor }))
  }

  async function salvar() {
    setErro('')
    if (!form.codigo.trim()) { setErro('Código obrigatório'); return }
    if (!form.tipo_desconto) { setErro('Tipo de desconto obrigatório'); return }
    if (form.tipo_desconto !== 'frete_gratis' && !form.valor) { setErro('Valor do desconto obrigatório'); return }
    if (form.tipo_limite === 'primeiros_usos' && !form.max_usos) { setErro('Número máximo de usos obrigatório'); return }
    if (form.tipo_limite === 'data_expiracao' && !form.data_expiracao) { setErro('Data de expiração obrigatória'); return }

    setSalvando(true)
    const res = await fetch('/api/admin/cupons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo: form.codigo,
        descricao: form.descricao || null,
        tipo_limite: form.tipo_limite,
        max_usos: form.max_usos ? Number(form.max_usos) : null,
        data_expiracao: form.data_expiracao ? new Date(form.data_expiracao).toISOString() : null,
        tipo_desconto: form.tipo_desconto,
        valor: form.valor ? Number(form.valor) : null,
        valor_minimo: form.valor_minimo ? Number(form.valor_minimo) : 0,
      }),
    })
    const data = await res.json()
    setSalvando(false)
    if (data.erro) { setErro(data.erro); return }
    setMostrarModal(false)
    setForm(emptyForm)
    carregar()
  }

  async function toggleAtivo(cupom: Cupom) {
    await fetch('/api/admin/cupons', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: cupom.id, ativo: !cupom.ativo }),
    })
    carregar()
  }

  async function excluir(id: string) {
    if (!confirm('Excluir este cupom?')) return
    await fetch(`/api/admin/cupons?id=${id}`, { method: 'DELETE' })
    carregar()
  }

  function labelDesconto(cupom: Cupom) {
    if (cupom.tipo_desconto === 'percentual') return `${cupom.valor}% off`
    if (cupom.tipo_desconto === 'valor_fixo') return `R$ ${(cupom.valor || 0).toFixed(2).replace('.', ',')} off`
    return 'Frete grátis'
  }

  function labelLimite(cupom: Cupom) {
    if (cupom.tipo_limite === 'vitalicio') return 'Vitalício'
    if (cupom.tipo_limite === 'primeiros_usos') return `${cupom.usos_atuais}/${cupom.max_usos} usos`
    if (cupom.tipo_limite === 'uso_unico') return cupom.usos_atuais >= 1 ? 'Usado' : 'Disponível (1 uso)'
    if (cupom.tipo_limite === 'data_expiracao') {
      const dt = cupom.data_expiracao ? new Date(cupom.data_expiracao) : null
      return dt ? `Expira ${dt.toLocaleDateString('pt-BR')}` : '—'
    }
    if (cupom.tipo_limite === 'por_cliente') return `${cupom.usos_atuais} usos (1/cliente)`
    return '—'
  }

  const ativos = cupons.filter(c => c.ativo).length

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="heading text-2xl">Cupons</h1>
          <p className="text-vinho/50 text-sm mt-1">{cupons.length} cupons · {ativos} ativos</p>
        </div>
        <button
          onClick={() => { setForm(emptyForm); setErro(''); setMostrarModal(true) }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={16} /> Novo cupom
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 size={28} className="animate-spin text-vinho/30" />
        </div>
      ) : cupons.length === 0 ? (
        <div className="text-center py-20 text-vinho/40">
          <Ticket size={48} className="mx-auto mb-4 opacity-30" />
          <p>Nenhum cupom cadastrado</p>
        </div>
      ) : (
        <div className="space-y-3">
          {cupons.map(cupom => (
            <div key={cupom.id} className={`card p-4 flex items-center gap-4 transition-opacity ${!cupom.ativo ? 'opacity-50' : ''}`}>
              {/* Código */}
              <div className="flex-shrink-0">
                <span className="font-mono font-bold text-vinho bg-creme px-3 py-1.5 rounded-lg text-sm tracking-wider">
                  {cupom.codigo}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                {cupom.descricao && (
                  <p className="text-vinho/60 text-xs truncate mb-1">{cupom.descricao}</p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-xs bg-vinho/10 text-vinho px-2 py-0.5 rounded-full font-medium">
                    <Tag size={10} />
                    {labelDesconto(cupom)}
                  </span>
                  <span className="text-xs text-vinho/50">{labelLimite(cupom)}</span>
                  {cupom.valor_minimo > 0 && (
                    <span className="text-xs text-vinho/40">mín. R$ {(cupom.valor_minimo).toFixed(2).replace('.', ',')}</span>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="flex-shrink-0 text-right">
                <span className={`text-xs font-semibold ${cupom.ativo ? 'text-green-600' : 'text-gray-400'}`}>
                  {cupom.ativo ? 'Ativo' : 'Inativo'}
                </span>
                <p className="text-vinho/30 text-xs">{cupom.usos_atuais} uso{cupom.usos_atuais !== 1 ? 's' : ''}</p>
              </div>

              {/* Ações */}
              <div className="flex-shrink-0 flex items-center gap-1">
                <button
                  onClick={() => toggleAtivo(cupom)}
                  title={cupom.ativo ? 'Desativar' : 'Ativar'}
                  className={`p-2 rounded-lg transition-colors ${cupom.ativo ? 'text-green-600 hover:bg-green-50' : 'text-gray-400 hover:bg-gray-50'}`}
                >
                  <Power size={16} />
                </button>
                <button
                  onClick={() => excluir(cupom.id)}
                  className="p-2 rounded-lg text-red-400 hover:bg-red-50 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal novo cupom */}
      {mostrarModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-start justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h2 className="heading text-lg">Novo cupom</h2>
              <button onClick={() => setMostrarModal(false)} className="text-vinho/40 hover:text-vinho">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Código */}
              <div>
                <label className="block text-sm font-medium text-vinho mb-1">Código <span className="text-rosa">*</span></label>
                <input
                  className="input font-mono uppercase tracking-widest"
                  placeholder="EX: DESCONTO10"
                  value={form.codigo}
                  onChange={e => atualizarForm('codigo', e.target.value.toUpperCase())}
                />
              </div>

              {/* Descrição */}
              <div>
                <label className="block text-sm font-medium text-vinho mb-1">Descrição (interna)</label>
                <input
                  className="input"
                  placeholder="Ex: Cupom inauguração"
                  value={form.descricao}
                  onChange={e => atualizarForm('descricao', e.target.value)}
                />
              </div>

              {/* Tipo de desconto */}
              <div>
                <label className="block text-sm font-medium text-vinho mb-2">Tipo de desconto <span className="text-rosa">*</span></label>
                <div className="grid grid-cols-3 gap-2">
                  {TIPOS_DESCONTO.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => atualizarForm('tipo_desconto', t.id)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 text-xs font-medium transition-all ${
                        form.tipo_desconto === t.id
                          ? 'border-vinho bg-vinho/5 text-vinho'
                          : 'border-gray-200 text-vinho/50 hover:border-gray-300'
                      }`}
                    >
                      <t.icon size={18} />
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Valor do desconto */}
              {form.tipo_desconto !== 'frete_gratis' && (
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">
                    {form.tipo_desconto === 'percentual' ? 'Percentual (%)' : 'Valor (R$)'} <span className="text-rosa">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step={form.tipo_desconto === 'percentual' ? '1' : '0.01'}
                    max={form.tipo_desconto === 'percentual' ? '100' : undefined}
                    className="input"
                    placeholder={form.tipo_desconto === 'percentual' ? '10' : '20,00'}
                    value={form.valor}
                    onChange={e => atualizarForm('valor', e.target.value)}
                  />
                </div>
              )}

              {/* Valor mínimo */}
              <div>
                <label className="block text-sm font-medium text-vinho mb-1">Valor mínimo do pedido (R$)</label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  className="input"
                  placeholder="0,00 (sem mínimo)"
                  value={form.valor_minimo}
                  onChange={e => atualizarForm('valor_minimo', e.target.value)}
                />
              </div>

              {/* Tipo de limite */}
              <div>
                <label className="block text-sm font-medium text-vinho mb-2">Tipo de validade <span className="text-rosa">*</span></label>
                <div className="space-y-2">
                  {TIPOS_LIMITE.map(t => (
                    <label
                      key={t.id}
                      className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                        form.tipo_limite === t.id
                          ? 'border-vinho bg-vinho/5'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="tipo_limite"
                        value={t.id}
                        checked={form.tipo_limite === t.id}
                        onChange={() => atualizarForm('tipo_limite', t.id)}
                        className="mt-0.5 accent-vinho flex-shrink-0"
                      />
                      <div>
                        <p className="text-sm font-medium text-vinho">{t.label}</p>
                        <p className="text-xs text-vinho/50">{t.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Max usos (primeiros_usos) */}
              {form.tipo_limite === 'primeiros_usos' && (
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Número máximo de usos <span className="text-rosa">*</span></label>
                  <input
                    type="number"
                    min="1"
                    step="1"
                    className="input"
                    placeholder="Ex: 100"
                    value={form.max_usos}
                    onChange={e => atualizarForm('max_usos', e.target.value)}
                  />
                </div>
              )}

              {/* Data expiração */}
              {form.tipo_limite === 'data_expiracao' && (
                <div>
                  <label className="block text-sm font-medium text-vinho mb-1">Data de expiração <span className="text-rosa">*</span></label>
                  <input
                    type="datetime-local"
                    className="input"
                    value={form.data_expiracao}
                    onChange={e => atualizarForm('data_expiracao', e.target.value)}
                  />
                </div>
              )}

              {erro && (
                <p className="text-red-500 text-sm bg-red-50 px-3 py-2 rounded-lg">{erro}</p>
              )}
            </div>

            <div className="flex gap-3 p-6 border-t border-gray-100">
              <button
                onClick={() => setMostrarModal(false)}
                className="flex-1 btn-secondary"
              >
                Cancelar
              </button>
              <button
                onClick={salvar}
                disabled={salvando}
                className="flex-1 btn-primary flex items-center justify-center gap-2"
              >
                {salvando ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                Criar cupom
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
