'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function DashboardHeader({ activeTab, setSidebarOpen }) {
  const { user, trialStatus } = useAuth()
  const [usageStats, setUsageStats] = useState({
    currentMonth: 0,
    limit: 50,
    resetDate: new Date()
  })

  const navigationItems = [
    { id: 'content', name: 'Content Ideas', icon: '💡' },
    { id: 'brand', name: 'Brand Settings', icon: '🎨' },
    { id: 'account', name: 'Account Settings', icon: '⚙️' },
    { id: 'usage', name: 'Usage & Billing', icon: '📊' }
  ]

  useEffect(() => {
    if (user && activeTab === 'usage') {
      fetchUsageStats()
    }
  }, [user, activeTab])

  const fetchUsageStats = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase.rpc('get_user_usage_stats', {
        p_user_id: user.id
      })
      if (error) throw error

      const stats = data?.[0] || {
        ideas_this_month: 0,
        posts_this_month: 0,
        total_ideas: 0,
        total_posts: 0
      }

      const tierLimits = {
        starter: 50,
        professional: 200,
        enterprise: 999_999
      }

      const userTier = trialStatus?.tier || 'starter'

      setUsageStats({
        currentMonth: stats.ideas_this_month,
        postsThisMonth: stats.posts_this_month,
        totalIdeas: stats.total_ideas,
        totalPosts: stats.total_posts,
        limit: tierLimits[userTier] ?? 50,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1)
      })
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between h-16 px-6">
        <div className="flex items-center">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="lg:hidden text-gray-500 hover:text-gray-700 mr-4"
          >
            ☰
          </button>
          <h1 className="text-2xl font-bold text-gray-900">
            {navigationItems.find((i) => i.id === activeTab)?.name}
          </h1>
        </div>

        {activeTab === 'usage' && (
          <div className="flex items-center space-x-4 text-sm">
            <span className="text-gray-600">
              {usageStats.currentMonth}/{usageStats.limit} posts this month
            </span>
            <div className="w-32 bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full"
                style={{ width: `${Math.min(100, (usageStats.currentMonth / usageStats.limit) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </header>
  )
}