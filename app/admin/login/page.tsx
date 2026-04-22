'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'

export default function AdminLoginPage() {
  const router = useRouter()
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ senha }),
      })
      if (res.ok) {
        router.push('/admin')
        router.refresh()
      } else {
        setErro('Senha incorreta.')
      }
    } catch {
      setErro('Erro ao conectar.')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-creme flex items-center justify-center px-4">
      <div className="card p-8 w-full max-w-sm">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-vinho rounded-full flex items-center justify-center mx-auto mb-3">
            <Lock size={20} className="text-creme" />
          </div>
          <h1 className="font-fraunces text-2xl font-semibold text-vinho">Admin</h1>
          <p className="text-vinho/50 text-sm mt-1">encantari</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-vinho mb-1">Senha</label>
            <input
              type="password"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              className="input"
              placeholder="••••••••"
              autoFocus
            />
          </div>
          {erro && <p className="text-red-500 text-sm">{erro}</p>}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  )
}
