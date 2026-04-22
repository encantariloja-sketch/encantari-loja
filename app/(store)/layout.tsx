import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <Footer />
    </>
  )
}
