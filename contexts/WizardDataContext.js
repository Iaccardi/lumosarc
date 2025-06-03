'use client'

import { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from './AuthContext'

const WizardDataContext = createContext({})

export const useWizardData = () => {
  const context = useContext(WizardDataContext)
  if (!context) {
    throw new Error('useWizardData must be used within a WizardDataProvider')
  }
  return context
}

export const WizardDataProvider = ({ children }) => {
  const { user } = useAuth()
  const [wizardData, setWizardData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  // Prevent duplicate calls
  const loadingRef = useRef(false)
  const loadedRef = useRef(false)
  
  const fetchWizardData = useCallback(async (force = false) => {
    if (!user?.id || (loadingRef.current && !force) || (loadedRef.current && !force)) {
      return wizardData
    }
    
    try {
      loadingRef.current = true
      setLoading(true)
      setError(null)
      
      console.log('🧙‍♂️ WizardDataContext: Fetching wizard data for user:', user.id)
      
      const res = await fetch(`/api/get-plan?user_id=${user.id}`, {
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      if (!res.ok) {
        throw new Error(`Failed to fetch wizard data: ${res.status}`)
      }
      
      const json = await res.json()
      
      const data = json.hasData ? {
        hasData: true,
        businessName: json.wizardData?.businessName || json.brandProfile?.brand_name,
        brandVoice: json.brandProfile?.brand_voice || json.wizardData?.brandVoice,
        platforms: json.wizardData?.platforms || [],
        ...json.wizardData,
        ...json.brandProfile,
        lastUpdated: json.lastUpdated
      } : null
      
      setWizardData(data)
      loadedRef.current = true
      
      console.log('🧙‍♂️ WizardDataContext: Data loaded successfully', !!data)
      return data
      
    } catch (err) {
      console.error('🧙‍♂️ WizardDataContext: Error fetching wizard data:', err)
      setError(err.message)
      return null
    } finally {
      setLoading(false)
      loadingRef.current = false
    }
  }, [user?.id, wizardData])
  
  // Load data when user changes
  useEffect(() => {
    if (user?.id && !loadedRef.current) {
      fetchWizardData()
    }
  }, [user?.id, fetchWizardData])
  
  // Reset when user changes
  useEffect(() => {
    if (!user) {
      setWizardData(null)
      setError(null)
      loadedRef.current = false
      loadingRef.current = false
    }
  }, [user])
  
  const refreshWizardData = useCallback(() => {
    loadedRef.current = false
    return fetchWizardData(true)
  }, [fetchWizardData])
  
  const value = {
    wizardData,
    loading,
    error,
    fetchWizardData,
    refreshWizardData,
    hasData: !!wizardData?.hasData
  }
  
  return (
    <WizardDataContext.Provider value={value}>
      {children}
    </WizardDataContext.Provider>
  )
}