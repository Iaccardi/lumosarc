// hooks/useKeywordAnalysis.js
import { useState, useRef, useCallback } from 'react'

export function useKeywordAnalysis() {
  const [keywordScores, setKeywordScores] = useState({})
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState(null)
  
  // Track what we've already analyzed to prevent duplicates
  const analyzedRef = useRef(new Set())
  const pendingRef = useRef(false)
  
  const analyzeKeywords = useCallback(async (ideas) => {
    if (!ideas?.length || analyzing || pendingRef.current) {
      console.log('🔍 Skipping keyword analysis:', { 
        hasIdeas: !!ideas?.length, 
        analyzing, 
        pending: pendingRef.current 
      })
      return keywordScores
    }
    
    // Extract unique keywords from all ideas
    const allKeywords = [...new Set(ideas.flatMap(idea => idea.primary_keywords || []))]
    
    // Filter out keywords we've already analyzed
    const newKeywords = allKeywords.filter(keyword => 
      !analyzedRef.current.has(keyword.toLowerCase())
    )
    
    if (newKeywords.length === 0) {
      console.log('🔍 No new keywords to analyze')
      return keywordScores
    }
    
    try {
      pendingRef.current = true
      setAnalyzing(true)
      setError(null)
      
      console.log('🔍 Analyzing', newKeywords.length, 'new keywords:', newKeywords)
      
      const response = await fetch('/api/trending-keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keywords: newKeywords }),
      })
      
      if (!response.ok) {
        throw new Error(`Analysis failed: ${response.status}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        // Mark these keywords as analyzed
        newKeywords.forEach(keyword => {
          analyzedRef.current.add(keyword.toLowerCase())
        })
        
        // Merge new scores with existing scores
        const updatedScores = { ...keywordScores }
        result.keywordScores.forEach(score => {
          updatedScores[score.keyword] = score
        })
        
        setKeywordScores(updatedScores)
        
        console.log('✅ Keyword analysis complete:', {
          total: result.totalAnalyzed,
          fromCache: result.fromCache,
          newAnalyzed: result.newAnalyzed
        })
        
        return updatedScores
      } else {
        throw new Error(result.error || 'Analysis failed')
      }
      
    } catch (err) {
      console.error('🔍 Keyword analysis error:', err)
      setError(err.message)
      return keywordScores
    } finally {
      setAnalyzing(false)
      pendingRef.current = false
    }
  }, [keywordScores, analyzing])
  
  const clearAnalysis = useCallback(() => {
    setKeywordScores({})
    setError(null)
    analyzedRef.current.clear()
  }, [])
  
  return {
    keywordScores,
    analyzing,
    error,
    analyzeKeywords,
    clearAnalysis,
    hasAnalyzed: analyzedRef.current.size > 0
  }
}