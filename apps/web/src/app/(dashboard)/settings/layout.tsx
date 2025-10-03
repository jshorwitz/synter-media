"use client"

import { usePathname, useRouter } from "next/navigation"
import { Key, Link2, CreditCard, User } from "lucide-react"

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()

  const tabs = [
    { value: "apps", label: "OAuth Apps", icon: Key, path: "/settings/apps" },
    { value: "credentials", label: "Connections", icon: Link2, path: "/settings/credentials" },
    { value: "account", label: "Account", icon: User, path: "/settings/account" },
    { value: "billing", label: "Billing", icon: CreditCard, path: "/settings/billing" },
  ]

  const currentTab = tabs.find((tab) => pathname.startsWith(tab.path))?.value || "apps"

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-display text-text-hi mb-1 uppercase tracking-wide">Settings</h1>
        <p className="text-text-low font-mono text-sm">Manage your account, integrations, and preferences</p>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2 border-b border-stroke-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.value
          return (
            <button
              key={tab.value}
              onClick={() => router.push(tab.path)}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-tactical font-mono text-xs uppercase tracking-wide transition-all
                ${isActive 
                  ? 'bg-accent-cyan/20 text-accent-cyan border border-accent-cyan/40' 
                  : 'text-text-mid hover:text-text-hi hover:bg-carbon-800 border border-transparent'
                }
              `}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          )
        })}
      </div>

      {children}
    </div>
  )
}
