'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';

interface CreditStats {
  totalUsers: number;
  totalBalance: number;
  totalLifetime: number;
  totalPurchases: number;
  totalRevenue: number;
  last30Days: {
    purchases: number;
    revenue: number;
    creditsAwarded: number;
  };
}

interface UserCredit {
  userId: number;
  email: string;
  name: string | null;
  balance: number;
  lifetime: number;
  lastPurchase: string | null;
  totalSpent: number;
}

export default function AdminCreditsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [users, setUsers] = useState<UserCredit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    
    if (user.role !== 'ADMIN' && user.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchData();
  }, [user, router]);

  const fetchData = async () => {
    try {
      const response = await fetch('/api/admin/credits');
      const data = await response.json();
      setStats(data.stats);
      setUsers(data.users);
    } catch (error) {
      console.error('Error fetching credit data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || (user.role !== 'ADMIN' && user.role !== 'admin')) {
    return null;
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Credit Management</h1>
        <p className="text-text-mid mt-2">Monitor credit balances, purchases, and usage</p>
      </div>

      {/* Stats Grid */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="panel p-6">
            <div className="text-sm text-text-low mb-1">Total Users</div>
            <div className="text-3xl font-bold">{stats.totalUsers}</div>
          </div>
          
          <div className="panel p-6">
            <div className="text-sm text-text-low mb-1">Total Balance</div>
            <div className="text-3xl font-bold text-accent-lime">{stats.totalBalance.toLocaleString()}</div>
            <div className="text-xs text-text-mid mt-1">credits</div>
          </div>
          
          <div className="panel p-6">
            <div className="text-sm text-text-low mb-1">Lifetime Credits</div>
            <div className="text-3xl font-bold text-accent-cyan">{stats.totalLifetime.toLocaleString()}</div>
            <div className="text-xs text-text-mid mt-1">total awarded</div>
          </div>
          
          <div className="panel p-6">
            <div className="text-sm text-text-low mb-1">Total Revenue</div>
            <div className="text-3xl font-bold text-accent-amber">${(stats.totalRevenue / 100).toFixed(2)}</div>
            <div className="text-xs text-text-mid mt-1">{stats.totalPurchases} purchases</div>
          </div>

          <div className="panel p-6 lg:col-span-2">
            <div className="text-sm text-text-low mb-1">Last 30 Days</div>
            <div className="grid grid-cols-3 gap-4 mt-3">
              <div>
                <div className="text-xs text-text-mid">Purchases</div>
                <div className="text-xl font-semibold">{stats.last30Days.purchases}</div>
              </div>
              <div>
                <div className="text-xs text-text-mid">Revenue</div>
                <div className="text-xl font-semibold">${(stats.last30Days.revenue / 100).toFixed(2)}</div>
              </div>
              <div>
                <div className="text-xs text-text-mid">Credits Awarded</div>
                <div className="text-xl font-semibold">{stats.last30Days.creditsAwarded.toLocaleString()}</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Credits Table */}
      <div className="panel">
        <div className="border-b border-stroke-1 p-6">
          <h2 className="text-xl font-semibold">User Credit Balances</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-stroke-1">
              <tr className="text-left text-sm text-text-low">
                <th className="p-4 font-medium">User</th>
                <th className="p-4 font-medium">Balance</th>
                <th className="p-4 font-medium">Lifetime</th>
                <th className="p-4 font-medium">Total Spent</th>
                <th className="p-4 font-medium">Last Purchase</th>
              </tr>
            </thead>
            <tbody>
              {users.map((userCredit) => (
                <tr key={userCredit.userId} className="border-b border-stroke-1 hover:bg-carbon-850/50">
                  <td className="p-4">
                    <div className="font-medium">{userCredit.email}</div>
                    {userCredit.name && <div className="text-sm text-text-mid">{userCredit.name}</div>}
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-accent-lime">{userCredit.balance.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono text-text-mid">{userCredit.lifetime.toLocaleString()}</span>
                  </td>
                  <td className="p-4">
                    <span className="font-mono">${(userCredit.totalSpent / 100).toFixed(2)}</span>
                  </td>
                  <td className="p-4 text-sm text-text-mid">
                    {userCredit.lastPurchase ? new Date(userCredit.lastPurchase).toLocaleDateString() : 'Never'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          
          {users.length === 0 && (
            <div className="p-8 text-center text-text-mid">
              No credit activity yet
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
