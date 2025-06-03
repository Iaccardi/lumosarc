// components/content/BasicInfo.js
'use client'

import { Lightbulb, Hash } from 'lucide-react'

export default function BasicInfo({ niche, onNiche, keywords, onKeywords }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <Lightbulb className="text-blue-500" size={18} />
          <span className="text-sm font-bold text-gray-900">
            Business Niche
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
        <input
          type="text"
          required
          value={niche}
          onChange={e => onNiche(e.target.value)}
          placeholder="e.g., Fitness & Wellness, Digital Marketing, Food & Cooking"
          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl 
                   text-gray-900 font-semibold placeholder-gray-400 text-lg
                   focus:ring-4 focus:ring-blue-100 focus:border-blue-500
                   transition-all duration-200 bg-gray-50 hover:bg-white
                   hover:border-gray-300 hover:shadow-sm"
        />
        <p className="text-xs text-gray-600 flex items-center space-x-1">
          <span>💡</span>
          <span>Describe your business category or industry focus</span>
        </p>
      </div>
      
      <div className="space-y-3">
        <label className="flex items-center space-x-2">
          <Hash className="text-purple-500" size={18} />
          <span className="text-sm font-bold text-gray-900">
            Target Keywords
            <span className="text-red-500 ml-1">*</span>
          </span>
        </label>
        <input
          type="text"
          required
          value={keywords}
          onChange={e => onKeywords(e.target.value)}
          placeholder="e.g., fitness tips, workout routines, healthy recipes"
          className="w-full px-5 py-4 border-2 border-gray-200 rounded-xl 
                   text-gray-900 font-semibold placeholder-gray-400 text-lg
                   focus:ring-4 focus:ring-purple-100 focus:border-purple-500
                   transition-all duration-200 bg-gray-50 hover:bg-white
                   hover:border-gray-300 hover:shadow-sm"
        />
        <p className="text-xs text-gray-600 flex items-center space-x-1">
          <span>🎯</span>
          <span>Separate multiple keywords with commas for better targeting</span>
        </p>
      </div>
    </div>
  )
}