'use client'

import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

export default function DashboardGroupLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkWaitlistStatus = async () => {
      if (!user) {
        setLoading(false)
        return
      }

      // Skip check for admins (handle both uppercase and lowercase)
      if (user.role === 'ADMIN' || user.role === 'admin') {
        setLoading(false)
        return
      }

      try {
        const response = await fetch('/api/waitlist/status')
        const data = await response.json()

        // If on waitlist but not activated, redirect to pending page
        // NOT_FOUND means they're not on the waitlist, so let them through
        if (data.status && data.status !== 'ACTIVATED' && data.status !== 'NOT_FOUND') {
          router.push('/waitlist-pending')
          return
        }
      } catch (error) {
        console.error('Error checking waitlist status:', error)
      } finally {
        setLoading(false)
      }
    }

    checkWaitlistStatus()
  }, [user, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-carbon-900 flex items-center justify-center">
        <div className="text-text-mid">Loading...</div>
      </div>
    )
  }

  return <DashboardLayout>{children}</DashboardLayout>
}
