'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

import {
  Sparkles,
  BarChart3,
  Filter,
  Search,
  Calendar,
  TrendingUp,
  Grid3X3,
  List,
  RefreshCw,
} from 'lucide-react'

import ContentGrid       from '../dashboard/content/ContentGrid'
import ContentList       from '../dashboard/content/ContentList'
import SearchAndFilters  from '../dashboard/content/SearchAndFilters'
import UsageStatsBar     from '../dashboard/content/UsageStatsBar'
import WizardBanner      from '../dashboard/content/WizardBanner'

export default function ContentTab() {
  const { user, trialStatus } = useAuth()

  /* ───────── state */
  const [contentIdeas, setContentIdeas] = useState([])
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')

  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'list'

  const [filters, setFilters] = useState({
    search: '',
    platform: 'all',
    contentType: 'all',
    status: 'all',
    sortBy: 'score', // 'score' | 'date' | 'platform' | 'alphabetical'
  })

  /* pagination */
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12

  /* usage bar */
  const [usageStats, setUsageStats] = useState({
    currentMonth: 0,
    limit: 50,
    resetDate: new Date(),
  })

  /* keyword analysis */
  const [analyzingKeywords, setAnalyzingKeywords] = useState(false)
  const [keywordScores, setKeywordScores]         = useState({})

  /* wizard banner */
  const [wizardData, setWizardData] = useState(null)

  /* ───────── Define contentScore function FIRST ───────── */
  const contentScore = (idea) => {
    if (!Array.isArray(idea.primary_keywords)) return 0
    const avg = idea.primary_keywords.reduce((s, k) => s + (keywordScores[k]?.trendScore ?? 50), 0) /
                idea.primary_keywords.length
    const typeBonus = { video: 10, social_media: 5, blog_post: 0, carousel: 8, story: 3 }[
      idea.content_type
    ] ?? 0
    return Math.round(avg + typeBonus)
  }

  /* ───────── initial data load */
  useEffect(() => {
    if (!user) return
    Promise.all([fetchContentIdeas(), fetchUsageStats(), fetchWizardData()])
  }, [user])

  /* ───────── data fetchers */
  const fetchContentIdeas = async () => {
    if (!user) return
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('content_ideas')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setContentIdeas(data || [])
    } catch (err) {
      setError('Failed to load content ideas')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fetchUsageStats = async () => {
    if (!user) return
    try {
      const { data, error } = await supabase.rpc('get_user_usage_stats', {
        p_user_id: user.id,
      })
      if (error) throw error

      const stats = data?.[0] || {
        ideas_this_month: 0,
        posts_this_month: 0,
        total_ideas: 0,
        total_posts: 0,
      }

      const tierLimits = { starter: 50, professional: 200, enterprise: 999_999 }
      const userTier   = trialStatus?.tier || 'starter'

      setUsageStats({
        currentMonth: stats.ideas_this_month,
        postsThisMonth: stats.posts_this_month,
        totalIdeas: stats.total_ideas,
        totalPosts: stats.total_posts,
        limit: tierLimits[userTier] ?? 50,
        resetDate: new Date(new Date().getFullYear(), new Date().getMonth() + 1, 1),
      })
    } catch (err) {
      console.error('Error fetching usage stats:', err)
    }
  }

  const fetchWizardData = async () => {
    if (!user) return
    try {
      const res = await fetch(`/api/get-plan?user_id=${user.id}`)
      if (res.ok) {
        const json = await res.json()
        if (json.hasData) {
          setWizardData({
            hasData: true,
            businessName: json.wizardData?.businessName || json.brandProfile?.brand_name,
            brandVoice:   json.brandProfile?.brand_voice || json.wizardData?.brandVoice,
            ...json.wizardData,
            ...json.brandProfile,
          })
        }
      }
    } catch (err) {
      console.error('Error fetching wizard data:', err)
    }
  }

  /* ───────── keyword trend helper */
  const analyzeKeywords = async (ideas) => {
    if (!ideas?.length) return
    try {
      setAnalyzingKeywords(true)
      const unique = [...new Set(ideas.flatMap((i) => i.primary_keywords || []))]
      const res = await fetch('/api/trending-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: unique }),
      })
      const result = await res.json()
      if (result.success) {
        const map = {}
        result.keywordScores.forEach((k) => (map[k.keyword] = k))
        setKeywordScores(map)
      }
    } catch (err) {
      console.error('Keyword analysis error:', err)
    } finally {
      setAnalyzingKeywords(false)
    }
  }

  /* ───────── filter + sort */
  const filteredAndSortedContent = () => {
    let data = contentIdeas

    if (filters.search) {
      const q = filters.search.toLowerCase()
      data = data.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.description?.toLowerCase().includes(q) ||
          i.primary_keywords?.some((k) => k.toLowerCase().includes(q))
      )
    }
    if (filters.platform !== 'all')
      data = data.filter((i) => i.platform === filters.platform)
    if (filters.contentType !== 'all')
      data = data.filter((i) => i.content_type === filters.contentType)
    if (filters.status !== 'all')
      data = data.filter((i) => i.status === filters.status)

    data.sort((a, b) => {
      switch (filters.sortBy) {
        case 'score':
          return contentScore(b) - contentScore(a)
        case 'date':
          return new Date(b.created_at) - new Date(a.created_at)
        case 'platform':
          return (a.platform || '').localeCompare(b.platform || '')
        case 'alphabetical':
          return (a.title || '').localeCompare(b.title || '')
        default:
          return 0
      }
    })
    return data
  }

  /* pagination slice */
  const paginated = filteredAndSortedContent().slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredAndSortedContent().length / itemsPerPage)

  /* helpers */
  const handleRefresh = () => {
    Promise.all([fetchContentIdeas(), fetchUsageStats()])
  }

  /* ───────── render */
  return (
    <div className="space-y-6">
      {/* wizard banner */}
      <WizardBanner data={wizardData} />

      {/* usage bar */}
      <UsageStatsBar usage={usageStats} />

      {/* header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-blue-600" size={28} />
            Content Library
          </h1>
          <p className="text-gray-600 mt-1">
            {contentIdeas.length} ideas generated • {filteredAndSortedContent().length} matching
            filters
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* keyword trends */}
          <button
            onClick={() => analyzeKeywords(contentIdeas)}
            disabled={analyzingKeywords || !contentIdeas.length}
            className="flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-lg
                       hover:bg-purple-200 disabled:opacity-50 transition-colors"
          >
            {analyzingKeywords ? (
              <RefreshCw className="animate-spin" size={16} />
            ) : (
              <TrendingUp size={16} />
            )}
            <span className="text-sm font-medium">
              {analyzingKeywords ? 'Analyzing…' : 'Analyze Trends'}
            </span>
          </button>

          {/* view toggle */}
          <div className="flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded ${viewMode === 'grid' ? 'bg-white shadow' : ''}`}
            >
              <Grid3X3 size={16} className={viewMode === 'grid' ? 'text-blue-600' : 'text-gray-500'} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded ${viewMode === 'list' ? 'bg-white shadow' : ''}`}
            >
              <List size={16} className={viewMode === 'list' ? 'text-blue-600' : 'text-gray-500'} />
            </button>
          </div>

          {/* refresh */}
          <button
            onClick={handleRefresh}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <RefreshCw size={16} />
          </button>
        </div>
      </div>

      {/* filters */}
      <SearchAndFilters
        filters={filters}
        onFiltersChange={setFilters}
        hasContent={contentIdeas.length > 0}
        loading={loading}
      />

      {/* error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">{error}</div>
      )}

      {/* content display */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="animate-spin text-blue-600" size={24} />
          <span className="ml-3 text-lg text-gray-600">Loading content…</span>
        </div>
      ) : filteredAndSortedContent().length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <div className="text-6xl mb-4">🎨</div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No content found</h3>
          <p className="text-gray-600">
            Try adjusting your filters or search terms.
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <ContentGrid ideas={paginated} keywordScores={keywordScores} onIdeaUpdate={handleRefresh} />
          ) : (
            <ContentList ideas={paginated} keywordScores={keywordScores} onIdeaUpdate={handleRefresh} />
          )}

          {/* pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between bg-white rounded-lg border border-gray-200 px-6 py-4">
              <div className="text-sm text-gray-600">
                Showing {(currentPage - 1) * itemsPerPage + 1}–
                {Math.min(currentPage * itemsPerPage, filteredAndSortedContent().length)} of{' '}
                {filteredAndSortedContent().length} ideas
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
                             hover:bg-gray-50 disabled:opacity-50"
                >
                  Previous
                </button>

                <span className="text-sm text-gray-700">
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md
                             hover:bg-gray-50 disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}