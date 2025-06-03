import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '../contexts/AuthContext'
import { WizardDataProvider } from '../contexts/WizardDataContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Content Automation SaaS',
  description: 'Generate content ideas powered by AI',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <WizardDataProvider>
            {children}
          </WizardDataProvider>
        </AuthProvider>
      </body>
    </html>
  )
}