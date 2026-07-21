import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useAuthStore } from '@/stores/auth.store'

// Layout
import { AppLayout } from '@/components/layout/AppLayout'

// ... (imports remain the same up to queryClient)
import LandingPage from '@/pages/landing/LandingPage'
import LoginPage from '@/pages/auth/LoginPage'
import DashboardPage from '@/pages/dashboard/DashboardPage'
import ProjectsPage from '@/pages/projects/ProjectsPage'
import ProjectDetailPage from '@/pages/projects/ProjectDetailPage'
import QuotationListPage from '@/pages/invoice/quotation/QuotationListPage'
import QuotationDetailPage from '@/pages/invoice/quotation/QuotationDetailPage'
import InvoiceListPage from '@/pages/invoice/invoice/InvoiceListPage'
import InvoiceDetailPage from '@/pages/invoice/invoice/InvoiceDetailPage'
import PlatformPage from '@/pages/platform/PlatformPage'
import RateCardPage from '@/pages/ratecard/RateCardPage'
import PublicRateCardPage from '@/pages/ratecard/PublicRateCardPage'
import PublicInvoicePage from '@/pages/invoice/invoice/PublicInvoicePage'
import PublicQuotationPage from '@/pages/invoice/quotation/PublicQuotationPage'
import FinancePage from '@/pages/finance/FinancePage'
import UsersPage from '@/pages/users/UsersPage'
import RolesPage from '@/pages/roles/RolesPage'
import SettingsPage from '@/pages/settings/SettingsPage'

const queryClient = new QueryClient()

export default function App() {
  const fetchProfile = useAuthStore(state => state.fetchProfile)
  const isLoading = useAuthStore(state => state.isLoading)

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center">Loading...</div>
  }

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/public/ratecard" element={<PublicRateCardPage />} />
          <Route path="/public/quotation/:id" element={<PublicQuotationPage />} />
          <Route path="/public/invoice/:id" element={<PublicInvoicePage />} />

          {/* Protected app routes */}
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectDetailPage />} />
            <Route path="/invoice/quotation" element={<QuotationListPage />} />
            <Route path="/invoice/quotation/:id" element={<QuotationDetailPage />} />
            <Route path="/invoice/invoice" element={<InvoiceListPage />} />
            <Route path="/invoice/invoice/:id" element={<InvoiceDetailPage />} />
            <Route path="/platform" element={<PlatformPage />} />
            <Route path="/ratecard" element={<RateCardPage />} />
            <Route path="/finance" element={<FinancePage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/roles" element={<RolesPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
