import { lazy, Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import Layout from './components/layout/Layout'
import StaffLayout from './components/layout/StaffLayout'
import LoginPage from './features/auth/pages/LoginPage'
import StaffEntryPage from './pages/StaffEntryPage'
import LoadingSpinner from './components/common/LoadingSpinner'
import ProtectedRoute from './components/common/ProtectedRoute'
import StaffRoute from './components/common/StaffRoute'
import { initializeStaffMode } from './store/slices/staffSlice'

// Lazy load pages for code splitting
const DashboardPage = lazy(() => import('./features/dashboard/pages/DashboardPage'))
const CategoriesPage = lazy(() => import('./features/categories/pages/CategoriesPage'))
const ProductsPage = lazy(() => import('./features/products/pages/ProductsPage'))
const ProductDetailPage = lazy(() => import('./features/products/pages/ProductDetailPage'))
const CustomersPage = lazy(() => import('./features/customers/pages/CustomersPage'))
const CustomerDetailPage = lazy(() => import('./features/customers/pages/CustomerDetailPage'))
const BillingPage = lazy(() => import('./features/billing/pages/BillingPage'))
const SalesPage = lazy(() => import('./features/sales/pages/SalesPage'))
const SaleDetailPage = lazy(() => import('./features/sales/pages/SaleDetailPage'))
const ReportsPage = lazy(() => import('./features/reports/pages/ReportsPage'))
const DiscountsPage = lazy(() => import('./features/discounts/pages/DiscountsPage'))
const SettingsPage = lazy(() => import('./features/settings/pages/SettingsPage'))
const InventoryPage = lazy(() => import('./features/inventory/pages/InventoryPage'))
const ProfilePage = lazy(() => import('./features/profile/pages/ProfilePage'))

function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    // Initialize staff mode from localStorage
    dispatch(initializeStaffMode())
  }, [dispatch])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/staff-entry" element={<StaffEntryPage />} />
      
      {/* Staff routes (no login required) */}
      <Route
        path="/staff"
        element={
          <StaffRoute>
            <StaffLayout />
          </StaffRoute>
        }
      >
        <Route index element={<Navigate to="/staff/billing" replace />} />
        <Route
          path="billing"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BillingPage />
            </Suspense>
          }
        />
      </Route>

      {/* Admin routes (login required) */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route
          path="dashboard"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <DashboardPage />
            </Suspense>
          }
        />
        <Route
          path="categories"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CategoriesPage />
            </Suspense>
          }
        />
        <Route
          path="products"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProductsPage />
            </Suspense>
          }
        />
        <Route
          path="products/:id"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProductDetailPage />
            </Suspense>
          }
        />
        <Route
          path="customers"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CustomersPage />
            </Suspense>
          }
        />
        <Route
          path="customers/:id"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <CustomerDetailPage />
            </Suspense>
          }
        />
        <Route
          path="billing"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <BillingPage />
            </Suspense>
          }
        />
        <Route
          path="sales"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <SalesPage />
            </Suspense>
          }
        />
        <Route
          path="sales/:id"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <SaleDetailPage />
            </Suspense>
          }
        />
        <Route
          path="reports"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ReportsPage />
            </Suspense>
          }
        />
        <Route
          path="discounts"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <DiscountsPage />
            </Suspense>
          }
        />
        <Route
          path="settings"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <SettingsPage />
            </Suspense>
          }
        />
        <Route
          path="inventory"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <InventoryPage />
            </Suspense>
          }
        />
        <Route
          path="profile"
          element={
            <Suspense fallback={<LoadingSpinner />}>
              <ProfilePage />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  )
}

export default App

