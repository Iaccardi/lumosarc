// components/content/IdeaCard.js
'use client'

import { useState } from 'react'
import {
  ImageIcon, Copy, Check, ExternalLink,
  Hash, Target, Clock, TrendingUp,
  Calendar, Share2, Trash2
} from 'lucide-react'

// Helper functions to safely parse data
const parseKeywords = (keywords) => {
  if (!keywords) return []
  if (Array.isArray(keywords)) return keywords
  if (typeof keywords === 'string') {
    return keywords.split(',').map(k => k.trim()).filter(k => k.length > 0)
  }
  return []
}

const parseHashtags = (hashtags) => {
  if (!hashtags) return []
  if (Array.isArray(hashtags)) return hashtags
  if (typeof hashtags === 'string') {
    return hashtags.split(',').map(h => h.trim()).filter(h => h.length > 0)
  }
  return []
}

const calculateContentScore = (idea, keywordScores = {}) => {
  const keywords = parseKeywords(idea.primary_keywords)
  if (keywords.length === 0) return 50

  const avgKeywordScore = keywords.reduce((sum, k) => {
    return sum + (keywordScores[k?.toLowerCase()]?.trendScore ?? 50)
  }, 0) / keywords.length

  const typeBonus = {
    video: 10,
    social_media: 5,
    blog_post: 0,
    carousel: 8,
    story: 3
  }[idea.content_type] ?? 0

  return Math.round(avgKeywordScore + typeBonus)
}

export default function IdeaCard({ idea, keywordScores = {} }) {
  const [expanded, setExpanded] = useState(false)
  const [copiedKey, setCopiedKey] = useState(null)

  // Safe property access with defaults
  const safeIdea = {
    id: idea?.id || 'unknown',
    title: idea?.title || 'Untitled',
    description: idea?.description || 'No description available',
    content_body: idea?.content_body || '',
    platform: idea?.platform || '',
    content_type: idea?.content_type || 'social_media',
    status: idea?.status || 'pending',
    primary_keywords: idea?.primary_keywords || [],
    hashtags: idea?.hashtags || [],
    call_to_action: idea?.call_to_action || '',
    image_description: idea?.image_description || '',
    optimal_posting_time: idea?.optimal_posting_time || '',
    engagement_strategy: idea?.engagement_strategy || '',
    seo_focus: idea?.seo_focus || '',
    created_at: idea?.created_at || new Date().toISOString()
  }

  /* ------- helpers ------- */
  const copyToClipboard = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedKey(key)
      setTimeout(() => setCopiedKey(null), 2000)
    } catch (err) {
      console.error('Copy failed', err)
    }
  }

  const formatHashtags = tags => {
    const parsedTags = parseHashtags(tags)
    return parsedTags.map(t => t.startsWith('#') ? t : `#${t}`)
  }

  const keywords = parseKeywords(safeIdea.primary_keywords)
  const hashtags = parseHashtags(safeIdea.hashtags)
  const score = calculateContentScore(safeIdea, keywordScores)

  /* ------- styling helpers ------- */
  const scoreStyle = score >= 80 ? 'text-green-600 bg-green-50 border-green-200'
    : score >= 60 ? 'text-yellow-600 bg-yellow-50 border-yellow-200'
      : 'text-red-600 bg-red-50 border-red-200'

  const platformGradients = {
    instagram: 'from-pink-500 to-purple-600',
    facebook: 'from-blue-600 to-blue-700',
    twitter: 'from-black to-gray-800',
    linkedin: 'from-blue-700 to-blue-800',
    tiktok: 'from-black to-pink-600',
    youtube: 'from-red-600 to-red-700',
    blog: 'from-green-600 to-green-700',
    pinterest: 'from-red-500 to-red-600'
  }

  const platformIcons = {
    instagram: '📷', facebook: '📘', twitter: '🐦', linkedin: '💼',
    tiktok: '🎵', youtube: '📹', blog: '📝', pinterest: '📌'
  }

  /* ------- render ------- */
  return (
    <li className="bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-all duration-200">
      {/* ------- header ------- */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            {safeIdea.platform && (
              <div className={`px-3 py-1 rounded-full bg-gradient-to-r ${platformGradients[safeIdea.platform] || 'from-gray-500 to-gray-600'} text-white text-sm font-semibold flex items-center space-x-2`}>
                <span>{platformIcons[safeIdea.platform] || '📱'}</span>
                <span className="capitalize">{safeIdea.platform}</span>
              </div>
            )}

            {safeIdea.image_description && (
              <div className="flex items-center space-x-1 text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs">
                <ImageIcon size={12} />
                <span>With Image</span>
              </div>
            )}

            <div className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full border ${scoreStyle}`}>
              🔥 {score}/100
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => copyToClipboard(safeIdea.content_body || safeIdea.description, safeIdea.id)}
              className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Copy content"
            >
              {copiedKey === safeIdea.id ? <Check size={16} /> : <Copy size={16} />}
            </button>
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="View details"
            >
              <ExternalLink size={16} />
            </button>
          </div>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-3">{safeIdea.title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{safeIdea.description}</p>

        {/* ------- content body preview ------- */}
        {safeIdea.content_body && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Ready-to-post content:</span>
              <button
                onClick={() => copyToClipboard(safeIdea.content_body, `${safeIdea.id}-body`)}
                className="text-xs text-blue-600 hover:text-blue-800 flex items-center space-x-1"
              >
                {copiedKey === `${safeIdea.id}-body` ? <Check size={12} /> : <Copy size={12} />}
                <span>Copy</span>
              </button>
            </div>
            <p className="text-gray-800 whitespace-pre-wrap">
              {safeIdea.content_body.length > 200 && !expanded
                ? `${safeIdea.content_body.slice(0, 200)}…`
                : safeIdea.content_body}
            </p>
            {safeIdea.content_body.length > 200 && (
              <button onClick={() => setExpanded(!expanded)}
                className="text-sm text-blue-600 hover:text-blue-800 mt-2">
                {expanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )}

        {/* ------- hashtags ------- */}
        {hashtags.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <Hash size={16} className="text-gray-400" />
              <span className="text-sm font-medium text-gray-700">Hashtags:</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {formatHashtags(hashtags).map((tag, i) => (
                <span key={i}
                  className="inline-block px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 cursor-pointer"
                  onClick={() => copyToClipboard(tag, `${safeIdea.id}-tag-${i}`)}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ------- call to action ------- */}
        {safeIdea.call_to_action && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-3 mb-4">
            <div className="flex items-center space-x-2 mb-1">
              <Target size={16} className="text-blue-600" />
              <span className="text-sm font-medium text-blue-800">Call to action:</span>
            </div>
            <p className="text-sm text-blue-700">{safeIdea.call_to_action}</p>
          </div>
        )}

        {/* ------- keywords w/ trend dots ------- */}
        <div className="mb-4">
          <p className="text-xs font-medium text-gray-700 mb-2">🎯 Keywords:</p>
          <div className="flex flex-wrap gap-1">
            {keywords.length === 0
              ? <span className="text-gray-500 text-xs">No keywords specified</span>
              : keywords.slice(0, 4).map((k, i) => {
                const kd = keywordScores[k?.toLowerCase()]
                const dot = kd
                  ? kd.trendScore >= 80 ? 'bg-green-500'
                    : kd.trendScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                  : 'bg-gray-300'
                return (
                  <span key={i}
                    className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                    {k}
                    <span className={`ml-1 w-2 h-2 rounded-full ${dot}`} />
                  </span>
                )
              })}
            {keywords.length > 4 && (
              <span className="text-xs text-gray-500">+{keywords.length - 4} more</span>
            )}
          </div>
        </div>
      </div>

      {/* ------- expanded extras ------- */}
      {expanded && (
        <div className="p-6 bg-gray-50 border-t border-gray-100 space-y-4">
          {safeIdea.image_description && (
            <section>
              <header className="flex items-center space-x-2 mb-1">
                <ImageIcon size={16} className="text-green-600" />
                <span className="text-sm font-medium text-gray-700">Image description:</span>
              </header>
              <p className="text-sm text-gray-800 bg-white border rounded p-3">{safeIdea.image_description}</p>
            </section>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {safeIdea.optimal_posting_time && (
              <section>
                <header className="flex items-center space-x-2 mb-1">
                  <Clock size={16} className="text-purple-600" />
                  <span className="text-sm font-medium text-gray-700">Best posting time:</span>
                </header>
                <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                  {safeIdea.optimal_posting_time}
                </p>
              </section>
            )}

            {safeIdea.engagement_strategy && (
              <section>
                <header className="flex items-center space-x-2 mb-1">
                  <TrendingUp size={16} className="text-orange-600" />
                  <span className="text-sm font-medium text-gray-700">Engagement strategy:</span>
                </header>
                <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                  {safeIdea.engagement_strategy}
                </p>
              </section>
            )}

            {safeIdea.seo_focus && (
              <section className="md:col-span-2">
                <header className="flex items-center space-x-2 mb-1">
                  <Target size={16} className="text-indigo-600" />
                  <span className="text-sm font-medium text-gray-700">SEO / Discovery focus:</span>
                </header>
                <p className="text-sm text-gray-600 bg-white p-2 rounded border">
                  {safeIdea.seo_focus}
                </p>
              </section>
            )}
          </div>
        </div>
      )}

      {/* ------- footer actions ------- */}
      <div className="px-6 py-4 bg-gray-50 border-t border-gray-100">
        <div className="flex items-center justify-between">
          <div className="flex space-x-3 text-sm">
            <button className="flex items-center space-x-1 bg-green-100 text-green-700 hover:bg-green-200 px-3 py-2 rounded-lg">
              <Check size={16} /><span>Approve</span>
            </button>
            <button className="flex items-center space-x-1 bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-2 rounded-lg">
              <Calendar size={16} /><span>Schedule</span>
            </button>
            <button className="flex items-center space-x-1 bg-purple-100 text-purple-700 hover:bg-purple-200 px-3 py-2 rounded-lg">
              <Share2 size={16} /><span>Publish</span>
            </button>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <span>Created {new Date(safeIdea.created_at).toLocaleDateString()}</span>
            <button className="text-gray-400 hover:text-red-600 p-1 rounded">
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      </div>
    </li>
  )
}