import { Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { RootState } from '../../store/store'

interface StaffRouteProps {
  children: React.ReactNode
}

const StaffRoute = ({ children }: StaffRouteProps) => {
  const isStaffMode = useSelector((state: RootState) => state.staff.isStaffMode)

  if (!isStaffMode) {
    return <Navigate to="/staff-entry" replace />
  }

  return <>{children}</>
}

export default StaffRoute

