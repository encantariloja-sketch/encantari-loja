import Header from './Header'
import { getHomeConfig } from '@/lib/homeConfig'

export default async function SiteHeader() {
  const config = await getHomeConfig()
  return <Header topbar={config.topbar} />
}
