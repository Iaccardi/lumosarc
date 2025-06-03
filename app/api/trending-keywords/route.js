// app/api/trending-keywords/route.js
import { NextResponse } from 'next/server'

// Enhanced cache with deduplication
const scoreCache = new Map()
const CACHE_TTL = 6 * 60 * 60 * 1000 // 6 hours (keywords don't change that often)

// Track in-progress requests to prevent duplicate work
const pendingRequests = new Map()

export async function POST(request) {
  try {
    const { keywords } = await request.json()
    
    if (!keywords || !Array.isArray(keywords)) {
      return NextResponse.json(
        { success: false, error: 'Keywords array is required' },
        { status: 400 }
      )
    }

    // Parse and deduplicate keywords
    const parsedKeywords = parseKeywordsArray(keywords)
    console.log('🔍 Analyzing keywords:', parsedKeywords.length, 'unique keywords')

    if (parsedKeywords.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No valid keywords found' },
        { status: 400 }
      )
    }

    // Check cache and pending requests first
    const { cachedResults, newKeywords } = await separateCachedFromNew(parsedKeywords)
    
    let newResults = []
    if (newKeywords.length > 0) {
      console.log('🔍 Need to analyze', newKeywords.length, 'new keywords')
      newResults = await analyzeKeywordsWithDeduplication(newKeywords)
    } else {
      console.log('🚀 All keywords found in cache!')
    }

    // Combine cached and new results
    const allResults = [...cachedResults, ...newResults]

    return NextResponse.json({
      success: true,
      keywordScores: allResults,
      totalAnalyzed: allResults.length,
      fromCache: cachedResults.length,
      newAnalyzed: newResults.length,
      method: 'optimized-with-cache'
    })

  } catch (error) {
    console.error('🔍 Trending keywords error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to analyze keywords' },
      { status: 500 }
    )
  }
}

async function separateCachedFromNew(keywords) {
  const cachedResults = []
  const newKeywords = []
  
  for (const keyword of keywords) {
    const cached = getCachedScore(keyword)
    if (cached) {
      cachedResults.push(cached)
    } else {
      newKeywords.push(keyword)
    }
  }
  
  return { cachedResults, newKeywords }
}

async function analyzeKeywordsWithDeduplication(keywords) {
  const results = []
  const batchSize = 5 // Process in small batches to be nice to external APIs
  
  for (let i = 0; i < keywords.length; i += batchSize) {
    const batch = keywords.slice(i, i + batchSize)
    const batchPromises = batch.map(keyword => analyzeKeywordWithPending(keyword))
    
    try {
      const batchResults = await Promise.all(batchPromises)
      results.push(...batchResults.filter(r => r !== null))
      
      // Small delay between batches
      if (i + batchSize < keywords.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    } catch (error) {
      console.error('🔍 Batch analysis error:', error)
      // Continue with fallback scores for failed batch
      const fallbackResults = batch.map(generateFallbackScore)
      results.push(...fallbackResults)
    }
  }
  
  return results
}

async function analyzeKeywordWithPending(keyword) {
  const normalizedKeyword = keyword.toLowerCase().trim()
  
  // Check if this keyword is already being processed
  if (pendingRequests.has(normalizedKeyword)) {
    console.log('🔍 Waiting for pending request for:', normalizedKeyword)
    try {
      return await pendingRequests.get(normalizedKeyword)
    } catch (error) {
      console.error('🔍 Pending request failed for:', normalizedKeyword, error)
      return generateFallbackScore(keyword)
    }
  }
  
  // Start new analysis
  const analysisPromise = performKeywordAnalysis(keyword)
  pendingRequests.set(normalizedKeyword, analysisPromise)
  
  try {
    const result = await analysisPromise
    cacheScore(keyword, result)
    return result
  } catch (error) {
    console.error(`🔍 Analysis failed for "${keyword}":`, error)
    return generateFallbackScore(keyword)
  } finally {
    pendingRequests.delete(normalizedKeyword)
  }
}

async function performKeywordAnalysis(keyword) {
  try {
    // Multi-source scoring (all free!)
    const [suggestions, heuristicScore, timeBasedScore] = await Promise.all([
      getGoogleSuggestions(keyword),
      calculateHeuristicScore(keyword),
      calculateTimeBasedScore(keyword)
    ])
    
    const suggestionScore = calculateSuggestionScore(keyword, suggestions)
    
    // Weighted combination
    const finalScore = Math.round(
      (suggestionScore * 0.4) + 
      (heuristicScore * 0.4) + 
      (timeBasedScore * 0.2)
    )
    
    return {
      keyword,
      trendScore: Math.max(15, Math.min(90, finalScore)),
      searchVolume: estimateVolume(suggestions.length, keyword),
      competition: estimateCompetition(suggestions, keyword),
      trend: estimateTrend(suggestions, keyword),
      confidence: calculateConfidence(suggestions.length),
      suggestionsCount: suggestions.length,
      lastUpdated: new Date().toISOString(),
      method: 'multi-tier-optimized'
    }
  } catch (error) {
    console.error(`🔍 Keyword analysis failed for "${keyword}":`, error)
    throw error
  }
}

function parseKeywordsArray(keywords) {
  const allKeywords = []
  
  for (const item of keywords) {
    if (typeof item === 'string') {
      try {
        // Try parsing as JSON first (for stringified arrays)
        const parsed = JSON.parse(item)
        if (Array.isArray(parsed)) {
          allKeywords.push(...parsed)
        } else {
          allKeywords.push(item)
        }
      } catch (e) {
        // If JSON parsing fails, treat as comma-separated or single keyword
        if (item.includes(',')) {
          allKeywords.push(...item.split(',').map(k => k.trim()))
        } else {
          allKeywords.push(item)
        }
      }
    } else if (Array.isArray(item)) {
      allKeywords.push(...item)
    } else if (item) {
      allKeywords.push(String(item))
    }
  }
  
  // Clean and deduplicate
  const cleanKeywords = [...new Set(
    allKeywords
      .map(k => String(k).trim().toLowerCase())
      .filter(k => k.length > 0 && k.length <= 50) // Reasonable length limits
  )]
  
  return cleanKeywords.slice(0, 20) // Limit to 20 keywords to avoid overload
}

async function getGoogleSuggestions(keyword) {
  try {
    const encodedKeyword = encodeURIComponent(keyword.toLowerCase())
    const response = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodedKeyword}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        },
        signal: AbortSignal.timeout(3000) // 3 second timeout
      }
    )
    
    if (!response.ok) {
      console.warn(`🔍 Google suggestions failed for "${keyword}": ${response.status}`)
      return []
    }
    
    const data = await response.json()
    const suggestions = data[1] || []
    return suggestions
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.warn(`🔍 Suggestions timeout for "${keyword}"`)
    } else {
      console.warn(`🔍 Suggestions failed for "${keyword}":`, error.message)
    }
    return []
  }
}

function calculateHeuristicScore(keyword) {
  let score = 50
  const lowerKeyword = keyword.toLowerCase()
  
  // High-value content patterns
  const contentPatterns = {
    'how to': 25, 'best': 20, 'top': 18, 'guide': 15, 'tips': 15,
    'tutorial': 12, 'review': 10, 'vs': 8, 'comparison': 8,
    'free': 12, 'online': 8, 'course': 10, 'tool': 8
  }
  
  for (const [pattern, boost] of Object.entries(contentPatterns)) {
    if (lowerKeyword.includes(pattern)) {
      score += boost
      break
    }
  }
  
  // 2024/2025 content boost
  if (lowerKeyword.includes('2024') || lowerKeyword.includes('2025')) {
    score += 15
  }
  
  // Trending topics (updated for 2025)
  const trendingTopics = {
    'ai': 25, 'artificial intelligence': 25, 'chatgpt': 20, 'automation': 18,
    'remote work': 15, 'productivity': 12, 'sustainability': 12,
    'mental health': 15, 'wellness': 12, 'fitness': 10,
    'crypto': 12, 'blockchain': 8, 'startup': 10, 'saas': 12
  }
  
  for (const [topic, boost] of Object.entries(trendingTopics)) {
    if (lowerKeyword.includes(topic)) {
      score += boost
      break
    }
  }
  
  // Length optimization
  if (keyword.length > 30) score -= 10
  if (keyword.length < 5) score += 5
  
  // Word count sweet spot
  const wordCount = keyword.split(' ').length
  if (wordCount >= 2 && wordCount <= 4) score += 8
  
  return Math.max(20, Math.min(80, score))
}

function calculateTimeBasedScore(keyword) {
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  
  let score = 50
  
  // Seasonal keywords get boost in their season
  const seasonalKeywords = {
    1: ['new year', 'resolution', 'diet', 'fitness', 'goals'],
    2: ['valentine', 'love', 'relationship'],
    3: ['spring', 'cleaning', 'garden', 'renewal'],
    4: ['easter', 'spring break', 'taxes', 'planning'],
    5: ['mother', 'graduation', 'outdoor', 'garden'],
    6: ['summer', 'vacation', 'travel', 'outdoor'],
    7: ['independence', 'july', 'summer', 'vacation'],
    8: ['back to school', 'college', 'education'],
    9: ['fall', 'autumn', 'school', 'productivity'],
    10: ['halloween', 'october', 'scary', 'costume'],
    11: ['thanksgiving', 'gratitude', 'black friday', 'holiday'],
    12: ['christmas', 'holiday', 'gift', 'year end', 'reflection']
  }
  
  const currentSeasonalKeywords = seasonalKeywords[month] || []
  if (currentSeasonalKeywords.some(seasonal => keyword.toLowerCase().includes(seasonal))) {
    score += 15
  }
  
  // Current year content
  if (keyword.includes(year.toString())) score += 12
  if (keyword.includes((year + 1).toString())) score += 8
  
  return score
}

function calculateSuggestionScore(keyword, suggestions) {
  let score = 30
  const suggestionCount = suggestions.length
  
  // More suggestions = higher interest
  if (suggestionCount >= 8) score += 25
  else if (suggestionCount >= 5) score += 18
  else if (suggestionCount >= 3) score += 12
  else if (suggestionCount >= 1) score += 6
  else score -= 10 // No suggestions is bad
  
  // Quality indicators in suggestions
  const qualityIndicators = [
    'how to', 'best', 'top', 'guide', 'tutorial', 'tips',
    '2024', '2025', 'new', 'latest', 'trending'
  ]
  
  const qualitySuggestions = suggestions.filter(suggestion =>
    qualityIndicators.some(indicator => 
      suggestion.toLowerCase().includes(indicator)
    )
  )
  
  score += qualitySuggestions.length * 4
  
  // Exact match in suggestions (high relevance)
  if (suggestions.some(s => s.toLowerCase().includes(keyword.toLowerCase()))) {
    score += 8
  }
  
  return Math.max(10, Math.min(85, score))
}

function estimateVolume(suggestionCount, keyword) {
  if (suggestionCount >= 8) return 'High (10K+)'
  if (suggestionCount >= 5) return 'Medium (1K+)'
  if (suggestionCount >= 2) return 'Low (100+)'
  return 'Very Low (<100)'
}

function estimateCompetition(suggestions, keyword) {
  const competitiveIndicators = ['best', 'top', 'review', 'vs', 'comparison', 'guide']
  const hasCompetitive = suggestions.some(s => 
    competitiveIndicators.some(indicator => s.toLowerCase().includes(indicator))
  )
  
  if (hasCompetitive && suggestions.length >= 6) return 'High'
  if (suggestions.length >= 4) return 'Medium'
  return 'Low'
}

function estimateTrend(suggestions, keyword) {
  const risingIndicators = ['2024', '2025', 'new', 'latest', 'trending', 'now', 'current']
  const decliningIndicators = ['old', 'outdated', 'deprecated', 'legacy']
  
  const hasRising = suggestions.some(s => 
    risingIndicators.some(indicator => s.toLowerCase().includes(indicator))
  )
  
  const hasDeclining = suggestions.some(s => 
    decliningIndicators.some(indicator => s.toLowerCase().includes(indicator))
  )
  
  if (hasRising) return 'Rising'
  if (hasDeclining || suggestions.length < 2) return 'Declining'
  return 'Stable'
}

function calculateConfidence(suggestionCount) {
  if (suggestionCount >= 6) return 'High'
  if (suggestionCount >= 3) return 'Medium'
  if (suggestionCount >= 1) return 'Low'
  return 'Very Low'
}

function generateFallbackScore(keyword) {
  const baseScore = 35 + Math.random() * 30 // 35-65 range
  
  return {
    keyword,
    trendScore: Math.round(baseScore),
    searchVolume: 'Unknown',
    competition: 'Medium',
    trend: 'Stable',
    confidence: 'Low',
    suggestionsCount: 0,
    lastUpdated: new Date().toISOString(),
    method: 'fallback'
  }
}

function getCachedScore(keyword) {
  const cached = scoreCache.get(keyword.toLowerCase())
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return { ...cached.score, cached: true }
  }
  if (cached) {
    scoreCache.delete(keyword.toLowerCase()) // Remove expired
  }
  return null
}

function cacheScore(keyword, score) {
  scoreCache.set(keyword.toLowerCase(), {
    score,
    timestamp: Date.now()
  })
  
  // Prevent memory leaks
  if (scoreCache.size > 1000) {
    const firstKey = scoreCache.keys().next().value
    scoreCache.delete(firstKey)
  }
}