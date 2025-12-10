import { Outlet } from 'react-router-dom'
import { useState } from 'react'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import ToastContainer from '../common/ToastContainer'
import { cn } from '../../lib/utils'

const Layout = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gradient-to-br from-slate-50 via-purple-50 to-indigo-50">
      <Header />
      <div className="flex flex-1 overflow-hidden" style={{ marginTop: '4rem' }}>
        <Sidebar onCollapseChange={setIsSidebarCollapsed} />
        <main
          className={cn(
            'flex-1 flex flex-col overflow-hidden transition-all duration-300',
            isSidebarCollapsed ? 'lg:ml-16' : 'lg:ml-56' // Collapsed: 64px, Expanded: 224px
          )}
        >
          <div className="flex-1 overflow-y-auto smart-scroll p-4 sm:p-6 lg:p-8 pb-20">
            <div className="max-w-7xl mx-auto w-full">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
      <Footer />
      <ToastContainer />
    </div>
  )
}

export default Layout
