import { useLocation } from 'react-router-dom'
import { useRouteLoading } from './hooks/useRouteLoading'
import PageLoader from './components/common/PageLoader'
import Navbar from './components/common/Navbar'
import Footer from './components/common/Footer'
import AppRoutes from './routes/AppRoutes'

export default function App() {
  const loading = useRouteLoading()
  const { pathname } = useLocation()
  const isAdmin = pathname.startsWith('/admin')

  if (isAdmin) return <AppRoutes />

  return (
    <div className="min-h-screen flex flex-col">
      {loading && <PageLoader />}
      <Navbar />
      <main className="flex-1"><AppRoutes /></main>
      <Footer />
    </div>
  )
}
