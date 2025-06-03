'use client'

import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'

export default function DashboardSidebar({
  activeTab,
  setActiveTab,
  sidebarOpen,
  setSidebarOpen,
  usage // optional; forwarded if you need it later
}) {
  const { user, trialStatus } = useAuth()

  /** nav items including Content Generator */
  const navigationItems = [
    { id: 'setup',     name: 'Setup & Connect',  icon: '🚀' },
    { id: 'generator', name: 'Content Generator',icon: '⚡️' },
    { id: 'content',   name: 'Content Library',  icon: '💡' },
    { id: 'brand',     name: 'Brand Settings',   icon: '🎨' },
    { id: 'account',   name: 'Account Settings', icon: '⚙️' },
    { id: 'usage',     name: 'Usage & Billing',  icon: '📊' }
  ]

  return (
    <aside
      className={`
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0 mt-16 lg:mt-0
      `}
    >
      {/* mobile header in sidebar */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 lg:hidden">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">
            LA
          </div>
          <span className="text-xl font-bold text-gray-900">Dashboard</span>
        </div>
        <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
      </div>

      {/* trial banner */}
      {trialStatus?.subscriptionStatus === 'trial' && (
        <div
          className={`mx-4 mt-4 p-3 rounded-lg ${
            trialStatus.isActive
              ? trialStatus.daysRemaining <= 3
                ? 'bg-red-50 border border-red-200'
                : 'bg-blue-50 border border-blue-200'
              : 'bg-red-50 border border-red-200'
          }`}
        >
          <p className="text-sm font-medium text-gray-900">
            {trialStatus.isActive
              ? `${trialStatus.daysRemaining} days left`
              : 'Trial expired'}
          </p>
          <Link href="/pricing" className="text-xs text-blue-600 hover:text-blue-800 font-medium">
            Upgrade now →
          </Link>
        </div>
      )}

      {/* nav list */}
      <nav className="mt-6 px-3 space-y-1">
        
        <div className="border-t border-gray-200 my-2" />

        {navigationItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors
              ${
                activeTab === item.id
                  ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
          >
            <span className="mr-3 text-lg">{item.icon}</span>
            {item.name}
          </button>
        ))}
      </nav>

      {/* mobile footer */}
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-200 lg:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-sm font-medium text-gray-700">
            {user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
            <p className="text-xs text-gray-500">{trialStatus?.tier} plan</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
