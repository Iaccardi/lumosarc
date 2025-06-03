'use client'

import { useState } from 'react'
import {
  Copy,
  Check,
  ExternalLink,
  Calendar,
  Share2,
  Edit,
  Trash2,
  MoreHorizontal,
  Image as ImageIcon,
  Hash,
  Target,
  TrendingUp,
  Clock,
  Play,
  FileText,
  Layers,
  Camera,
  Zap
} from 'lucide-react'

const PLATFORM_CONFIG = {
  instagram: { 
    gradient: 'from-pink-500 to-purple-600', 
    icon: '📷', 
    name: 'Instagram',
    textColor: 'text-pink-600'
  },
  facebook: { 
    gradient: 'from-blue-600 to-blue-700', 
    icon: '📘', 
    name: 'Facebook',
    textColor: 'text-blue-600'
  },
  twitter: { 
    gradient: 'from-gray-800 to-black', 
    icon: '🐦', 
    name: 'Twitter/X',
    textColor: 'text-gray-800'
  },
  linkedin: { 
    gradient: 'from-blue-700 to-blue-800', 
    icon: '💼', 
    name: 'LinkedIn',
    textColor: 'text-blue-700'
  },
  youtube: { 
    gradient: 'from-red-600 to-red-700', 
    icon: '📹', 
    name: 'YouTube',
    textColor: 'text-red-600'
  },
  blog: { 
    gradient: 'from-green-600 to-green-700', 
    icon: '📝', 
    name: 'Blog',
    textColor: 'text-green-600'
  },
  pinterest: { 
    gradient: 'from-red-500 to-red-600', 
    icon: '📌', 
    name: 'Pinterest',
    textColor: 'text-red-600'
  }
}

const CONTENT_TYPE_ICONS = {
  video: Play,
  social_media: Share2,
  blog_post: FileText,
  carousel: Layers,
  story: Camera
}

function ContentCard({ idea, keywordScores, onUpdate }) {
  const [copiedKey, setCopiedKey] = useState(null)
  const [showActions, setShowActions] = useState(false)

  const platform = PLATFORM_CONFIG[idea.platform] || {
    gradient: 'from-gray-500 to-gray-600',
    icon: '📄',
    name: 'Unknown',
    textColor: 'text-gray-600'
  }

  const ContentTypeIcon = CONTENT_TYPE_ICONS[idea.content_type] || FileText

  const calculateScore = () => {
    if (!Array.isArray(idea.primary_keywords)) return 0

    const avgKeywordScore = idea.primary_keywords.reduce((sum, k) => {
      return sum + (keywordScores[k]?.trendScore ?? 50)
    }, 0) / idea.primary_keywords.length

    const typeBonus = {
      video: 10,
      social_media: 5,
      blog_post: 0,
      carousel: 8,
      story: 3
    }[idea.content_type] ?? 0

    return Math.round(avgKeywordScore + typeBonus)
  }

  const score = calculateScore()
  const scoreColor = score >= 80 ? 'text-green-600 bg-green-50 border-green-200'
                  : score >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
                                : 'text-red-600 bg-red-50 border-red-200'

  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Copy failed:', err)
    }
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      case 'published': return 'bg-purple-100 text-purple-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-yellow-100 text-yellow-800'
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden group">
      {/* Card Header */}
      <div className="p-4 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          {/* Platform & Type Badges */}
          <div className="flex items-center space-x-2">
            {idea.platform && (
              <div className={`inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r ${platform.gradient} text-white text-xs font-semibold`}>
                <span className="mr-1">{platform.icon}</span>
                {platform.name}
              </div>
            )}
            
            <div className="inline-flex items-center px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs font-medium">
              <ContentTypeIcon size={12} className="mr-1" />
              {idea.content_type?.replace('_', ' ') || 'Content'}
            </div>
          </div>

          {/* Score & Actions */}
          <div className="flex items-center space-x-2">
            <div className={`inline-flex items-center px-2 py-1 text-xs font-bold rounded-full border ${scoreColor}`}>
              <TrendingUp size={10} className="mr-1" />
              {score}/100
            </div>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <MoreHorizontal size={16} />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <div className="p-1">
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                      <Edit size={14} />
                      <span>Edit Content</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                      <Calendar size={14} />
                      <span>Schedule</span>
                    </button>
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded">
                      <Share2 size={14} />
                      <span>Publish Now</span>
                    </button>
                    <hr className="my-1" />
                    <button className="w-full flex items-center space-x-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded">
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-lg font-semibold text-gray-900 mb-2 leading-tight line-clamp-2">
          {idea.title}
        </h3>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">
          {idea.description}
        </p>
      </div>

      {/* Content Preview */}
      {idea.content_body && (
        <div className="p-4 bg-gray-50 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700 flex items-center">
              <FileText size={12} className="mr-1" />
              Ready-to-post content
            </span>
            <button
              onClick={() => copyToClipboard(idea.content_body, `${idea.id}-body`)}
              className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              {copiedKey === `${idea.id}-body` ? <Check size={12} /> : <Copy size={12} />}
              <span>Copy</span>
            </button>
          </div>
          <p className="text-sm text-gray-800 line-clamp-4 whitespace-pre-wrap">
            {idea.content_body}
          </p>
        </div>
      )}

      {/* Metadata */}
      <div className="p-4 space-y-3">
        {/* Keywords */}
        {Array.isArray(idea.primary_keywords) && idea.primary_keywords.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Hash size={12} className="text-gray-400" />
              <span className="text-xs font-medium text-gray-700">Keywords</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {idea.primary_keywords.slice(0, 4).map((keyword, index) => {
                const keywordData = keywordScores[keyword.toLowerCase()]
                const trendDot = keywordData
                  ? keywordData.trendScore >= 80 ? 'bg-green-500'
                  : keywordData.trendScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  : 'bg-gray-300'
                
                return (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full"
                  >
                    {keyword}
                    <span className={`ml-1 w-2 h-2 rounded-full ${trendDot}`} />
                  </span>
                )
              })}
              {idea.primary_keywords.length > 4 && (
                <span className="text-xs text-gray-500 px-2 py-1">+{idea.primary_keywords.length - 4}</span>
              )}
            </div>
          </div>
        )}

        {/* Hashtags */}
        {Array.isArray(idea.hashtags) && idea.hashtags.length > 0 && (
          <div>
            <div className="flex items-center space-x-1 mb-2">
              <Hash size={12} className="text-blue-400" />
              <span className="text-xs font-medium text-gray-700">Hashtags</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {idea.hashtags.slice(0, 5).map((hashtag, index) => (
                <span
                  key={index}
                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full cursor-pointer hover:bg-blue-200 transition-colors"
                  onClick={() => copyToClipboard(hashtag, `${idea.id}-hashtag-${index}`)}
                >
                  {hashtag.startsWith('#') ? hashtag : `#${hashtag}`}
                </span>
              ))}
              {idea.hashtags.length > 5 && (
                <span className="text-xs text-gray-500 px-2 py-1">+{idea.hashtags.length - 5}</span>
              )}
            </div>
          </div>
        )}

        {/* Call to Action */}
        {idea.call_to_action && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-1">
              <Target size={12} className="text-blue-600" />
              <span className="text-xs font-medium text-blue-800">Call to Action</span>
            </div>
            <p className="text-sm text-blue-700">{idea.call_to_action}</p>
          </div>
        )}

        {/* Image Description */}
        {idea.image_description && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-1 mb-1">
              <ImageIcon size={12} className="text-green-600" />
              <span className="text-xs font-medium text-green-800">Image Concept</span>
            </div>
            <p className="text-sm text-green-700">{idea.image_description}</p>
          </div>
        )}
      </div>

      {/* Card Footer */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          {/* Status & Date */}
          <div className="flex items-center space-x-3">
            <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(idea.status)}`}>
              {idea.status || 'pending'}
            </span>
            <div className="flex items-center space-x-1 text-xs text-gray-500">
              <Clock size={12} />
              <span>{formatDate(idea.created_at)}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(idea.title, `${idea.id}-title`)}
              className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
              title="Copy title"
            >
              {copiedKey === `${idea.id}-title` ? <Check size={14} /> : <Copy size={14} />}
            </button>
            
            <button className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors">
              <Calendar size={14} />
            </button>
            
            <button className="p-1.5 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors">
              <Zap size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContentGrid({ ideas, keywordScores, onIdeaUpdate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {ideas.map((idea) => (
        <ContentCard
          key={idea.id}
          idea={idea}
          keywordScores={keywordScores}
          onUpdate={onIdeaUpdate}
        />
      ))}
    </div>
  )
}