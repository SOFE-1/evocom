import { Outlet } from 'react-router-dom'
import { Footer } from './Footer'
import { Header } from './Header'
import { QuoteDrawer } from './QuoteDrawer'

export function PublicLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-paper">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
      <QuoteDrawer />
    </div>
  )
}
