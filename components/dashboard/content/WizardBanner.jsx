// components/content/WizardBanner.js
'use client'

import { memo } from 'react'
import Link from 'next/link'
import { Sparkles, Wand2, ChevronRight } from 'lucide-react'

const WizardBanner = memo(function WizardBanner({ data }) {
  const completed = data?.hasData

  if (completed) {
    return (
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200 overflow-hidden">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-100 rounded-xl">
              <Sparkles className="text-green-600" size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">✨ Personalized Content Strategy Active</h3>
              <p className="text-sm text-gray-700 mt-1">
                Optimized for <strong className="text-green-700">{data.businessName || 'your business'}</strong> with a&nbsp;
                <strong className="text-green-700">{data.brandVoice || 'professional'}</strong> voice across {data.platforms?.length || 'selected'} platforms
              </p>
            </div>
          </div>
          <Link
            href="/dashboard/wizard"
            className="flex items-center space-x-2 px-4 py-2 rounded-xl border-2 border-green-300 text-green-700 hover:bg-green-100 transition-colors font-medium"
          >
            <span>Edit Strategy</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 overflow-hidden">
      <div className="p-6 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-amber-100 rounded-xl">
            <Wand2 className="text-amber-600" size={28} />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">🎯 Complete Your Content Strategy</h3>
            <p className="text-sm text-gray-700 mt-1">
              Set up a personalized strategy to get better AI-generated content tailored to your brand and audience
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/wizard"
          className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 transition-colors font-bold shadow-lg"
        >
          <Wand2 size={18} />
          <span>Launch Wizard</span>
        </Link>
      </div>
    </div>
  )
})

export default WizardBanner