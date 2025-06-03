// components/content/UsageStatsBar.js
'use client'

import { BarChart3, TrendingUp, Clock } from 'lucide-react'

export default function UsageStatsBar({ usage }) {
  const percentage = Math.min(100, (usage.currentMonth / usage.limit) * 100)
  
  const getColorClass = () => {
    if (percentage >= 90) return 'from-red-500 to-red-600'
    if (percentage >= 70) return 'from-yellow-500 to-orange-500'
    return 'from-blue-500 to-purple-600'
  }

  const getTextColor = () => {
    if (percentage >= 90) return 'text-red-700'
    if (percentage >= 70) return 'text-orange-700'
    return 'text-blue-700'
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <BarChart3 size={20} className="text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900">Monthly Usage</h3>
            <p className="text-sm text-gray-600">Track your content generation progress</p>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-2xl font-bold ${getTextColor()}`}>
            {usage.currentMonth} / {usage.limit}
          </div>
          <div className="text-xs text-gray-500">Posts Generated</div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm font-medium text-gray-600">
          <span>Progress</span>
          <span>{percentage.toFixed(1)}%</span>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
          <div 
            className={`h-4 rounded-full bg-gradient-to-r ${getColorClass()} transition-all duration-500`}
            style={{ width: `${percentage}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-1">
            <TrendingUp size={12} />
            <span>{usage.limit - usage.currentMonth} remaining</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock size={12} />
            <span>Resets {usage.resetDate?.toLocaleDateString()}</span>
          </div>
        </div>

        {percentage >= 90 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
            <p className="text-sm text-red-800 font-medium">
              ⚠️ You're close to your monthly limit. Consider upgrading your plan to continue generating content.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}