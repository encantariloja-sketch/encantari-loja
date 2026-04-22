import type { Metadata } from 'next'
import './globals.css'
import { CartProvider } from '@/lib/CartContext'

export const metadata: Metadata = {
  title: { default: 'Encantari — Presentes & Decoração', template: '%s | Encantari' },
  description: 'Curadoria especial de presentes, decoração e lifestyle. Cafés, canecas, vasos, flores, cerâmicas, papelaria e Silvanian Families com entrega para todo o Brasil.',
  keywords: ['presentes', 'decoração', 'silvanian families', 'canecas', 'vasos', 'flores artificiais', 'cafés', 'papelaria', 'encantari'],
  openGraph: {
    title: 'Encantari — Presentes & Decoração',
    description: 'Curadoria especial de presentes e decoração com entrega para todo o Brasil.',
    type: 'website',
    locale: 'pt_BR',
  },
  themeColor: '#491E2F',
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>
        <CartProvider>
          {children}
        </CartProvider>
      </body>
    </html>
  )
}
