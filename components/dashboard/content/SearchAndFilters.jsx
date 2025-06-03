'use client'

import { useState } from 'react'
import { 
  Search, 
  Filter, 
  TrendingUp, 
  Calendar,
  ChevronDown,
  X,
  Settings,
  BarChart3,
  Clock,
  Tag,
  Hash,
  Target,
  Zap,
  ImageIcon,
  Eye,
  EyeOff
} from 'lucide-react'

const PLATFORM_OPTIONS = [
  { id: 'all', name: 'All Platforms', icon: '🌐', color: 'bg-gray-100' },
  { id: 'instagram', name: 'Instagram', icon: '📷', color: 'bg-gradient-to-r from-pink-500 to-purple-600' },
  { id: 'facebook', name: 'Facebook', icon: '📘', color: 'bg-blue-600' },
  { id: 'twitter', name: 'Twitter/X', icon: '🐦', color: 'bg-black' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼', color: 'bg-blue-700' },
  { id: 'tiktok', name: 'TikTok', icon: '🎵', color: 'bg-black' },
  { id: 'youtube', name: 'YouTube', icon: '📹', color: 'bg-red-600' },
  { id: 'blog', name: 'Blog', icon: '📝', color: 'bg-green-600' },
  { id: 'pinterest', name: 'Pinterest', icon: '📌', color: 'bg-red-500' }
]

const CONTENT_TYPE_OPTIONS = [
  { id: 'all', name: 'All Types' },
  { id: 'instagram_post', name: 'Instagram Posts' },
  { id: 'facebook_post', name: 'Facebook Posts' },
  { id: 'tweet', name: 'Tweets' },
  { id: 'linkedin_post', name: 'LinkedIn Posts' },
  { id: 'tiktok_video', name: 'TikTok Videos' },
  { id: 'youtube_video', name: 'YouTube Videos' },
  { id: 'blog_post', name: 'Blog Articles' },
  { id: 'pinterest_pin', name: 'Pinterest Pins' },
  { id: 'video', name: 'Video Content' },
  { id: 'carousel', name: 'Carousels' },
  { id: 'story', name: 'Stories' }
]

const STATUS_OPTIONS = [
  { id: 'all', name: 'All Status', color: 'bg-gray-100' },
  { id: 'pending', name: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'approved', name: 'Approved', color: 'bg-green-100 text-green-800' },
  { id: 'scheduled', name: 'Scheduled', color: 'bg-blue-100 text-blue-800' },
  { id: 'published', name: 'Published', color: 'bg-purple-100 text-purple-800' },
  { id: 'draft', name: 'Draft', color: 'bg-gray-100 text-gray-800' }
]

const SORT_OPTIONS = [
  { id: 'score', name: 'Viral Score', icon: TrendingUp, desc: 'Highest performing first' },
  { id: 'date', name: 'Date Created', icon: Calendar, desc: 'Most recent first' },
  { id: 'platform', name: 'Platform', icon: BarChart3, desc: 'Grouped by platform' },
  { id: 'alphabetical', name: 'Title', icon: Tag, desc: 'A-Z order' },
  { id: 'engagement', name: 'Engagement Potential', icon: Zap, desc: 'Best engagement hooks first' }
]

const CONTENT_FEATURES = [
  { id: 'has_image', name: 'Has Image Concept', icon: ImageIcon, desc: 'Content with visual concepts' },
  { id: 'has_cta', name: 'Has Call-to-Action', icon: Target, desc: 'Content with clear CTAs' },
  { id: 'has_hashtags', name: 'Has Hashtags', icon: Hash, desc: 'Content with hashtags' },
  { id: 'has_hook', name: 'Has Engagement Hook', icon: Zap, desc: 'Content with engagement hooks' },
  { id: 'has_strategy', name: 'Has Strategy', icon: BarChart3, desc: 'Content with engagement strategy' }
]

export default function SearchAndFilters({ filters, onFiltersChange, hasContent, loading }) {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const [searchSuggestions, setSearchSuggestions] = useState([])

  const updateFilter = (key, value) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const clearAllFilters = () => {
    onFiltersChange({
      search: '',
      platform: 'all',
      contentType: 'all',
      status: 'all',
      sortBy: 'score',
      features: []
    })
  }

  const hasActiveFilters = filters.search || 
                         filters.platform !== 'all' || 
                         filters.contentType !== 'all' || 
                         filters.status !== 'all' ||
                         (filters.features && filters.features.length > 0)

  const selectedPlatform = PLATFORM_OPTIONS.find(p => p.id === filters.platform)
  const selectedContentType = CONTENT_TYPE_OPTIONS.find(t => t.id === filters.contentType)
  const selectedStatus = STATUS_OPTIONS.find(s => s.id === filters.status)
  const selectedSort = SORT_OPTIONS.find(s => s.id === filters.sortBy)

  // Handle search with suggestions
  const handleSearchChange = (value) => {
    updateFilter('search', value)
    
    // Generate search suggestions based on common content fields
    if (value.length > 1) {
      const suggestions = [
        `"${value}" in titles`,
        `"${value}" in content`,
        `"${value}" in hashtags`,
        `"${value}" in keywords`
      ]
      setSearchSuggestions(suggestions.slice(0, 3))
    } else {
      setSearchSuggestions([])
    }
  }

  const toggleFeatureFilter = (featureId) => {
    const currentFeatures = filters.features || []
    const newFeatures = currentFeatures.includes(featureId)
      ? currentFeatures.filter(f => f !== featureId)
      : [...currentFeatures, featureId]
    
    updateFilter('features', newFeatures)
  }

  return (
    <div className="space-y-4">
      {/* Main Search and Quick Filters Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Enhanced Search Bar */}
          <div className="flex-1 relative">
            <div className={`
              relative transition-all duration-200
              ${isSearchFocused ? 'transform scale-[1.02]' : ''}
            `}>
              <Search 
                size={20} 
                className={`
                  absolute left-3 top-1/2 transform -translate-y-1/2 transition-colors
                  ${isSearchFocused ? 'text-blue-600' : 'text-gray-400'}
                `} 
              />
              <input
                type="text"
                placeholder="Search titles, content, hashtags, keywords..."
                value={filters.search}
                onChange={(e) => handleSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => {
                  setIsSearchFocused(false)
                  // Delay hiding suggestions to allow clicking
                  setTimeout(() => setSearchSuggestions([]), 200)
                }}
                className={`
                  w-full pl-10 pr-4 py-3 border rounded-lg transition-all duration-200
                  ${isSearchFocused 
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-sm' 
                    : 'border-gray-300 hover:border-gray-400'
                  }
                  focus:outline-none
                `}
              />
              
              {/* Search Suggestions */}
              {searchSuggestions.length > 0 && isSearchFocused && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        updateFilter('search', suggestion.replace(/"/g, ''))
                        setSearchSuggestions([])
                      }}
                      className="w-full text-left px-4 py-2 hover:bg-gray-50 text-sm text-gray-700 first:rounded-t-lg last:rounded-b-lg"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Quick Filter Dropdowns */}
          <div className="flex flex-wrap gap-3">
            {/* Platform Filter */}
            <div className="relative">
              <select
                value={filters.platform}
                onChange={(e) => updateFilter('platform', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors min-w-[140px]"
              >
                {PLATFORM_OPTIONS.map(platform => (
                  <option key={platform.id} value={platform.id}>
                    {platform.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Content Type Filter */}
            <div className="relative">
              <select
                value={filters.contentType}
                onChange={(e) => updateFilter('contentType', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors min-w-[140px]"
              >
                {CONTENT_TYPE_OPTIONS.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <select
                value={filters.status}
                onChange={(e) => updateFilter('status', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors min-w-[120px]"
              >
                {STATUS_OPTIONS.map(status => (
                  <option key={status.id} value={status.id}>
                    {status.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Sort Filter */}
            <div className="relative">
              <select
                value={filters.sortBy}
                onChange={(e) => updateFilter('sortBy', e.target.value)}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-3 pr-8 hover:border-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-colors min-w-[160px]"
              >
                {SORT_OPTIONS.map(sort => (
                  <option key={sort.id} value={sort.id}>
                    Sort by {sort.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={16} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`
                flex items-center space-x-2 px-4 py-3 border rounded-lg transition-colors
                ${showAdvancedFilters 
                  ? 'border-blue-500 bg-blue-50 text-blue-700' 
                  : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                }
              `}
            >
              <Settings size={16} />
              <span className="text-sm font-medium">Advanced</span>
              {hasActiveFilters && (
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              )}
            </button>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {filters.search && (
                  <div className="flex items-center space-x-2 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    <Search size={12} />
                    <span>"{filters.search}"</span>
                    <button
                      onClick={() => updateFilter('search', '')}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}
                
                {filters.platform !== 'all' && (
                  <div className="flex items-center space-x-2 bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">
                    <span>{selectedPlatform?.icon}</span>
                    <span>{selectedPlatform?.name}</span>
                    <button
                      onClick={() => updateFilter('platform', 'all')}
                      className="text-purple-600 hover:text-purple-800"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {filters.contentType !== 'all' && (
                  <div className="flex items-center space-x-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                    <Tag size={12} />
                    <span>{selectedContentType?.name}</span>
                    <button
                      onClick={() => updateFilter('contentType', 'all')}
                      className="text-green-600 hover:text-green-800"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {filters.status !== 'all' && (
                  <div className="flex items-center space-x-2 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                    <Clock size={12} />
                    <span>{selectedStatus?.name}</span>
                    <button
                      onClick={() => updateFilter('status', 'all')}
                      className="text-yellow-600 hover:text-yellow-800"
                    >
                      <X size={12} />
                    </button>
                  </div>
                )}

                {filters.features?.map(feature => {
                  const featureConfig = CONTENT_FEATURES.find(f => f.id === feature)
                  return (
                    <div key={feature} className="flex items-center space-x-2 bg-indigo-100 text-indigo-800 px-3 py-1 rounded-full text-sm">
                      <featureConfig.icon size={12} />
                      <span>{featureConfig.name}</span>
                      <button
                        onClick={() => toggleFeatureFilter(feature)}
                        className="text-indigo-600 hover:text-indigo-800"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  )
                })}
              </div>

              <button
                onClick={clearAllFilters}
                className="text-sm text-gray-600 hover:text-gray-800 underline"
              >
                Clear all
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Advanced Filters Panel */}
      {showAdvancedFilters && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Filter size={20} className="text-blue-600" />
              <span>Advanced Filters</span>
            </h3>
            <button
              onClick={() => setShowAdvancedFilters(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Platform Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Platform</label>
              <div className="space-y-2">
                {PLATFORM_OPTIONS.slice(0, 8).map(platform => (
                  <button
                    key={platform.id}
                    onClick={() => updateFilter('platform', platform.id)}
                    className={`
                      w-full flex items-center space-x-3 p-3 rounded-lg border transition-colors text-left
                      ${filters.platform === platform.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-lg">{platform.icon}</span>
                    <span className="text-sm font-medium">{platform.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Type Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Content Type</label>
              <div className="space-y-2">
                {CONTENT_TYPE_OPTIONS.slice(0, 8).map(type => (
                  <button
                    key={type.id}
                    onClick={() => updateFilter('contentType', type.id)}
                    className={`
                      w-full p-3 rounded-lg border transition-colors text-left
                      ${filters.contentType === type.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">{type.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Status Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Status</label>
              <div className="space-y-2">
                {STATUS_OPTIONS.map(status => (
                  <button
                    key={status.id}
                    onClick={() => updateFilter('status', status.id)}
                    className={`
                      w-full p-3 rounded-lg border transition-colors text-left
                      ${filters.status === status.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <span className="text-sm font-medium">{status.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Content Features */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Content Features</label>
              <div className="space-y-2">
                {CONTENT_FEATURES.map(feature => {
                  const Icon = feature.icon
                  const isSelected = filters.features?.includes(feature.id)
                  return (
                    <button
                      key={feature.id}
                      onClick={() => toggleFeatureFilter(feature.id)}
                      className={`
                        w-full flex items-start space-x-3 p-3 rounded-lg border transition-colors text-left
                        ${isSelected 
                          ? 'border-blue-500 bg-blue-50 text-blue-700' 
                          : 'border-gray-200 hover:bg-gray-50'
                        }
                      `}
                    >
                      <Icon size={16} className="mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium">{feature.name}</div>
                        <div className="text-xs text-gray-500">{feature.desc}</div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Sort Options */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Sort Options</label>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
              {SORT_OPTIONS.map(sort => {
                const Icon = sort.icon
                return (
                  <button
                    key={sort.id}
                    onClick={() => updateFilter('sortBy', sort.id)}
                    className={`
                      flex items-center space-x-2 p-3 rounded-lg border transition-colors text-left
                      ${filters.sortBy === sort.id 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:bg-gray-50'
                      }
                    `}
                  >
                    <Icon size={16} className="flex-shrink-0" />
                    <div>
                      <div className="text-sm font-medium">{sort.name}</div>
                      <div className="text-xs text-gray-500">{sort.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Advanced Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
            <div className="text-sm text-gray-600">
              Use filters to find exactly what you're looking for
            </div>
            <div className="flex space-x-3">
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Reset Filters
              </button>
              <button
                onClick={() => setShowAdvancedFilters(false)}
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Results Summary */}
      {hasContent && !loading && (
        <div className="text-sm text-gray-600 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <BarChart3 size={16} />
            <span>
              {hasActiveFilters ? 'Filtered results' : 'All content'} • 
              Sorted by {selectedSort?.name.toLowerCase()}
            </span>
          </div>
          {hasActiveFilters && (
            <button
              onClick={clearAllFilters}
              className="text-blue-600 hover:text-blue-800 underline"
            >
              Show all content
            </button>
          )}
        </div>
      )}
    </div>
  )
}