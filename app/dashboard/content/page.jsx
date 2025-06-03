'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import WizardBanner from '@/components/content/WizardBanner'
import UsageStatsBar from '@/components/content/UsageStatsBar'
import GenerationForm from '@/components/content/GenerationForm'
import SearchAndFilters from '@/components/content/SearchAndFilters'
import IdeasList from '@/components/content/IdeasList'
import Pagination from '@/components/content/Pagination'
import {
  fetchWizardData,
  fetchUserUsage,
  fetchSavedIdeas,
  parseKeywords,
  parseHashtags,
  calcContentScore
} from '@/utils/contentHelpers'

export default function ContentPage () {
  const { user, trialStatus } = useAuth()

  /* ───────────── State ───────────── */
  const [wizardData, setWizardData]       = useState(null)
  const [usage, setUsage]                 = useState(null)
  const [ideas, setIdeas]                 = useState([])
  const [filters, setFilters]             = useState({ search:'', type:'all', sort:'score' })
  const [page, setPage]                   = useState(1)
  const [loading, setLoading]             = useState(true)
  const perPage = 8

  /* ───────────── LOAD USER DATA ───────────── */
  useEffect(() => { if (user) init() }, [user])

  const init = async () => {
    setLoading(true)
    const [wiz, usageStats, savedIdeas] = await Promise.all([
      fetchWizardData(user.id),
      fetchUserUsage(user.id, trialStatus?.tier),
      fetchSavedIdeas(user.id)
    ])
    setWizardData(wiz)
    setUsage(usageStats)
    setIdeas(savedIdeas)
    setLoading(false)
  }

  /* ───────────── FILTER / SORT MEMO ───────────── */
  const filteredIdeas = ideas
    .filter(i => {
      const txt = `${i.title} ${i.description} ${i.content_body}`.toLowerCase()
      return txt.includes(filters.search.toLowerCase()) &&
             (filters.type==='all' || i.platform === filters.type || i.content_type === filters.type)
    })
    .sort((a,b)=> {
      switch (filters.sort) {
        case 'recent':      return new Date(b.created_at) - new Date(a.created_at)
        case 'platform':    return (a.platform||'').localeCompare(b.platform||'')
        case 'alphabetical':return a.title.localeCompare(b.title)
        default:            return calcContentScore(b) - calcContentScore(a)
      }
    })

  const pageIdeas = filteredIdeas.slice((page-1)*perPage, page*perPage)
  const totalPages = Math.max(1, Math.ceil(filteredIdeas.length / perPage))

  /* ───────────── HANDLERS ───────────── */
  const onGenerate = useCallback(() => {
    // callback from GenerationForm → refresh ideas & usage
    init()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center h-64">Loading…</div>
  )

  return (
    <div className="space-y-6">
      <WizardBanner data={wizardData} />
      <UsageStatsBar usage={usage} />

      <GenerationForm
        wizardData={wizardData}
        usage={usage}
        onGenerate={onGenerate}
      />

      {ideas.length > 0 && (
        <>
          <SearchAndFilters
            value={filters}
            onChange={setFilters}
            hasIdeas={ideas.length>0}
          />

          <IdeasList
            ideas={pageIdeas}
            keywordScores={wizardData?.keywordScores || {}}
            onCopy={() => {}}                         /* already handled inside card */
          />

          <Pagination
            page={page}
            totalPages={totalPages}
            onChange={setPage}
            showing={{
              from:(page-1)*perPage+1,
              to:  Math.min(page*perPage, filteredIdeas.length),
              total:filteredIdeas.length
            }}
          />
        </>
      )}
    </div>
  )
}
