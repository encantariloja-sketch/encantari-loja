'use client'
import { createContext, useContext, useEffect, useReducer } from 'react'
import type { Produto } from '@/data/produtos'

type ItemCarrinho = { produto: Produto; quantidade: number }
type Estado = { itens: ItemCarrinho[] }
type Acao =
  | { tipo: 'ADICIONAR'; produto: Produto; quantidade?: number }
  | { tipo: 'REMOVER'; id: string }
  | { tipo: 'ALTERAR_QUANTIDADE'; id: string; quantidade: number }
  | { tipo: 'LIMPAR' }
  | { tipo: 'CARREGAR'; itens: ItemCarrinho[] }

function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case 'ADICIONAR': {
      const existente = estado.itens.find(i => i.produto.id === acao.produto.id)
      if (existente) {
        return {
          itens: estado.itens.map(i =>
            i.produto.id === acao.produto.id
              ? { ...i, quantidade: i.quantidade + (acao.quantidade ?? 1) }
              : i
          ),
        }
      }
      return { itens: [...estado.itens, { produto: acao.produto, quantidade: acao.quantidade ?? 1 }] }
    }
    case 'REMOVER':
      return { itens: estado.itens.filter(i => i.produto.id !== acao.id) }
    case 'ALTERAR_QUANTIDADE':
      if (acao.quantidade <= 0) return { itens: estado.itens.filter(i => i.produto.id !== acao.id) }
      return {
        itens: estado.itens.map(i =>
          i.produto.id === acao.id ? { ...i, quantidade: acao.quantidade } : i
        ),
      }
    case 'LIMPAR':
      return { itens: [] }
    case 'CARREGAR':
      return { itens: acao.itens }
    default:
      return estado
  }
}

type Contexto = {
  itens: ItemCarrinho[]
  totalItens: number
  totalPreco: number
  adicionar: (produto: Produto, quantidade?: number) => void
  remover: (id: string) => void
  alterarQuantidade: (id: string, quantidade: number) => void
  limpar: () => void
}

const CartContext = createContext<Contexto | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [estado, dispatch] = useReducer(reducer, { itens: [] })

  useEffect(() => {
    try {
      const salvo = localStorage.getItem('encantari-carrinho')
      if (salvo) dispatch({ tipo: 'CARREGAR', itens: JSON.parse(salvo) })
    } catch {}
  }, [])

  useEffect(() => {
    localStorage.setItem('encantari-carrinho', JSON.stringify(estado.itens))
  }, [estado.itens])

  const totalItens = estado.itens.reduce((acc, i) => acc + i.quantidade, 0)
  const totalPreco = estado.itens.reduce((acc, i) => acc + i.produto.preco * i.quantidade, 0)

  return (
    <CartContext.Provider
      value={{
        itens: estado.itens,
        totalItens,
        totalPreco,
        adicionar: (produto, quantidade) => dispatch({ tipo: 'ADICIONAR', produto, quantidade }),
        remover: (id) => dispatch({ tipo: 'REMOVER', id }),
        alterarQuantidade: (id, quantidade) => dispatch({ tipo: 'ALTERAR_QUANTIDADE', id, quantidade }),
        limpar: () => dispatch({ tipo: 'LIMPAR' }),
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart deve ser usado dentro de CartProvider')
  return ctx
}
