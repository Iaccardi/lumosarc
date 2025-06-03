'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [trialStatus, setTrialStatus] = useState(null)

  useEffect(() => {
    console.log('🔐 AuthProvider: Starting auth initialization...')

    let mounted = true

    const initializeAuth = async () => {
      try {
        // Add timeout to prevent hanging
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Session timeout')), 5000)
        )

        const sessionPromise = supabase.auth.getSession()

        const { data: { session }, error } = await Promise.race([
          sessionPromise,
          timeoutPromise
        ])

        if (!mounted) return

        if (error) {
          console.error('🔐 Session error:', error)
          setUser(null)
        } else if (session?.user) {
          console.log('🔐 Found session for user:', session.user.id)
          setUser(session.user)
          fetchTrialStatus(session.user.id)
        } else {
          console.log('🔐 No session found')
          setUser(null)
        }
      } catch (error) {
        console.error('🔐 Auth initialization error:', error)
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          console.log('🔐 Setting loading to false')
          setLoading(false)
        }
      }
    }

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔐 Auth state change:', event)
        
        if (!mounted) return

        if (session?.user) {
          setUser(session.user)
          if (event === 'SIGNED_IN') {
            fetchTrialStatus(session.user.id)
          }
        } else {
          setUser(null)
          setTrialStatus(null)
        }

        // Ensure loading is false after any auth state change
        setLoading(false)
      }
    )

    // Initialize auth
    initializeAuth()

    // Cleanup
    return () => {
      mounted = false
      subscription?.unsubscribe()
    }
  }, [])

  const fetchTrialStatus = async (userId) => {
    try {
      console.log('🔐 Fetching trial status for user:', userId)
      
      const { data, error } = await supabase
        .from('user_profiles')
        .select('trial_end_date, subscription_status, subscription_tier')
        .eq('user_id', userId)
        .single()

      if (error) {
        console.error('Trial status error:', error)
        // Set default trial status if query fails
        setTrialStatus({
          tier: 'starter',
          subscriptionStatus: 'trial',
          isActive: true,
          daysRemaining: 14
        })
        return
      }

      const trialEndDate = new Date(data.trial_end_date)
      const now = new Date()
      const daysRemaining = Math.ceil((trialEndDate - now) / (1000 * 60 * 60 * 24))

      setTrialStatus({
        ...data,
        endDate: data.trial_end_date,
        isActive: trialEndDate > now,
        daysRemaining: Math.max(0, daysRemaining),
        tier: data.subscription_tier || 'starter',
        subscriptionStatus: data.subscription_status || 'trial'
      })

      console.log('🔐 Trial status updated:', {
        tier: data.subscription_tier,
        status: data.subscription_status,
        daysRemaining
      })
    } catch (error) {
      console.error('Trial status fetch error:', error)
      // Set default on error
      setTrialStatus({
        tier: 'starter',
        subscriptionStatus: 'trial',
        isActive: true,
        daysRemaining: 14
      })
    }
  }

  const signIn = async (email, password) => {
    try {
      console.log('🔐 Sign in attempt for:', email)
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('🔐 Sign in error:', error)
        return { data: null, error }
      }

      console.log('🔐 Sign in successful')
      return { data, error: null }
    } catch (error) {
      console.error('🔐 Sign in exception:', error)
      return { data: null, error }
    }
  }

  const signUp = async (email, password, tier = 'starter') => {
    try {
      console.log('🔐 Sign up attempt for:', email)

      const { data, error } = await supabase.auth.signUp({
        email,
        password
      })

      if (error) {
        console.error('🔐 Sign up error:', error)
        return { data: null, error }
      }

      if (data.user) {
        // Create user profile
        const trialEndDate = new Date()
        trialEndDate.setDate(trialEndDate.getDate() + 14)

        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert([
            {
              user_id: data.user.id,
              subscription_tier: tier,
              subscription_status: 'trial',
              trial_end_date: trialEndDate.toISOString()
            }
          ])

        if (profileError) {
          console.error('🔐 Profile creation error:', profileError)
        }
      }

      console.log('🔐 Sign up successful')
      return { data, error: null }
    } catch (error) {
      console.error('🔐 Sign up exception:', error)
      return { data: null, error }
    }
  }

  const signOut = async () => {
    try {
      console.log('🔐 Signing out...')
      
      const { error } = await supabase.auth.signOut()
      
      if (error) {
        console.error('🔐 Sign out error:', error)
      } else {
        console.log('🔐 Sign out successful')
        setUser(null)
        setTrialStatus(null)
      }
      
      return { error }
    } catch (error) {
      console.error('🔐 Sign out exception:', error)
      return { error }
    }
  }

  const value = {
    user,
    loading,
    trialStatus,
    signIn,
    signUp,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}