'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../contexts/AuthContext'

export default function Navigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const authContext = useAuth()
  
  // Handle case where auth context might be undefined
  const user = authContext?.user || null
  const loading = authContext?.loading !== false // Default to loading if undefined
  const signOut = authContext?.signOut

  useEffect(() => {
    setMounted(true)
  }, [])

  // Enhanced debug logging
  console.log('🧭 Navigation render state:', { 
    mounted,
    hasUser: !!user, 
    userId: user?.id, 
    loading,
    userEmail: user?.email,
    authContext: !!authContext,
    authContextKeys: authContext ? Object.keys(authContext) : 'undefined'
  })

  const handleSignOut = async () => {
    if (signOut) {
      await signOut()
      window.location.href = '/'
    }
  }

  // Don't show auth-dependent content until mounted
  if (!mounted) {
    return (
      <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">LA</span>
                </div>
                <span className="text-xl font-bold text-gray-900">Lumos Arc</span>
              </Link>
            </div>

            {/* Basic nav without auth state */}
            <div className="hidden md:flex items-center space-x-8">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">
                Features
              </Link>
              <Link href="/#platforms" className="text-gray-600 hover:text-gray-900 transition-colors">
                Platforms
              </Link>
              <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
                Pricing
              </Link>
              {/* Loading placeholder */}
              <div className="w-20 h-6 bg-gray-200 rounded animate-pulse"></div>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="text-gray-600 hover:text-gray-900"
              >
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>
    )
  }

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">LA</span>
              </div>
              <span className="text-xl font-bold text-gray-900">Lumos Arc</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/#features" className="text-gray-600 hover:text-gray-900 transition-colors">
              Features
            </Link>
            <Link href="/#platforms" className="text-gray-600 hover:text-gray-900 transition-colors">
              Platforms
            </Link>
            <Link href="/#pricing" className="text-gray-600 hover:text-gray-900 transition-colors">
              Pricing
            </Link>

            {/* Auth-dependent navigation */}
            {!mounted || loading ? (
              // Show loading state
              <div className="flex items-center space-x-4">
                <div className="w-16 h-6 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-24 h-8 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ) : user ? (
              // Logged in state - SIMPLIFIED
              <div className="flex items-center space-x-4">
                <Link 
                  href="/dashboard" 
                  className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
                >
                  Dashboard
                </Link>
                
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-700">{user.email?.split('@')[0]}</span>
                </div>
                
                <button 
                  onClick={handleSignOut}
                  className="text-red-600 hover:text-red-700 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              // Logged out state
              <div className="flex items-center space-x-4">
                <Link 
                  href="/auth/login" 
                  className="text-gray-600 hover:text-gray-900 transition-colors font-medium"
                >
                  Login
                </Link>
                <Link 
                  href="/pricing" 
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors font-medium"
                >
                  Start Free Trial
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-gray-900"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-3">
              <Link href="/#features" className="text-gray-600 hover:text-gray-900">Features</Link>
              <Link href="/#platforms" className="text-gray-600 hover:text-gray-900">Platforms</Link>
              <Link href="/#pricing" className="text-gray-600 hover:text-gray-900">Pricing</Link>
              
              {!mounted || loading ? (
                <div className="space-y-2">
                  <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
                  <div className="w-full h-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : user ? (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <div className="text-sm text-gray-500 px-3">
                    Signed in as {user.email}
                  </div>
                  <Link 
                    href="/dashboard" 
                    className="block text-gray-900 font-medium hover:text-blue-600"
                  >
                    📊 Dashboard
                  </Link>
                  <button 
                    onClick={handleSignOut}
                    className="block w-full text-left text-red-600 hover:text-red-700"
                  >
                    🚪 Sign Out
                  </button>
                </div>
              ) : (
                <div className="space-y-3 pt-3 border-t border-gray-200">
                  <Link href="/auth/login" className="block text-gray-600 hover:text-gray-900">
                    Login
                  </Link>
                  <Link href="/pricing" className="block bg-blue-600 text-white px-4 py-2 rounded-lg text-center">
                    Start Free Trial
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}