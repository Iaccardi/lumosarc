'use client'

import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import GenerationForm from './content/GenerationForm'
import { Sparkles, Lightbulb, Target } from 'lucide-react'

export default function GenerateContentTab() {
  const { user, trialStatus } = useAuth()
  const [showForm, setShowForm] = useState(false)

  // Usage stats (you can fetch this)
  const usage = {
    limit: trialStatus?.tier === 'enterprise' ? 999999 : 
           trialStatus?.tier === 'professional' ? 200 : 50,
    currentMonth: 0 // fetch from API
  }

  if (showForm) {
    return (
      <GenerationForm
        usage={usage}
        onComplete={() => {
          setShowForm(false)
          // Could redirect to content tab or show success
        }}
        onCancel={() => setShowForm(false)}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Generate Amazing Content
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Let AI create engaging, platform-optimized content for your brand in minutes
        </p>
      </div>

      {/* Quick Start Card */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-8 text-white text-center">
        <Sparkles className="w-16 h-16 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Ready to Create?</h2>
        <p className="mb-6 text-blue-100">
          Generate personalized content for {usage.limit === 999999 ? 'unlimited' : usage.limit - usage.currentMonth} more posts this month
        </p>
        <button
          onClick={() => setShowForm(true)}
          className="bg-white text-blue-600 px-8 py-3 rounded-lg font-bold hover:bg-gray-100 transition-colors"
        >
          Start Content Generator
        </button>
      </div>

      {/* Feature Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <Target className="w-12 h-12 text-blue-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">AI-Powered Suggestions</h3>
          <p className="text-gray-600">Get personalized content objectives based on your brand strategy and audience data.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <Lightbulb className="w-12 h-12 text-green-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Multi-Platform Optimization</h3>
          <p className="text-gray-600">Content automatically adapted for each platform's unique audience and format requirements.</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl border border-gray-200">
          <Sparkles className="w-12 h-12 text-purple-600 mb-4" />
          <h3 className="text-lg font-semibold mb-2">Instant Results</h3>
          <p className="text-gray-600">Generate multiple content variations in seconds, ready to schedule or publish immediately.</p>
        </div>
      </div>
    </div>
  )
}