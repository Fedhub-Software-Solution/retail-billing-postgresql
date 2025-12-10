import { useState } from 'react'
import {
  LayoutDashboard,
  ShoppingCart,
  TrendingUp,
  Package,
  Grid3x3,
  Users,
  Warehouse,
  Tag,
  BarChart3,
  Settings,
  UserCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../store/store'
import { setSidebarOpen } from '../../store/slices/uiSlice'
import { cn } from '../../lib/utils'

interface MenuItem {
  id: string
  label: string
  icon: React.ReactNode
  path: string
  roles?: string[]
}

const allMenuItems: MenuItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-5 h-5" />, path: '/dashboard', roles: ['admin', 'manager'] },
  { id: 'billing', label: 'Billing', icon: <ShoppingCart className="w-5 h-5" />, path: '/billing', roles: ['admin', 'manager', 'cashier'] },
  { id: 'sales', label: 'Sales', icon: <TrendingUp className="w-5 h-5" />, path: '/sales', roles: ['admin', 'manager', 'cashier'] },
  { id: 'products', label: 'Products', icon: <Package className="w-5 h-5" />, path: '/products', roles: ['admin', 'manager', 'cashier'] },
  { id: 'categories', label: 'Categories', icon: <Grid3x3 className="w-5 h-5" />, path: '/categories', roles: ['admin', 'manager'] },
  { id: 'customers', label: 'Customers', icon: <Users className="w-5 h-5" />, path: '/customers', roles: ['admin', 'manager', 'cashier'] },
  { id: 'inventory', label: 'Inventory', icon: <Warehouse className="w-5 h-5" />, path: '/inventory', roles: ['admin', 'manager'] },
  { id: 'discounts', label: 'Discounts', icon: <Tag className="w-5 h-5" />, path: '/discounts', roles: ['admin', 'manager'] },
  { id: 'reports', label: 'Reports', icon: <BarChart3 className="w-5 h-5" />, path: '/reports', roles: ['admin', 'manager'] },
  { id: 'profile', label: 'Profile', icon: <UserCircle className="w-5 h-5" />, path: '/profile' },
  { id: 'settings', label: 'Settings', icon: <Settings className="w-5 h-5" />, path: '/settings', roles: ['admin'] },
]

interface SidebarProps {
  onCollapseChange?: (collapsed: boolean) => void
}

const Sidebar = ({ onCollapseChange }: SidebarProps) => {
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const sidebarOpen = useSelector((state: RootState) => state.ui.sidebarOpen)
  const userRole = useSelector((state: RootState) => state.auth.user?.role)
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleClose = () => {
    dispatch(setSidebarOpen(false))
  }

  const handleNavigate = (path: string) => {
    navigate(path)
    // Close sidebar on mobile after navigation
    if (window.innerWidth < 1024) {
      dispatch(setSidebarOpen(false))
    }
  }

  // Filter menu items based on user role
  const filteredMenuItems = allMenuItems.filter((item) =>
    userRole ? (item.roles ? item.roles.includes(userRole) : true) : false
  )

  return (
    <>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={handleClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-16 left-0 bottom-16 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 flex flex-col shadow-lg transition-all duration-300 ease-in-out z-50',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          isCollapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Navigation Menu */}
        <nav className="flex-1 overflow-y-auto py-4 smart-scroll min-h-0">
          <ul className="space-y-1 px-2">
            {filteredMenuItems.map((item) => {
              const isActive = location.pathname === item.path

              return (
                <li key={item.id}>
                  <button
                    onClick={() => handleNavigate(item.path)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200',
                      isCollapsed ? 'justify-center px-2' : '',
                      isActive
                        ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-200'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                    )}
                    title={isCollapsed ? item.label : ''}
                  >
                    <span className={cn(isActive ? 'text-white' : 'text-gray-600')}>
                      {item.icon}
                    </span>
                    {!isCollapsed && <span className="text-sm font-medium">{item.label}</span>}
                  </button>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Toggle Button at Bottom */}
        <div className="p-3 border-t border-gray-200 flex-shrink-0 bg-white">
          <button
            onClick={() => {
              const newCollapsed = !isCollapsed
              setIsCollapsed(newCollapsed)
              onCollapseChange?.(newCollapsed)
            }}
            className={cn(
              'w-full flex items-center gap-3 px-3 py-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 hover:from-purple-100 hover:to-indigo-100 transition-all duration-200 text-purple-600 hover:text-purple-700 border border-purple-200 hover:border-purple-300 shadow-sm hover:shadow-md',
              isCollapsed ? 'justify-center' : ''
            )}
            title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {isCollapsed ? (
              <ChevronRight className="w-5 h-5" />
            ) : (
              <>
                <ChevronLeft className="w-5 h-5" />
                <span className="text-sm">Collapse</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  )
}

export default Sidebar
