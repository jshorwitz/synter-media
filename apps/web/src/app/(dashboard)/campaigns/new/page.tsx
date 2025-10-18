"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function NewCampaignPage() {
  const router = useRouter()
  
  // Redirect to workflow page (AI URL persona recommender)
  useEffect(() => {
    router.replace('/workflow')
  }, [router])
  
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-text-mid">Redirecting to campaign builder...</div>
    </div>
  )
}
