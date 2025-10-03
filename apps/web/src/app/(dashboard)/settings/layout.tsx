"use client"

import { usePathname, useRouter } from "next/navigation"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Key, Link2, Users, Bell } from "lucide-react"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { value: "apps", label: "OAuth Apps", icon: Key, path: "/settings/apps" },
    { value: "credentials", label: "Connections", icon: Link2, path: "/settings/credentials" },
    { value: "team", label: "Team", icon: Users, path: "/settings/team" },
    { value: "notifications", label: "Notifications", icon: Bell, path: "/settings/notifications" },
  ]

  const currentTab = tabs.find((tab) => pathname.startsWith(tab.path))?.value || "apps"

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Manage your account, integrations, and preferences</p>
      </div>

      <Tabs value={currentTab} onValueChange={(value) => {
        const tab = tabs.find((t) => t.value === value)
        if (tab) router.push(tab.path)
      }}>
        <TabsList className="mb-8">
          {tabs.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {children}
    </div>
  )
}
