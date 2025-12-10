import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { Store, Sparkles, User, LogOut, Menu } from 'lucide-react'
import { RootState } from '../../store/store'
import { setSidebarOpen } from '../../store/slices/uiSlice'
import { logout } from '../../store/slices/authSlice'
import { Button } from '../ui/button'

const Header = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const user = useSelector((state: RootState) => state.auth.user)
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen)

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout?')) {
      dispatch(logout())
      navigate('/login')
    }
  }

  return (
    <header className="bg-white shadow-lg border-b border-gray-200 flex-shrink-0 z-50 fixed top-0 left-0 right-0 h-16">
      <div className="px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between w-full">
        {/* Left Section: Logo and Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Menu Button */}
          <button
            onClick={() => dispatch(setSidebarOpen(!sidebarOpen))}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu className="w-6 h-6 text-gray-700" />
          </button>

          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl blur opacity-30"></div>
              <div className="relative bg-gradient-to-r from-purple-600 to-indigo-600 p-3 rounded-xl">
                <Store className="w-7 h-7 text-white" />
              </div>
            </div>
            <div>
              <h1 className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent text-xl sm:text-2xl font-semibold">
                Retail Billing System
              </h1>
              <p className="text-gray-500 text-xs sm:text-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Modern POS Solution
              </p>
            </div>
          </div>
        </div>

        {/* Right Section: Current User and Logout */}
        <div className="flex items-center gap-3">
          {/* Current User Section */}
          {user && (
            <Button
              variant="outline"
              onClick={() => navigate('/profile')}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white border-0 flex items-center gap-2 px-4 py-2"
            >
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Current User {user.role || 'Admin'}</span>
              <span className="sm:hidden">User</span>
            </Button>
          )}

          {/* Logout Button */}
          <Button
            onClick={handleLogout}
            variant="destructive"
            size="sm"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}

export default Header
