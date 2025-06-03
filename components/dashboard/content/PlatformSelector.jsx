// components/content/PlatformSelector.js - SocialBee-Inspired Design
'use client'

import { useState } from 'react'
import { Check, ChevronDown, Sparkles } from 'lucide-react'

const PLATFORM_CFG = [
  { 
    id: 'instagram', 
    name: 'Instagram', 
    icon: '📷', 
    color: 'from-pink-500 to-purple-600',
    connected: true, // Simulate connected accounts
    types: ['Post', 'Story', 'Reel', 'Carousel']
  },
  { 
    id: 'facebook', 
    name: 'Facebook', 
    icon: '📘', 
    color: 'from-blue-600 to-blue-700',
    connected: true,
    types: ['Post', 'Story', 'Video', 'Event']
  },
  { 
    id: 'twitter', 
    name: 'Twitter/X', 
    icon: '🐦', 
    color: 'from-gray-800 to-black',
    connected: true,
    types: ['Tweet', 'Thread', 'Poll']
  },
  { 
    id: 'linkedin', 
    name: 'LinkedIn', 
    icon: '💼', 
    color: 'from-blue-700 to-blue-800',
    connected: false,
    types: ['Post', 'Article', 'Poll', 'Newsletter']
  },
  { 
    id: 'youtube', 
    name: 'YouTube', 
    icon: '📹', 
    color: 'from-red-600 to-red-700',
    connected: false,
    types: ['Video', 'Short', 'Community', 'Live']
  },
  { 
    id: 'pinterest', 
    name: 'Pinterest', 
    icon: '📌', 
    color: 'from-red-500 to-red-600',
    connected: false,
    types: ['Pin', 'Board', 'Story']
  }
]

export default function PlatformSelector({ value, onChange, remaining }) {
  const [showCustomization, setShowCustomization] = useState(false)
  const [selectedPlatforms, setSelectedPlatforms] = useState(new Set())

  const connectedPlatforms = PLATFORM_CFG.filter(p => p.connected)
  const totalSelected = selectedPlatforms.size

  const togglePlatform = (platformId) => {
    const newSelected = new Set(selectedPlatforms)
    if (newSelected.has(platformId)) {
      newSelected.delete(platformId)
    } else {
      newSelected.add(platformId)
    }
    setSelectedPlatforms(newSelected)
    
    // Update parent state - simplified to just track selected platforms
    const newValue = {}
    newSelected.forEach(id => {
      newValue[id] = { qty: 1, types: [] } // Simple: 1 post per platform
    })
    onChange(newValue)
  }

  const handleCustomizeContent = () => {
    setShowCustomization(true)
    // This would open customization modal/panel
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Select Social Media Profiles</h3>
          <p className="text-sm text-gray-600">Choose where to publish your content</p>
        </div>
        <div className="text-sm text-gray-500">
          {totalSelected} of {connectedPlatforms.length} selected
        </div>
      </div>

      {/* Platform Selection Grid - SocialBee Style */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {connectedPlatforms.map(platform => {
          const isSelected = selectedPlatforms.has(platform.id)
          
          return (
            <button
              key={platform.id}
              type="button"
              onClick={() => togglePlatform(platform.id)}
              className={`
                relative p-4 rounded-lg border-2 transition-all duration-200 text-left
                ${isSelected 
                  ? 'border-blue-500 bg-blue-50 shadow-md' 
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                }
              `}
            >
              {/* Platform Info */}
              <div className="flex items-center space-x-3">
                <div className={`
                  w-10 h-10 rounded-lg bg-gradient-to-br ${platform.color} 
                  flex items-center justify-center text-white text-lg
                `}>
                  {platform.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900">{platform.name}</div>
                  <div className="text-xs text-gray-500">{platform.types.length} content types</div>
                </div>
                
                {/* Selection Indicator */}
                <div className={`
                  w-5 h-5 rounded border-2 flex items-center justify-center
                  ${isSelected 
                    ? 'border-blue-500 bg-blue-500' 
                    : 'border-gray-300'
                  }
                `}>
                  {isSelected && <Check size={12} className="text-white" />}
                </div>
              </div>

              {/* Content Types Preview */}
              {isSelected && (
                <div className="mt-3 pt-3 border-t border-blue-200">
                  <div className="flex flex-wrap gap-1">
                    {platform.types.slice(0, 3).map(type => (
                      <span 
                        key={type}
                        className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded"
                      >
                        {type}
                      </span>
                    ))}
                    {platform.types.length > 3 && (
                      <span className="text-xs text-blue-600">+{platform.types.length - 3}</span>
                    )}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Quick Actions */}
      {totalSelected === 0 && (
        <div className="text-center py-8 text-gray-500">
          <div className="text-4xl mb-3">📱</div>
          <p className="font-medium text-gray-600">Select platforms to get started</p>
          <p className="text-sm">Your content will be optimized for each platform</p>
        </div>
      )}

      {/* Customization Options */}
      {totalSelected > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium text-gray-900">Ready to Generate</h4>
              <p className="text-sm text-gray-600">
                Content will be created for {totalSelected} platform{totalSelected > 1 ? 's' : ''}
              </p>
            </div>
            <div className="text-2xl font-bold text-blue-600">{totalSelected}</div>
          </div>

          {/* Platform Tags */}
          <div className="flex flex-wrap gap-2">
            {Array.from(selectedPlatforms).map(platformId => {
              const platform = PLATFORM_CFG.find(p => p.id === platformId)
              return (
                <div key={platformId} className="flex items-center space-x-2 bg-white px-3 py-1 rounded border">
                  <span>{platform.icon}</span>
                  <span className="text-sm font-medium">{platform.name}</span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      togglePlatform(platformId)
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    ×
                  </button>
                </div>
              )
            })}
          </div>

          {/* Customization Button */}
          <button
            type="button"
            onClick={handleCustomizeContent}
            className="w-full flex items-center justify-center space-x-2 py-2 px-4 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Sparkles size={16} className="text-blue-600" />
            <span className="text-sm font-medium text-gray-700">Customize for Each Platform</span>
            <ChevronDown size={16} className="text-gray-400" />
          </button>
        </div>
      )}

      {/* Disconnected Platforms */}
      {PLATFORM_CFG.some(p => !p.connected) && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Connect More Platforms</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {PLATFORM_CFG.filter(p => !p.connected).map(platform => (
              <button
                key={platform.id}
                className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors opacity-60"
              >
                <div className="flex items-center space-x-2">
                  <span className="text-lg">{platform.icon}</span>
                  <span className="text-sm text-gray-600">{platform.name}</span>
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded">Connect</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}