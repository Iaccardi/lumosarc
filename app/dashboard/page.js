'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useSearchParams, useRouter } from 'next/navigation'

import Navigation        from '../../components/Navigation'
import DashboardSidebar  from '../../components/dashboard/DashboardSidebar'
import DashboardHeader   from '../../components/dashboard/DashboardHeader'

import SetupTab           from '../../components/dashboard/SetupTab'        // ← NEW
import ContentTab         from '../../components/dashboard/ContentTab'
import BrandSettingsTab   from '../../components/dashboard/BrandSettingsTab'
import AccountSettingsTab from '../../components/dashboard/AccountSettingsTab'
import UsageTab           from '../../components/dashboard/UsageTab'  
import GenerateContentTab     from '../../components/dashboard/content/GenerationForm'

import LoadingSpinner from '../../components/ui/LoadingSpinner'

export default function DashboardPage () {
  const { user, loading } = useAuth()
  const searchParams = useSearchParams()
  const router       = useRouter()

  const [activeTab,   setActiveTab]   = useState('content')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [authChecked, setAuthChecked] = useState(false)

  /* simple stub; replace with real data when ready */
  const [usage] = useState({ limit: 50, currentMonth: 0 })

  /* deep-link support */
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab && ['setup','content','brand','account','usage','generator'].includes(tab)) {
      setActiveTab(tab)
    }
  }, [searchParams])

  /* auth guard */
  useEffect(() => {
    if (!loading) {
      setAuthChecked(true)
      const t = setTimeout(() => {
        if (!user) router.push('/auth/login')
      }, 100)
      return () => clearTimeout(t)
    }
  }, [user, loading, router])

  if (loading || !authChecked) return <LoadingSpinner/>
  if (!user) return <LoadingSpinner/>

  /* choose which tab to render */
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'setup'    : return <SetupTab />
      case 'content'  : return <ContentTab />
      case 'brand'    : return <BrandSettingsTab />
      case 'account'  : return <AccountSettingsTab />
      case 'usage'    : return <UsageTab />
      case 'generator': return <GenerateContentTab />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="flex">
        <DashboardSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          usage={usage}
        />

        {/* mobile overlay */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-gray-600/75 z-30 lg:hidden mt-16"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* main content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader
            activeTab={activeTab}
            setSidebarOpen={setSidebarOpen}
          />
          <main className="flex-1 overflow-auto p-6">
            {renderActiveTab()}
          </main>
        </div>
      </div>
    </div>
  )
}
