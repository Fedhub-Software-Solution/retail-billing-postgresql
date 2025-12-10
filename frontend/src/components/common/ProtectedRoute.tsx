import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

const ProtectedRoute = ({ children, requireAdmin = false }: ProtectedRouteProps) => {
  const isAuthenticated = useSelector((state: RootState) => state.auth.isAuthenticated)
  const token = useSelector((state: RootState) => state.auth.token)
  const user = useSelector((state: RootState) => state.auth.user)

  // Check if we have a token in localStorage but not in state (initial load)
  if (!isAuthenticated && !token && localStorage.getItem('token')) {
    // Token exists in localStorage but not in state - this shouldn't happen
    // but if it does, redirect to login to re-authenticate
    return <Navigate to="/login" replace />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // If admin is required, check user role
  if (requireAdmin && user?.role !== 'admin') {
    return <Navigate to="/staff-entry" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute

