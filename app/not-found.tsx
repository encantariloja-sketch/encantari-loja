import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center">
        <p className="font-fraunces text-8xl font-bold text-rosa mb-4">404</p>
        <h1 className="heading text-3xl mb-3">Página não encontrada</h1>
        <p className="text-vinho/60 mb-8">A página que você procura não existe ou foi movida.</p>
        <Link href="/" className="btn-primary">Voltar à home</Link>
      </div>
    </div>
  )
}
