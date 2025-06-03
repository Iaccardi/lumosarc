'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '../../contexts/AuthContext'

export default function AccountSettingsTab() {
  const { user, trialStatus } = useAuth()

  const [accountSettings, setAccountSettings] = useState({
    displayName: '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const updateAccountSettings = (e) => {
    e.preventDefault()
    // TODO — update account settings in database
    alert('Account settings updated!')
  }

  const updatePassword = (e) => {
    e.preventDefault()
    if (accountSettings.newPassword !== accountSettings.confirmPassword) {
      alert('New passwords do not match!')
      return
    }
    if (accountSettings.newPassword.length < 6) {
      alert('Password must be at least 6 characters!')
      return
    }
    // TODO — update password via Supabase auth
    alert('Password updated successfully!')
    setAccountSettings({
      ...accountSettings,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile settings */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Settings</h2>
        <form onSubmit={updateAccountSettings} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Display Name</label>
            <input
              type="text"
              value={accountSettings.displayName}
              onChange={(e) => setAccountSettings({ ...accountSettings, displayName: e.target.value })}
              placeholder="Enter your display name"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
            <input 
              type="email" 
              value={accountSettings.email} 
              disabled 
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500" 
            />
            <p className="text-xs text-gray-500 mt-1">Email cannot be changed. Contact support if needed.</p>
          </div>
          <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Update Profile
          </button>
        </form>
      </div>

      {/* Change password */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Change Password</h2>
        <form onSubmit={updatePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Current Password</label>
            <input
              type="password"
              value={accountSettings.currentPassword}
              onChange={(e) => setAccountSettings({ ...accountSettings, currentPassword: e.target.value })}
              placeholder="Enter your current password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">New Password</label>
            <input
              type="password"
              value={accountSettings.newPassword}
              onChange={(e) => setAccountSettings({ ...accountSettings, newPassword: e.target.value })}
              placeholder="Enter your new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm New Password</label>
            <input
              type="password"
              value={accountSettings.confirmPassword}
              onChange={(e) => setAccountSettings({ ...accountSettings, confirmPassword: e.target.value })}
              placeholder="Confirm your new password"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button type="submit" className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Change Password
          </button>
        </form>
      </div>

      {/* Subscription */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Subscription</h2>
        <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg mb-4">
          <div>
            <p className="font-medium text-gray-900 capitalize">{trialStatus?.tier || 'Starter'} Plan</p>
            <p className="text-sm text-gray-600">
              {trialStatus?.subscriptionStatus === 'trial'
                ? `Trial ends ${new Date(trialStatus.endDate).toLocaleDateString()}`
                : 'Active subscription'}
            </p>
          </div>
          <Link
            href="/pricing"
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            {trialStatus?.subscriptionStatus === 'trial' ? 'Upgrade Plan' : 'Change Plan'}
          </Link>
        </div>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• Monthly content generation limit: {trialStatus?.tier === 'enterprise' ? 'Unlimited' : trialStatus?.tier === 'professional' ? '200' : '50'} posts</p>
          <p>• Priority support included</p>
          <p>• Cancel anytime</p>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl shadow-sm border border-red-200 p-6">
        <h2 className="text-xl font-semibold text-red-900 mb-4">Danger Zone</h2>
        <div className="space-y-4">
          <div className="p-4 bg-red-50 rounded-lg border border-red-200">
            <h3 className="font-medium text-red-900 mb-2">Delete Account</h3>
            <p className="text-sm text-red-700 mb-3">
              Permanently delete your account and all associated data. This action cannot be undone.
            </p>
            <button className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
              Delete Account
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}