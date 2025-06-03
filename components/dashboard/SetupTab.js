'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'
import { CheckCircle, Circle, ArrowRight, ExternalLink } from 'lucide-react'

export default function SetupTab() {
  const { user } = useAuth()
  const [setupProgress, setSetupProgress] = useState({
    brandSettingsComplete: false,
    wizardComplete: false,
    selectedPlatforms: [],
    connectedPlatforms: [],
    hasGeneratedContent: false,
    hasScheduledContent: false
  })
  const [loading, setLoading] = useState(true)

  // Platform configurations
  const platformConfigs = {
    instagram: { name: 'Instagram', icon: '📷', color: 'from-pink-500 to-purple-500' },
    facebook: { name: 'Facebook', icon: '📘', color: 'from-blue-600 to-blue-700' },
    twitter: { name: 'Twitter/X', icon: '🐦', color: 'from-black to-gray-700' },
    linkedin: { name: 'LinkedIn', icon: '💼', color: 'from-blue-700 to-blue-800' },
    tiktok: { name: 'TikTok', icon: '🎵', color: 'from-black to-red-500' },
    youtube: { name: 'YouTube', icon: '📹', color: 'from-red-500 to-red-600' },
    pinterest: { name: 'Pinterest', icon: '📌', color: 'from-red-500 to-pink-500' },
    threads: { name: 'Threads', icon: '🧵', color: 'from-black to-gray-600' }
  }

  useEffect(() => {
    if (user?.id) {
      loadSetupProgress()
    }
  }, [user?.id])

  const loadSetupProgress = async () => {
    try {
      setLoading(true)
      
      // Load wizard data and brand profile data
      const wizardResponse = await fetch(`/api/get-plan?user_id=${user.id}`)
      const wizardData = await wizardResponse.json()
      
      // Check if brand settings are complete
      const hasBrandProfile = wizardData.brandProfile && (
        wizardData.brandProfile.brand_voice || 
        wizardData.brandProfile.writing_style ||
        wizardData.brandProfile.brand_values?.length > 0
      )
      
      // Load platform connections (you'll implement this API later)
      // const connectionResponse = await fetch(`/api/get-connections?user_id=${user.id}`)
      // const connectionData = await connectionResponse.json()
      
      // Load content generation status
      // const contentResponse = await fetch(`/api/get-content-status?user_id=${user.id}`)
      // const contentData = await contentResponse.json()

      setSetupProgress({
        brandSettingsComplete: hasBrandProfile,
        wizardComplete: wizardData.hasData,
        selectedPlatforms: wizardData.wizardData?.platforms || [],
        connectedPlatforms: [], // connectionData.connected || [] (implement later)
        hasGeneratedContent: false, // contentData.hasContent || false (implement later)
        hasScheduledContent: false // contentData.hasScheduled || false (implement later)
      })
      
    } catch (error) {
      console.error('Failed to load setup progress:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleConnectPlatform = (platformId) => {
    // This will trigger OAuth flow (implement later)
    console.log(`Connecting to ${platformId}...`)
    alert(`OAuth connection for ${platformId} - Coming soon!`)
  }

  const calculateProgress = () => {
    let completed = 0
    let total = 5 // Updated to 5 steps
    
    if (setupProgress.brandSettingsComplete) completed++
    if (setupProgress.wizardComplete) completed++
    if (setupProgress.selectedPlatforms.length > 0 && 
        setupProgress.connectedPlatforms.length === setupProgress.selectedPlatforms.length) completed++
    if (setupProgress.hasGeneratedContent) completed++
    if (setupProgress.hasScheduledContent) completed++
    
    return Math.round((completed / total) * 100)
  }

  const getStepStatus = (stepNumber) => {
    switch (stepNumber) {
      case 1: return setupProgress.brandSettingsComplete
      case 2: return setupProgress.wizardComplete
      case 3: return setupProgress.selectedPlatforms.length > 0 && 
                     setupProgress.connectedPlatforms.length === setupProgress.selectedPlatforms.length
      case 4: return setupProgress.hasGeneratedContent
      case 5: return setupProgress.hasScheduledContent
      default: return false
    }
  }

  const getNextAction = () => {
    if (!setupProgress.brandSettingsComplete) {
      return { text: 'Set Up Your Brand Settings', action: 'brand' }
    }
    
    if (setupProgress.connectedPlatforms.length < setupProgress.selectedPlatforms.length) {
      return { text: 'Connect Your Platforms', action: 'connect' }
    }
    if (!setupProgress.hasGeneratedContent) {
      return { text: 'Generate Your First Content', action: 'generate' }
    }
    if (!setupProgress.hasScheduledContent) {
      return { text: 'Schedule Your Posts', action: 'schedule' }
    }
    return { text: 'All Set! 🎉', action: 'complete' }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    )
  }

  const progress = calculateProgress()
  const nextAction = getNextAction()

  return (
    <div className="space-y-6">
      {/* Progress Overview */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Setup Progress</h2>
          <span className="text-3xl font-bold">{progress}%</span>
        </div>
        <div className="w-full bg-white/20 rounded-full h-3 mb-4">
          <div 
            className="bg-white h-3 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
        <p className="text-blue-100">
          {progress === 100 ? "🎉 Setup complete! You're ready to automate your content." : 
           `${5 - Math.floor(progress / 20)} steps remaining to complete your setup.`}
        </p>
      </div>

      {/* Setup Steps */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Setup Steps</h3>
        
        <div className="space-y-4">
          {/* Step 1: Brand Settings */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
            {getStepStatus(1) ? (
              <CheckCircle className="text-green-500" size={24} />
            ) : (
              <Circle className="text-gray-400" size={24} />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Set Up Your Brand Settings</h4>
              <p className="text-sm text-gray-600">
                {getStepStatus(1) ? 
                  "✅ Brand settings configured successfully!" : 
                  "Define your brand name, voice, colors, and core values"}
              </p>
            </div>
            {!getStepStatus(1) && (
              <Link 
                href="/dashboard?tab=brand"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <span>Set Up Brand</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          

          {/* Step 2: Connect Platforms */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
            {getStepStatus(3) ? (
              <CheckCircle className="text-green-500" size={24} />
            ) : (
              <Circle className="text-gray-400" size={24} />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Connect Your Social Media Platforms</h4>
              <p className="text-sm text-gray-600">
                {setupProgress.selectedPlatforms.length === 0 ? 
                  "Complete the wizard first to select your platforms" :
                  `Connect to ${setupProgress.selectedPlatforms.length} selected platform${setupProgress.selectedPlatforms.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>

          {/* Platform Connection Grid */}
          {setupProgress.selectedPlatforms.length > 0 && (
            <div className="ml-10 grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {setupProgress.selectedPlatforms.map(platformId => {
                const config = platformConfigs[platformId]
                const isConnected = setupProgress.connectedPlatforms.includes(platformId)
                
                return (
                  <div 
                    key={platformId}
                    className="border border-gray-200 rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{config.icon}</span>
                      <div>
                        <h5 className="font-medium text-gray-900">{config.name}</h5>
                        <p className="text-xs text-gray-500">
                          {isConnected ? 'Connected' : 'Not connected'}
                        </p>
                      </div>
                    </div>
                    
                    {isConnected ? (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle size={20} />
                        <span className="text-sm font-medium">Connected</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleConnectPlatform(platformId)}
                        className={`bg-gradient-to-r ${config.color} text-white px-4 py-2 rounded-lg hover:opacity-90 flex items-center space-x-2`}
                      >
                        <span>Connect</span>
                        <ExternalLink size={16} />
                      </button>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {/* Step 3: Generate Content */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
            {getStepStatus(4) ? (
              <CheckCircle className="text-green-500" size={24} />
            ) : (
              <Circle className="text-gray-400" size={24} />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Generate Your First Content</h4>
              <p className="text-sm text-gray-600">
                {getStepStatus(4) ? 
                  "✅ Content generated and ready to schedule!" : 
                  "Create personalized content based on your strategy"}
              </p>
            </div>
            {getStepStatus(3) && !getStepStatus(4) && (
              <Link 
                href="/dashboard?tab=generator"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center space-x-2"
              >
                <span>Generate</span>
                <ArrowRight size={16} />
              </Link>
            )}
          </div>

          {/* Step 4: Schedule Content */}
          <div className="flex items-center space-x-4 p-4 rounded-lg bg-gray-50">
            {getStepStatus(5) ? (
              <CheckCircle className="text-green-500" size={24} />
            ) : (
              <Circle className="text-gray-400" size={24} />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-900">Schedule Your Posts</h4>
              <p className="text-sm text-gray-600">
                {getStepStatus(5) ? 
                  "✅ Posts scheduled and automation active!" : 
                  "Schedule your content across all connected platforms"}
              </p>
            </div>
            {getStepStatus(4) && !getStepStatus(5) && (
              <button className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 flex items-center space-x-2">
                <span>Schedule</span>
                <ArrowRight size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Next Action Card */}
      {progress < 100 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-medium text-blue-900 mb-2">🎯 Next Step</h3>
          <p className="text-blue-800 mb-4">{nextAction.text}</p>
          
          {nextAction.action === 'brand' && (
            <Link 
              href="/dashboard?tab=brand"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 inline-flex items-center space-x-2"
            >
              <span>Set Up Brand Settings</span>
              <ArrowRight size={16} />
            </Link>
          )}

          {nextAction.action === 'wizard' && (
            <Link 
              href="/dashboard/wizard"
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 inline-flex items-center space-x-2"
            >
              <span>Start Content Wizard</span>
              <ArrowRight size={16} />
            </Link>
          )}
          
          {nextAction.action === 'connect' && (
            <p className="text-blue-700 text-sm">
              👆 Connect your platforms above to continue
            </p>
          )}
          
          {nextAction.action === 'generate' && (
            <Link 
              href="/dashboard?tab=generator"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2"
            >
              <span>Generate Content</span>
              <ArrowRight size={16} />
            </Link>
          )}
        </div>
      )}

      {/* Success State */}
      {progress === 100 && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-green-900 mb-2">Setup Complete!</h3>
          <p className="text-green-800 mb-4">
            Your content automation is now active and ready to grow your social media presence.
          </p>
          <Link 
            href="/dashboard?tab=content"
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 inline-flex items-center space-x-2"
          >
            <span>View Your Content</span>
            <ArrowRight size={16} />
          </Link>
        </div>
      )}
    </div>
  )
}