'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Check, Loader2, ChevronUp, ChevronDown, Edit2, X, ImagePlus } from 'lucide-react'

type Categoria = { id: string; nome: string; icone: string; cor: string; ordem: number; imagem?: string }

const ICONES_SUGERIDOS = ['☕','🫖','🏺','🌸','🪴','📓','🐿️','🎁','🕯️','🧁','🍵','🎨','📚','🌿','🏡','✨','💐','🧸','🎀','🖼️','🍫','🪞','🧶','🌙','🎭']

const CORES_SUGERIDAS = [
  '#C4956A','#EF9493','#8F9150','#D4848A','#9B6B50',
  '#6B7A8D','#C49A6C','#491E2F','#8B7355','#5C8A7A',
]

async function uploadImagem(file: File): Promise<string | null> {
  const fd = new FormData()
  fd.append('file', file)
  fd.append('prefix', 'categorias')
  const res = await fetch('/api/admin/upload', { method: 'POST', body: fd })
  const { url } = await res.json()
  return url || null
}

export default function AdminCategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([])
  const [carregando, setCarregando] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [mostraForm, setMostraForm] = useState(false)
  const [editando, setEditando] = useState<Categoria | null>(null)
  const [uploadandoNova, setUploadandoNova] = useState(false)
  const [uploadandoEdit, setUploadandoEdit] = useState(false)

  const [form, setForm] = useState({ nome: '', icone: '✨', cor: '#EF9493', imagem: '' })

  const novaImgRef = useRef<HTMLInputElement>(null)
  const editImgRef = useRef<HTMLInputElement>(null)

  useEffect(() => { carregar() }, [])

  async function carregar() {
    setCarregando(true)
    try {
      const res = await fetch('/api/admin/categorias')
      const data = await res.json()
      setCategorias(data.categorias || [])
    } catch {}
    setCarregando(false)
  }

  function gerarId(nome: string) {
    return nome.toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
  }

  async function uploadNovaImagem(file: File) {
    setUploadandoNova(true)
    const url = await uploadImagem(file)
    if (url) setForm(f => ({ ...f, imagem: url }))
    setUploadandoNova(false)
  }

  async function uploadEditImagem(file: File) {
    setUploadandoEdit(true)
    const url = await uploadImagem(file)
    if (url) setEditando(ed => ed ? { ...ed, imagem: url } : ed)
    setUploadandoEdit(false)
  }

  async function salvarNova() {
    if (!form.nome.trim()) return
    setSalvando(true)
    const novaOrdem = Math.max(...categorias.map(c => c.ordem), 0) + 1
    const payload: Categoria = {
      id: gerarId(form.nome),
      nome: form.nome.trim(),
      icone: form.icone,
      cor: form.cor,
      ordem: novaOrdem,
      ...(form.imagem ? { imagem: form.imagem } : {}),
    }
    try {
      await fetch('/api/admin/categorias', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      setCategorias(prev => [...prev, payload])
      setForm({ nome: '', icone: '✨', cor: '#EF9493', imagem: '' })
      setMostraForm(false)
    } catch {}
    setSalvando(false)
  }

  async function salvarEdicao() {
    if (!editando) return
    setSalvando(true)
    try {
      await fetch('/api/admin/categorias', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editando),
      })
      setCategorias(prev => prev.map(c => c.id === editando.id ? editando : c))
      setEditando(null)
    } catch {}
    setSalvando(false)
  }

  async function excluir(id: string) {
    if (!confirm('Excluir esta categoria?')) return
    try {
      await fetch(`/api/admin/categorias?id=${id}`, { method: 'DELETE' })
      setCategorias(prev => prev.filter(c => c.id !== id))
    } catch {}
  }

  async function mover(id: string, dir: 'up' | 'down') {
    const arr = [...categorias]
    const idx = arr.findIndex(c => c.id === id)
    if (dir === 'up' && idx > 0) { [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]] }
    if (dir === 'down' && idx < arr.length - 1) { [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]] }
    const atualizadas = arr.map((c, i) => ({ ...c, ordem: i + 1 }))
    setCategorias(atualizadas)
    for (const cat of atualizadas) {
      await fetch('/api/admin/categorias', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: cat.id, ordem: cat.ordem }),
      })
    }
  }

  if (carregando) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin text-vinho" />
    </div>
  )

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Categorias</h1>
          <p className="text-gray-400 text-sm">{categorias.length} categorias</p>
        </div>
        <button
          onClick={() => { setMostraForm(true); setEditando(null) }}
          className="flex items-center gap-2 bg-vinho text-creme px-4 py-2.5 rounded-full text-sm font-semibold hover:bg-vinho-light transition-colors touch-target"
        >
          <Plus size={16} /> Nova
        </button>
      </div>

      {/* Formulário nova categoria */}
      {mostraForm && (
        <div className="bg-white rounded-2xl border-2 border-rosa/30 p-4 mb-4 space-y-4">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900">Nova categoria</p>
            <button onClick={() => setMostraForm(false)} className="p-1 text-gray-400"><X size={18} /></button>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-500 mb-1">Nome</label>
            <input
              autoFocus
              value={form.nome}
              onChange={e => setForm(f => ({ ...f, nome: e.target.value }))}
              placeholder="Ex: Roupas, Joias, Livros..."
              className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rosa"
            />
            {form.nome && (
              <p className="text-xs text-gray-400 mt-1">ID: <span className="font-mono">{gerarId(form.nome)}</span></p>
            )}
          </div>

          {/* Foto de capa */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Foto de capa <span className="text-gray-400 font-normal">(opcional — substitui o ícone)</span></label>
            <input
              ref={novaImgRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={e => e.target.files?.[0] && uploadNovaImagem(e.target.files[0])}
            />
            {form.imagem ? (
              <div className="relative inline-block">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={form.imagem} alt="Capa" className="w-20 h-20 rounded-2xl object-cover border border-gray-200" />
                <button
                  onClick={() => setForm(f => ({ ...f, imagem: '' }))}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white"
                >
                  <X size={12} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => novaImgRef.current?.click()}
                disabled={uploadandoNova}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm hover:border-rosa hover:text-rosa transition-all disabled:opacity-50"
              >
                {uploadandoNova ? <Loader2 size={16} className="animate-spin" /> : <ImagePlus size={16} />}
                {uploadandoNova ? 'Enviando...' : 'Adicionar foto de capa'}
              </button>
            )}
          </div>

          {/* Ícone */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Ícone <span className="text-2xl ml-1">{form.icone}</span></label>
            <div className="flex flex-wrap gap-2">
              {ICONES_SUGERIDOS.map(ico => (
                <button
                  key={ico}
                  onClick={() => setForm(f => ({ ...f, icone: ico }))}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center border-2 transition-all ${form.icone === ico ? 'border-vinho bg-vinho/5' : 'border-gray-100'}`}
                >
                  {ico}
                </button>
              ))}
              <input
                type="text"
                value={form.icone}
                onChange={e => setForm(f => ({ ...f, icone: e.target.value }))}
                placeholder="outro"
                className="w-16 border border-gray-200 rounded-xl px-2 py-1 text-center text-lg"
                maxLength={4}
              />
            </div>
          </div>

          {/* Cor */}
          <div>
            <label className="block text-xs font-medium text-gray-500 mb-2">Cor de fundo do card</label>
            <div className="flex gap-2 flex-wrap items-center">
              {CORES_SUGERIDAS.map(cor => (
                <button
                  key={cor}
                  onClick={() => setForm(f => ({ ...f, cor }))}
                  className={`w-8 h-8 rounded-full border-2 transition-all ${form.cor === cor ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: cor }}
                />
              ))}
              <input
                type="color"
                value={form.cor}
                onChange={e => setForm(f => ({ ...f, cor: e.target.value }))}
                className="w-8 h-8 rounded-full cursor-pointer border-0"
              />
            </div>
            {/* Preview */}
            <div className="mt-3 flex items-center gap-3 p-3 rounded-xl border border-gray-100">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl overflow-hidden"
                style={form.imagem ? {} : { backgroundColor: form.cor + '33' }}
              >
                {form.imagem
                  ? <img src={form.imagem} alt="" className="w-full h-full object-cover" />
                  : form.icone
                }
              </div>
              <span className="font-medium text-sm text-gray-900">{form.nome || 'Nome da categoria'}</span>
            </div>
          </div>

          <button
            onClick={salvarNova}
            disabled={salvando || !form.nome.trim()}
            className="w-full py-3.5 bg-vinho text-creme rounded-full font-semibold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {salvando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
            Criar categoria
          </button>
        </div>
      )}

      {/* Lista de categorias */}
      <div className="space-y-2">
        {categorias.map((cat, idx) => (
          <div key={cat.id}>
            {/* Modo edição */}
            {editando?.id === cat.id ? (
              <div className="bg-white rounded-2xl border-2 border-vinho/30 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-gray-900">Editar — {cat.nome}</p>
                  <button onClick={() => setEditando(null)}><X size={18} className="text-gray-400" /></button>
                </div>

                <input
                  value={editando.nome}
                  onChange={e => setEditando(ed => ed ? { ...ed, nome: e.target.value } : ed)}
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-rosa"
                />

                {/* Foto de capa (edit) */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-2">Foto de capa</label>
                  <input
                    ref={editImgRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => e.target.files?.[0] && uploadEditImagem(e.target.files[0])}
                  />
                  {editando.imagem ? (
                    <div className="flex items-center gap-3">
                      <div className="relative inline-block">
                        <img src={editando.imagem} alt="Capa" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                        <button
                          onClick={() => setEditando(ed => ed ? { ...ed, imagem: '' } : ed)}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white"
                        >
                          <X size={10} />
                        </button>
                      </div>
                      <button onClick={() => editImgRef.current?.click()} className="text-xs text-rosa underline">Trocar foto</button>
                    </div>
                  ) : (
                    <button
                      onClick={() => editImgRef.current?.click()}
                      disabled={uploadandoEdit}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border-2 border-dashed border-gray-200 text-gray-400 text-sm hover:border-rosa hover:text-rosa transition-all disabled:opacity-50"
                    >
                      {uploadandoEdit ? <Loader2 size={14} className="animate-spin" /> : <ImagePlus size={14} />}
                      {uploadandoEdit ? 'Enviando...' : 'Adicionar foto'}
                    </button>
                  )}
                </div>

                {/* Ícones */}
                <div className="flex flex-wrap gap-2">
                  {ICONES_SUGERIDOS.map(ico => (
                    <button key={ico} onClick={() => setEditando(ed => ed ? { ...ed, icone: ico } : ed)}
                      className={`w-9 h-9 rounded-xl text-lg flex items-center justify-center border-2 ${editando.icone === ico ? 'border-vinho' : 'border-gray-100'}`}>
                      {ico}
                    </button>
                  ))}
                </div>

                {/* Cores */}
                <div className="flex gap-2 flex-wrap items-center">
                  {CORES_SUGERIDAS.map(cor => (
                    <button key={cor} onClick={() => setEditando(ed => ed ? { ...ed, cor } : ed)}
                      className={`w-7 h-7 rounded-full border-2 ${editando.cor === cor ? 'border-gray-900 scale-110' : 'border-transparent'}`}
                      style={{ backgroundColor: cor }} />
                  ))}
                  <input type="color" value={editando.cor} onChange={e => setEditando(ed => ed ? { ...ed, cor: e.target.value } : ed)} className="w-7 h-7 rounded-full cursor-pointer border-0" />
                </div>

                <button onClick={salvarEdicao} disabled={salvando} className="w-full py-3 bg-vinho text-creme rounded-full font-semibold text-sm flex items-center justify-center gap-2">
                  {salvando ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                  Salvar
                </button>
              </div>
            ) : (
              /* Card normal */
              <div className="flex items-center gap-3 bg-white rounded-2xl border border-gray-100 p-3.5">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 overflow-hidden"
                  style={cat.imagem ? {} : { backgroundColor: (cat.cor || '#EF9493') + '33' }}
                >
                  {cat.imagem
                    ? <img src={cat.imagem} alt={cat.nome} className="w-full h-full object-cover" />
                    : cat.icone
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{cat.nome}</p>
                  <p className="text-gray-400 text-xs font-mono">{cat.id}</p>
                </div>
                {/* Ações */}
                <div className="flex items-center gap-1">
                  <div className="flex flex-col gap-0.5">
                    <button onClick={() => mover(cat.id, 'up')} disabled={idx === 0} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                      <ChevronUp size={14} />
                    </button>
                    <button onClick={() => mover(cat.id, 'down')} disabled={idx === categorias.length - 1} className="p-1 text-gray-300 hover:text-gray-600 disabled:opacity-20">
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <button onClick={() => setEditando(cat)} className="p-2.5 text-gray-400 hover:text-vinho transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => excluir(cat.id)} className="p-2.5 text-gray-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {categorias.length === 0 && !mostraForm && (
        <div className="text-center py-16 text-gray-400">
          <p className="text-4xl mb-3">📂</p>
          <p className="text-sm">Nenhuma categoria. Crie a primeira!</p>
        </div>
      )}
    </div>
  )
}
