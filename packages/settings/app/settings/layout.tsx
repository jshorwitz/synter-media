// Settings layout with navigation sidebar
import { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  CreditCard, 
  Users, 
  Share2, 
  Bell, 
  Shield, 
  BarChart3,
  Settings,
  Home
} from 'lucide-react';

interface SettingsLayoutProps {
  children: ReactNode;
}

export default function SettingsLayout({ children }: SettingsLayoutProps) {
  const pathname = usePathname();

  const navigation = [
    {
      name: 'Overview',
      href: '/settings/overview',
      icon: BarChart3,
      description: 'Workspace summary',
    },
    {
      name: 'Billing & Credits',
      href: '/settings/billing',
      icon: CreditCard,
      description: 'Credits, payments, invoices',
    },
    {
      name: 'Team & Roles',
      href: '/settings/team',
      icon: Users,
      description: 'Members, invites, permissions',
    },
    {
      name: 'Sharing & Access',
      href: '/settings/sharing',
      icon: Share2,
      description: 'Report sharing, policies',
    },
    {
      name: 'Notifications',
      href: '/settings/notifications',
      icon: Bell,
      description: 'Email preferences',
    },
    {
      name: 'Audit Log',
      href: '/settings/audit',
      icon: Shield,
      description: 'Activity history',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2">
                <Home className="h-6 w-6 text-gray-600" />
                <span className="text-sm text-gray-600">Back to Dashboard</span>
              </Link>
              <div className="h-6 border-l border-gray-300" />
              <div className="flex items-center space-x-2">
                <Settings className="h-6 w-6 text-gray-900" />
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                Sourcegraph Workspace
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <nav className="w-64 flex-shrink-0">
            <div className="bg-white rounded-lg border border-gray-200 p-4">
              <ul className="space-y-2">
                {navigation.map((item) => {
                  const isActive = pathname?.startsWith(item.href);
                  const Icon = item.icon;
                  
                  return (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className={`
                          flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                          ${isActive 
                            ? 'bg-blue-50 text-blue-700 border border-blue-200' 
                            : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                          }
                        `}
                      >
                        <Icon className="h-5 w-5" />
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          <div className="text-xs text-gray-500">{item.description}</div>
                        </div>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          </nav>

          {/* Main Content */}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
