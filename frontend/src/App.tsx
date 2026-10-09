import { useEffect } from 'react'
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { QuoteCartProvider } from './context/QuoteCartContext'
import { PublicLayout } from './components/PublicLayout'
import { AboutPage } from './pages/AboutPage'
import { ContactPage } from './pages/ContactPage'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'
import { ProductDetailPage } from './pages/ProductDetailPage'
import { ProductsPage } from './pages/ProductsPage'
import { ServicesPage } from './pages/ServicesPage'
import { AdminLayout } from './pages/admin/AdminLayout'
import { CatalogPage } from './pages/admin/CatalogPage'
import { LoginPage } from './pages/admin/LoginPage'
import { RequestsPage } from './pages/admin/RequestsPage'
import { SchedulePage } from './pages/admin/SchedulePage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])
  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <QuoteCartProvider>
          <ScrollToTop />
          <Routes>
            <Route element={<PublicLayout />}>
              <Route index element={<HomePage />} />
              <Route path="about" element={<AboutPage />} />
              <Route path="services" element={<ServicesPage />} />
              <Route path="products" element={<ProductsPage />} />
              <Route path="products/:slug" element={<ProductDetailPage />} />
              <Route path="contact" element={<ContactPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
            <Route path="admin/login" element={<LoginPage />} />
            <Route path="admin" element={<AdminLayout />}>
              <Route index element={<RequestsPage />} />
              <Route path="schedule" element={<SchedulePage />} />
              <Route path="catalog" element={<CatalogPage />} />
            </Route>
          </Routes>
        </QuoteCartProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
