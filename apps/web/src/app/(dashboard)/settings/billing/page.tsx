'use client';

import { useState, useEffect } from 'react';
import { Coins, TrendingUp, TrendingDown, Plus, History, Zap } from 'lucide-react';
import { CREDIT_PACKAGES, CREDIT_COSTS, getTotalCredits } from '@/lib/subscription/credits';
import Link from 'next/link';

type CreditStats = {
  balance: number;
  lifetime: number;
  spent30Days: number;
  recentTransactions: Array<{
    id: number;
    amount: number;
    type: string;
    description: string;
    created_at: string;
  }>;
};

type UsageByAction = {
  action: string;
  count: number;
  credits: number;
};

export default function BillingPage() {
  const [stats, setStats] = useState<CreditStats | null>(null);
  const [usageByAction, setUsageByAction] = useState<UsageByAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Fetch credit stats
      const statsRes = await fetch('/api/credits/stats');
      const statsData = await statsRes.json();
      setStats(statsData);

      // Fetch usage breakdown (you'll need to create this endpoint)
      const usageRes = await fetch('/api/credits/usage-breakdown');
      const usageData = await usageRes.json();
      setUsageByAction(usageData.breakdown || []);
    } catch (error) {
      console.error('Failed to load billing data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  const handleQuickPurchase = async (packageId: string) => {
    try {
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create checkout');
      }

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Failed to start purchase. Please try again.');
    }
  };

  return (
    <div className="max-w-6xl">
      <h1 className="text-3xl font-bold text-white mb-2">Billing & Usage</h1>
      <p className="text-slate-400 mb-8">Manage your credits and view usage history</p>

      <div className="grid gap-6">
        {/* Credit Balance Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Coins className="w-6 h-6 text-blue-400" />
              <span className="text-slate-300 text-sm">Current Balance</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats?.balance || 0}</div>
            <div className="text-sm text-slate-400">credits available</div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-6 h-6 text-green-400" />
              <span className="text-slate-300 text-sm">Lifetime Earned</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats?.lifetime || 0}</div>
            <div className="text-sm text-slate-400">total credits</div>
          </div>

          <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingDown className="w-6 h-6 text-orange-400" />
              <span className="text-slate-300 text-sm">Last 30 Days</span>
            </div>
            <div className="text-4xl font-bold text-white mb-1">{stats?.spent30Days || 0}</div>
            <div className="text-sm text-slate-400">credits spent</div>
          </div>
        </div>

        {/* Quick Purchase */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Top-Up</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleQuickPurchase('mini')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-4 text-left transition-colors"
            >
              <div className="text-2xl font-bold text-white mb-1">50</div>
              <div className="text-sm text-slate-400 mb-3">credits</div>
              <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm font-medium inline-block">
                $5
              </div>
            </button>

            <button
              onClick={() => handleQuickPurchase('starter')}
              className="bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg p-4 text-left transition-colors"
            >
              <div className="text-2xl font-bold text-white mb-1">100</div>
              <div className="text-sm text-slate-400 mb-3">credits</div>
              <div className="bg-blue-500/20 text-blue-400 px-3 py-1 rounded text-sm font-medium inline-block">
                $10
              </div>
            </button>

            <Link
              href="/credits"
              className="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 rounded-lg p-4 text-left transition-all flex flex-col justify-center items-center"
            >
              <Plus className="w-8 h-8 text-white mb-2" />
              <div className="text-sm font-medium text-white">View All Packages</div>
            </Link>
          </div>
        </div>

        {/* Usage Breakdown */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Usage by Action Type</h2>
          {usageByAction.length > 0 ? (
            <div className="space-y-3">
              {usageByAction.map((item) => {
                const actionCost = CREDIT_COSTS[item.action as keyof typeof CREDIT_COSTS];
                return (
                  <div key={item.action} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-white text-sm">{actionCost?.description || item.action}</div>
                        <div className="text-xs text-slate-500">{item.count} actions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-white font-semibold">{item.credits}</div>
                      <div className="text-xs text-slate-400">credits</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">
              No usage yet. Start using Synter to see your activity here.
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="bg-slate-900/50 border border-slate-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <History className="w-5 h-5" />
              Recent Transactions
            </h2>
          </div>

          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="space-y-3">
              {stats.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between py-3 border-b border-slate-700 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        tx.amount > 0 ? 'bg-green-500/20' : 'bg-red-500/20'
                      }`}
                    >
                      {tx.amount > 0 ? (
                        <TrendingUp className="w-4 h-4 text-green-400" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div>
                      <div className="text-white text-sm">{tx.description}</div>
                      <div className="text-xs text-slate-500">
                        {new Date(tx.created_at).toLocaleDateString()} at{' '}
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-semibold ${
                      tx.amount > 0 ? 'text-green-400' : 'text-red-400'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
