// components/dashboard/BrandSettingsTab.js
'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Plus,
  X,
  Target,
  Zap,
  RefreshCw,
  Edit3,
  Save,
  Building2,
  Users,
  MessageSquare,
  Palette,
  Hash
} from 'lucide-react'

export default function BrandSettingsTab() {
  const { user } = useAuth()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [isEditMode, setIsEditMode] = useState(false)
  const [error, setError] = useState('')
  
  const [formData, setFormData] = useState({
    // Step 1: Business Information
    businessName: '',
    businessNiche: '',
    website: '',
    businessDescription: '',
    businessType: '',
    yearsInBusiness: '',
    
    // Step 2: Target Audience
    targetAudience: '',
    audienceAge: '',
    audienceLocation: '',
    audienceIncome: '',
    audiencePainPoints: [],
    customerPersona: '',
    audienceInterests: [],
    
    // Step 3: Brand Voice & Personality
    brandVoice: '',
    writingStyle: '',
    brandPersonality: [],
    communicationStyle: '',
    avoidTopics: [],
    brandValues: [],
    brandMission: '',
    
    // Step 4: Content Focus & Expertise
    keywords: '',
    contentPillars: [],
    industryExpertise: [],
    uniqueSellingPoints: [],
    competitors: [],
    contentThemes: [],
    
    // Step 5: Visual Identity & Style
    visualStyle: '',
    colorPalette: [],
    logoUrl: '',
    brandAssets: [],
    imageStyle: '',
    designPreferences: [],
  })

  const steps = [
    { id: 1, title: "Business Info", icon: Building2 },
    { id: 2, title: "Target Audience", icon: Users },
    { id: 3, title: "Brand Voice", icon: MessageSquare },
    { id: 4, title: "Content Focus", icon: Hash },
    { id: 5, title: "Visual Identity", icon: Palette },
  ]

  // Load existing data on mount
  useEffect(() => {
    if (user?.id) {
      loadExistingData()
    }
  }, [user?.id])

  const loadExistingData = async () => {
    try {
      setLoadingData(true)
      setError('')
      
      const response = await fetch(`/api/brand-settings?user_id=${user.id}`)
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.hasData) {
          const mergedData = {
            ...result.wizardData,
            // Ensure proper mapping of brand profile fields
            brandVoice: result.brandProfile?.brand_voice || result.wizardData?.brandVoice || '',
            writingStyle: result.brandProfile?.writing_style || result.wizardData?.writingStyle || '',
            avoidTopics: result.brandProfile?.avoid_topics || result.wizardData?.avoidTopics || [],
            brandValues: result.brandProfile?.brand_values || result.wizardData?.brandValues || [],
            visualStyle: result.brandProfile?.visual_style || result.wizardData?.visualStyle || '',
            colorPalette: result.brandProfile?.color_palette || result.wizardData?.colorPalette || [],
            logoUrl: result.brandProfile?.logo_url || result.wizardData?.logoUrl || '',
            brandAssets: result.brandProfile?.brand_assets || result.wizardData?.brandAssets || [],
            // Map brand settings fields
            businessName: result.brandSettings?.brand_name || result.wizardData?.businessName || '',
            primaryColor: result.brandSettings?.primary_color || result.wizardData?.primaryColor || '',
            secondaryColor: result.brandSettings?.secondary_color || result.wizardData?.secondaryColor || '',
          }

          setFormData(prevData => ({ ...prevData, ...mergedData }))
          setIsEditMode(true)
          console.log('✅ Loaded existing brand settings')
        }
      }
    } catch (err) {
      console.error('❌ Error loading brand settings:', err)
      setError('Failed to load existing settings')
    } finally {
      setLoadingData(false)
    }
  }

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const addToArray = (field, value) => {
    if (typeof value === 'string' && value.trim()) {
      setFormData(prev => ({ 
        ...prev, 
        [field]: [...prev[field], value.trim()] 
      }))
    }
  }

  const removeFromArray = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError('')
      
      console.log('💾 Saving brand settings...')
      
      const response = await fetch('/api/brand-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          user_id: user.id, 
          wizard: formData 
        }),
      })

      const responseText = await response.text()
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`)
      }

      const result = JSON.parse(responseText)
      
      if (result.ok) {
        const action = isEditMode ? 'updated' : 'created'
        alert(`Brand settings ${action} successfully! 🎉`)
        
        if (!isEditMode) {
          setIsEditMode(true)
        }
      } else {
        throw new Error(result.error || 'Failed to save brand settings')
      }

    } catch (err) {
      console.error('❌ Save error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    if (confirm('Are you sure you want to reset all brand settings? This cannot be undone.')) {
      setFormData({
        businessName: '',
        businessNiche: '',
        website: '',
        businessDescription: '',
        businessType: '',
        yearsInBusiness: '',
        targetAudience: '',
        audienceAge: '',
        audienceLocation: '',
        audienceIncome: '',
        audiencePainPoints: [],
        customerPersona: '',
        audienceInterests: [],
        brandVoice: '',
        writingStyle: '',
        brandPersonality: [],
        communicationStyle: '',
        avoidTopics: [],
        brandValues: [],
        brandMission: '',
        keywords: '',
        contentPillars: [],
        industryExpertise: [],
        uniqueSellingPoints: [],
        competitors: [],
        contentThemes: [],
        visualStyle: '',
        colorPalette: [],
        logoUrl: '',
        brandAssets: [],
        imageStyle: '',
        designPreferences: [],
      })
      setIsEditMode(false)
      setCurrentStep(1)
    }
  }

  if (loadingData) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center space-x-4">
          <RefreshCw className="animate-spin h-6 w-6 text-blue-600" />
          <span className="text-lg text-gray-600">Loading brand settings...</span>
        </div>
      </div>
    )
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Business Information</h2>
              <p className="text-gray-600">Tell us about your business and what you do</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Name *
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => updateFormData('businessName', e.target.value)}
                  placeholder="e.g., Acme Digital Solutions"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Industry/Niche *
                </label>
                <select
                  value={formData.businessNiche}
                  onChange={(e) => updateFormData('businessNiche', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                  required
                >
                  <option value="">Select your industry</option>
                  <option value="fitness">Fitness & Wellness</option>
                  <option value="technology">Technology & Software</option>
                  <option value="food">Food & Beverage</option>
                  <option value="fashion">Fashion & Beauty</option>
                  <option value="education">Education & Training</option>
                  <option value="healthcare">Healthcare & Medical</option>
                  <option value="finance">Finance & Investing</option>
                  <option value="real-estate">Real Estate</option>
                  <option value="travel">Travel & Tourism</option>
                  <option value="consulting">Consulting & Services</option>
                  <option value="ecommerce">E-commerce & Retail</option>
                  <option value="marketing">Marketing & Advertising</option>
                  <option value="legal">Legal Services</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Business Type
                </label>
                <select
                  value={formData.businessType}
                  onChange={(e) => updateFormData('businessType', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select business type</option>
                  <option value="startup">Startup</option>
                  <option value="small-business">Small Business</option>
                  <option value="medium-business">Medium Business</option>
                  <option value="enterprise">Enterprise</option>
                  <option value="freelancer">Freelancer/Solopreneur</option>
                  <option value="agency">Agency</option>
                  <option value="nonprofit">Non-profit</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years in Business
                </label>
                <select
                  value={formData.yearsInBusiness}
                  onChange={(e) => updateFormData('yearsInBusiness', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select experience</option>
                  <option value="less-than-1">Less than 1 year</option>
                  <option value="1-2">1-2 years</option>
                  <option value="3-5">3-5 years</option>
                  <option value="6-10">6-10 years</option>
                  <option value="more-than-10">More than 10 years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Website URL
              </label>
              <input
                type="url"
                value={formData.website}
                onChange={(e) => updateFormData('website', e.target.value)}
                placeholder="https://yourwebsite.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Business Description
              </label>
              <textarea
                value={formData.businessDescription}
                onChange={(e) => updateFormData('businessDescription', e.target.value)}
                placeholder="Describe what your business does, your products/services, and what makes you unique..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Target Audience</h2>
              <p className="text-gray-600">Define who you're creating content for</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ideal Customer Description *
              </label>
              <textarea
                value={formData.targetAudience}
                onChange={(e) => updateFormData('targetAudience', e.target.value)}
                placeholder="e.g., Small business owners aged 30-50 who struggle with marketing and want to grow their online presence without spending a fortune..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Age Range</label>
                <select
                  value={formData.audienceAge}
                  onChange={(e) => updateFormData('audienceAge', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select age range</option>
                  <option value="18-24">18-24 (Gen Z)</option>
                  <option value="25-34">25-34 (Millennials)</option>
                  <option value="35-44">35-44 (Millennials)</option>
                  <option value="45-54">45-54 (Gen X)</option>
                  <option value="55-64">55-64 (Gen X)</option>
                  <option value="65+">65+ (Baby Boomers)</option>
                  <option value="mixed">Mixed Ages</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
                <select
                  value={formData.audienceLocation}
                  onChange={(e) => updateFormData('audienceLocation', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select location</option>
                  <option value="local">Local/Regional</option>
                  <option value="national">National</option>
                  <option value="global">Global</option>
                  <option value="us">United States</option>
                  <option value="canada">Canada</option>
                  <option value="uk">United Kingdom</option>
                  <option value="australia">Australia</option>
                  <option value="europe">Europe</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Income Level</label>
                <select
                  value={formData.audienceIncome}
                  onChange={(e) => updateFormData('audienceIncome', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  <option value="">Select income level</option>
                  <option value="low">$0-$30k</option>
                  <option value="lower-middle">$30k-$50k</option>
                  <option value="middle">$50k-$75k</option>
                  <option value="upper-middle">$75k-$100k</option>
                  <option value="high">$100k+</option>
                  <option value="mixed">Mixed Income Levels</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pain Points & Challenges
              </label>
              <div className="space-y-2">
                {formData.audiencePainPoints.map((point, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                      {point}
                    </span>
                    <button
                      onClick={() => removeFromArray('audiencePainPoints', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Lack of time for marketing"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray('audiencePainPoints', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling
                      if (input && input.value.trim()) {
                        addToArray('audiencePainPoints', input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Audience Interests & Hobbies
              </label>
              <div className="space-y-2">
                {formData.audienceInterests.map((interest, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      {interest}
                    </span>
                    <button
                      onClick={() => removeFromArray('audienceInterests', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Technology, Fitness, Travel"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray('audienceInterests', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling
                      if (input && input.value.trim()) {
                        addToArray('audienceInterests', input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Brand Voice & Personality</h2>
              <p className="text-gray-600">Define how your brand communicates</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Voice *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  'Professional', 'Friendly', 'Authoritative', 'Playful',
                  'Inspirational', 'Educational', 'Conversational', 'Sophisticated',
                  'Approachable', 'Bold', 'Caring', 'Innovative'
                ].map((voice) => (
                  <label key={voice} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="brandVoice"
                      value={voice.toLowerCase()}
                      checked={formData.brandVoice === voice.toLowerCase()}
                      onChange={(e) => updateFormData('brandVoice', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-3 border-2 rounded-lg transition-all text-center text-sm ${
                      formData.brandVoice === voice.toLowerCase()
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      {voice}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Writing Style *
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'casual', name: 'Casual & Relaxed', desc: 'Like talking to a friend' },
                  { id: 'professional', name: 'Professional', desc: 'Business-appropriate tone' },
                  { id: 'enthusiastic', name: 'Enthusiastic', desc: 'High energy and excitement' },
                  { id: 'empathetic', name: 'Empathetic', desc: 'Understanding and supportive' },
                ].map((style) => (
                  <label key={style.id} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="writingStyle"
                      value={style.id}
                      checked={formData.writingStyle === style.id}
                      onChange={(e) => updateFormData('writingStyle', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg transition-all ${
                      formData.writingStyle === style.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-medium text-gray-900">{style.name}</div>
                      <div className="text-sm text-gray-600">{style.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Mission Statement
              </label>
              <textarea
                value={formData.brandMission}
                onChange={(e) => updateFormData('brandMission', e.target.value)}
                placeholder="What is your brand's mission? What impact do you want to make?"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Values
              </label>
              <div className="space-y-2">
                {formData.brandValues.map((value, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-green-50 text-green-700 rounded-lg text-sm">
                      {value}
                    </span>
                    <button
                      onClick={() => removeFromArray('brandValues', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Innovation, Quality, Customer Focus"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray('brandValues', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling
                      if (input && input.value.trim()) {
                        addToArray('brandValues', input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Topics to Avoid
              </label>
              <div className="space-y-2">
                {formData.avoidTopics.map((topic, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-red-50 text-red-700 rounded-lg text-sm">
                      {topic}
                    </span>
                    <button
                      onClick={() => removeFromArray('avoidTopics', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Politics, Controversial topics"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray('avoidTopics', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling
                      if (input && input.value.trim()) {
                        addToArray('avoidTopics', input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Focus & Expertise</h2>
              <p className="text-gray-600">Define your content themes and areas of expertise</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Target Keywords
              </label>
              <textarea
                value={formData.keywords}
                onChange={(e) => updateFormData('keywords', e.target.value)}
                placeholder="e.g., digital marketing, small business, entrepreneurship, social media, productivity"
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
              <p className="text-sm text-gray-500 mt-1">Separate keywords with commas</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Content Pillars (Main Topics)
              </label>
              <div className="space-y-2">
                {formData.contentPillars.map((pillar, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-blue-50 text-blue-700 rounded-lg text-sm">
                      {pillar}
                    </span>
                    <button
                      onClick={() => removeFromArray('contentPillars', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., Marketing Tips, Business Growth, Industry News"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray('contentPillars', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling
                      if (input && input.value.trim()) {
                        addToArray('contentPillars', input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Areas of Expertise
              </label>
              <div className="space-y-2">
                {formData.industryExpertise.map((expertise, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-purple-50 text-purple-700 rounded-lg text-sm">
                      {expertise}
                    </span>
                    <button
                      onClick={() => removeFromArray('industryExpertise', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., SEO, Content Strategy, Lead Generation"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray('industryExpertise', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling
                      if (input && input.value.trim()) {
                        addToArray('industryExpertise', input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Unique Selling Points
              </label>
              <div className="space-y-2">
                {formData.uniqueSellingPoints.map((usp, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 bg-yellow-50 text-yellow-700 rounded-lg text-sm">
                      {usp}
                    </span>
                    <button
                      onClick={() => removeFromArray('uniqueSellingPoints', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g., 10+ years experience, Award-winning service"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray('uniqueSellingPoints', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                  <button
                    onClick={(e) => {
                      const input = e.currentTarget.previousElementSibling
                      if (input && input.value.trim()) {
                        addToArray('uniqueSellingPoints', input.value)
                        input.value = ''
                      }
                    }}
                    className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Visual Identity & Style</h2>
              <p className="text-gray-600">Define your brand's visual style and preferences</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visual Style
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  { id: 'modern', name: 'Modern & Clean', desc: 'Minimalist, contemporary design' },
                  { id: 'bold', name: 'Bold & Vibrant', desc: 'High contrast, energetic colors' },
                  { id: 'warm', name: 'Warm & Friendly', desc: 'Soft colors, approachable feel' },
                  { id: 'professional', name: 'Professional', desc: 'Corporate, trustworthy look' },
                  { id: 'creative', name: 'Creative & Artistic', desc: 'Unique, expressive design' },
                  { id: 'luxury', name: 'Luxury & Elegant', desc: 'Premium, sophisticated aesthetic' },
                ].map((style) => (
                  <label key={style.id} className="relative cursor-pointer">
                    <input
                      type="radio"
                      name="visualStyle"
                      value={style.id}
                      checked={formData.visualStyle === style.id}
                      onChange={(e) => updateFormData('visualStyle', e.target.value)}
                      className="sr-only"
                    />
                    <div className={`p-4 border-2 rounded-lg transition-all ${
                      formData.visualStyle === style.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}>
                      <div className="font-medium text-gray-900">{style.name}</div>
                      <div className="text-sm text-gray-600">{style.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Brand Colors
              </label>
              <div className="space-y-2">
                {formData.colorPalette.map((color, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded border border-gray-300"
                      style={{ backgroundColor: color }}
                    ></div>
                    <span className="flex-1 px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-900">
                      {color}
                    </span>
                    <button
                      onClick={() => removeFromArray('colorPalette', index)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                <div className="flex gap-2">
                  <input
                    type="color"
                    className="w-12 h-10 border border-gray-300 rounded"
                    onChange={(e) => {
                      addToArray('colorPalette', e.target.value)
                    }}
                  />
                  <input
                    type="text"
                    placeholder="#FF5733 or Blue"
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        addToArray('colorPalette', e.target.value)
                        e.target.value = ''
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => updateFormData('logoUrl', e.target.value)}
                placeholder="https://yoursite.com/logo.png"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 placeholder-gray-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Image Style Preferences
              </label>
              <select
                value={formData.imageStyle}
                onChange={(e) => updateFormData('imageStyle', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900"
              >
                <option value="">Select image style</option>
                <option value="photography">Photography - Real photos</option>
                <option value="illustrations">Illustrations - Custom graphics</option>
                <option value="mixed">Mixed - Photos and graphics</option>
                <option value="minimal">Minimal - Simple, clean images</option>
                <option value="lifestyle">Lifestyle - People and scenarios</option>
                <option value="product">Product-focused</option>
              </select>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold text-gray-900">Brand Settings</h1>
          {isEditMode && (
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full">
              <Edit3 size={14} className="mr-1" />
              Editing Settings
            </span>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">
            Step {currentStep} of {steps.length}
          </span>
          {isEditMode && (
            <button
              onClick={resetForm}
              className="text-sm text-red-600 hover:text-red-800 underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex items-center gap-2 mb-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep === step.id
                    ? 'bg-blue-600 text-white'
                    : currentStep > step.id
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}
              >
                {currentStep > step.id ? <Check size={16} /> : step.id}
              </div>
              {index < steps.length - 1 && (
                <div
                  className={`w-8 h-1 ${
                    currentStep > step.id ? 'bg-green-600' : 'bg-gray-200'
                  }`}
                ></div>
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-4">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`text-xs ${
                currentStep === step.id ? 'text-blue-600 font-medium' : 'text-gray-500'
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Form Content */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 min-h-[600px]">
        {renderStep()}
      </div>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <button
          onClick={prevStep}
          disabled={currentStep === 1}
          className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} />
          Previous
        </button>

        <div className="text-sm text-gray-500">
          Step {currentStep} of {steps.length}
        </div>

        {currentStep < steps.length ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Next
            <ChevronRight size={20} />
          </button>
        ) : (
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
          >
            {loading ? (
              <RefreshCw className="animate-spin" size={20} />
            ) : (
              <Save size={20} />
            )}
            {loading ? 'Saving...' : isEditMode ? 'Update Settings' : 'Save Settings'}
          </button>
        )}
      </div>
    </div>
  )
}