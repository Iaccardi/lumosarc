'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

export default function UsageTab() {
  const { user, trialStatus } = useAuth()
  const [usageStats, setUsageStats] = useState({
    currentMonth: 0,
    postsThisMonth: 0,
    totalIdeas: 0,
    totalPosts: 0,
    limit: 50,
    resetDate: new Date()
  })
  const [contentIdeas, setContentIdeas] = useState([])

  useEffect(() => {
    if (user) {
      fetchUsageStats()
      fetchRecentActivity()
    }
  }, [user])

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
      console.error('Error fetching usage stats:', err)
    }
  }

  const fetchRecentActivity = async () => {
    if (!user) return

    try {
      const { data, error } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (error) throw error
      setContentIdeas(data || [])
    } catch (err) {
      console.error('Error fetching recent activity:', err)
    }
  }

  const getUsagePercentage = () => {
    return Math.min(100, (usageStats.currentMonth / usageStats.limit) * 100)
  }

  const getUsageColor = () => {
    const percentage = getUsagePercentage()
    if (percentage >= 90) return 'bg-red-500'
    if (percentage >= 70) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: 'Posts Generated',
            value: usageStats.currentMonth,
            iconBg: 'bg-blue-100',
            icon: '📝',
            note: 'This month'
          },
          {
            label: 'Monthly Limit',
            value: usageStats.limit === 999_999 ? 'Unlimited' : usageStats.limit,
            iconBg: 'bg-green-100',
            icon: '🎯',
            note: `${trialStatus?.tier || 'starter'} plan`
          },
          {
            label: 'Remaining',
            value: usageStats.limit === 999_999 ? 'Unlimited' : usageStats.limit - usageStats.currentMonth,
            iconBg: 'bg-purple-100',
            icon: '⚡',
            note: `Until ${usageStats.resetDate.toLocaleDateString()}`
          }
        ].map((box, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">{box.label}</p>
                <p className="text-2xl font-bold text-gray-900">{box.value}</p>
              </div>
              <div className={`w-12 h-12 ${box.iconBg} rounded-lg flex items-center justify-center text-xl`}>
                {box.icon}
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">{box.note}</p>
          </div>
        ))}
      </div>

      {/* Usage Progress */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Monthly Usage</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center text-sm font-medium text-gray-600">
            <span>Content Generation</span>
            <span>
              {usageStats.currentMonth} / {usageStats.limit === 999_999 ? '∞' : usageStats.limit}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className={`h-3 rounded-full ${getUsageColor()}`}
              style={{ width: `${usageStats.limit === 999_999 ? 0 : getUsagePercentage()}%` }}
            />
          </div>
          {usageStats.currentMonth >= usageStats.limit && usageStats.limit !== 999_999 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-3 text-sm">
              <span className="text-red-500 text-xl">⚠️</span>
              <p className="text-red-800 font-medium">
                Monthly limit reached. Upgrade your plan to continue generating content.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* All-time Stats */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">All-Time Statistics</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Content Ideas</span>
              <span className="font-semibold text-gray-900">{usageStats.totalIdeas}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Total Posts Generated</span>
              <span className="font-semibold text-gray-900">{usageStats.totalPosts}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Average Ideas per Month</span>
              <span className="font-semibold text-gray-900">
                {Math.round(usageStats.totalIdeas / Math.max(1, Math.ceil((new Date() - new Date(user?.created_at || new Date())) / (30 * 24 * 60 * 60 * 1000))))}
              </span>
            </div>
          </div>
        </div>

        {/* Plan Details */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Details</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Current Plan</span>
              <span className="font-semibold text-gray-900 capitalize">{trialStatus?.tier || 'starter'}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Status</span>
              <span className={`font-semibold capitalize ${
                trialStatus?.subscriptionStatus === 'trial' ? 'text-blue-600' : 'text-green-600'
              }`}>
                {trialStatus?.subscriptionStatus || 'trial'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="text-gray-600">Next Reset</span>
              <span className="font-semibold text-gray-900">{usageStats.resetDate.toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
        <div className="space-y-3 text-sm">
          {contentIdeas.slice(0, 5).map((idea) => (
            <div key={idea.id} className="flex items-center justify-between py-2 hover:bg-gray-50 rounded-lg px-2">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-blue-500 rounded-full" />
                <span className="text-gray-900 truncate max-w-md">Generated "{idea.title}"</span>
              </div>
              <span className="text-xs text-gray-500">{new Date(idea.created_at).toLocaleDateString()}</span>
            </div>
          ))}
          {!contentIdeas.length && (
            <p className="text-gray-500 py-4 text-center">No recent activity</p>
          )}
        </div>
      </div>

      {/* Billing Information (placeholder) */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Information</h3>
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-2">💳</div>
          <p className="text-lg font-medium text-gray-700 mb-2">Billing Integration Coming Soon</p>
          <p className="text-sm">Detailed billing history and invoice management will be available here.</p>
        </div>
      </div>
    </div>
  )
}