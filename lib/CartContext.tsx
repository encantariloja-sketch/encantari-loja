'use client'
import { createContext, useContext, useEffect, useReducer } from 'react'
import type { Produto, VariacaoSelecionada } from '@/data/produtos'

export type ItemCarrinho = {
  chave: string
  produto: Produto
  quantidade: number
  variacao?: VariacaoSelecionada
}

type Estado = { itens: ItemCarrinho[] }
type Acao =
  | { tipo: 'ADICIONAR'; produto: Produto; quantidade?: number; variacao?: VariacaoSelecionada }
  | { tipo: 'REMOVER'; chave: string }
  | { tipo: 'ALTERAR_QUANTIDADE'; chave: string; quantidade: number }
  | { tipo: 'LIMPAR' }
  | { tipo: 'CARREGAR'; itens: ItemCarrinho[] }

function gerarChave(produtoId: string, variacao?: VariacaoSelecionada): string {
  if (!variacao || Object.keys(variacao).length === 0) return produtoId
  const sufixo = Object.entries(variacao)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return `${produtoId}::${sufixo}`
}

function reducer(estado: Estado, acao: Acao): Estado {
  switch (acao.tipo) {
    case 'ADICIONAR': {
      const chave = gerarChave(acao.produto.id, acao.variacao)
      const existente = estado.itens.find(i => i.chave === chave)
      if (existente) {
        return {
          itens: estado.itens.map(i =>
            i.chave === chave
              ? { ...i, quantidade: i.quantidade + (acao.quantidade ?? 1) }
              : i
          ),
        }
      }
      return {
        itens: [
          ...estado.itens,
          { chave, produto: acao.produto, quantidade: acao.quantidade ?? 1, variacao: acao.variacao },
        ],
      }
    }
    case 'REMOVER':
      return { itens: estado.itens.filter(i => i.chave !== acao.chave) }
    case 'ALTERAR_QUANTIDADE':
      if (acao.quantidade <= 0) return { itens: estado.itens.filter(i => i.chave !== acao.chave) }
      return {
        itens: estado.itens.map(i =>
          i.chave === acao.chave ? { ...i, quantidade: acao.quantidade } : i
        ),
      }
    case 'LIMPAR':
      return { itens: [] }
    case 'CARREGAR':
      return {
        itens: acao.itens.map(item => ({
          ...item,
          chave: item.chave || gerarChave(item.produto.id, item.variacao),
        })),
      }
    default:
      return estado
  }
}

type Contexto = {
  itens: ItemCarrinho[]
  totalItens: number
  totalPreco: number
  adicionar: (produto: Produto, quantidade?: number, variacao?: VariacaoSelecionada) => void
  remover: (chave: string) => void
  alterarQuantidade: (chave: string, quantidade: number) => void
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
        adicionar: (produto, quantidade, variacao) =>
          dispatch({ tipo: 'ADICIONAR', produto, quantidade, variacao }),
        remover: (chave) => dispatch({ tipo: 'REMOVER', chave }),
        alterarQuantidade: (chave, quantidade) =>
          dispatch({ tipo: 'ALTERAR_QUANTIDADE', chave, quantidade }),
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
