import SiteHeader from '@/components/SiteHeader'
import Footer from '@/components/Footer'
import WhatsappButton from '@/components/WhatsappButton'
import { getHomeConfig } from '@/lib/homeConfig'

export default async function StoreLayout({ children }: { children: React.ReactNode }) {
  const config = await getHomeConfig()
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <Footer />
      <WhatsappButton numero={config.whatsapp} />
    </>
  )
}
