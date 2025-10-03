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
    <div className="max-w-6xl space-y-6">
      <div className="grid gap-6">
        {/* Credit Balance Overview */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="metric-tile border-accent-cyan/40">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="w-5 h-5 text-accent-cyan" />
              <span className="panel-title">Current Balance</span>
            </div>
            <div className="metric-value text-accent-cyan">{stats?.balance || 0}</div>
            <div className="metric-label">credits available</div>
          </div>

          <div className="metric-tile border-accent-lime/40">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-accent-lime" />
              <span className="panel-title">Lifetime Earned</span>
            </div>
            <div className="metric-value text-accent-lime">{stats?.lifetime || 0}</div>
            <div className="metric-label">total credits</div>
          </div>

          <div className="metric-tile border-accent-amber/40">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="w-5 h-5 text-accent-amber" />
              <span className="panel-title">Last 30 Days</span>
            </div>
            <div className="metric-value text-accent-amber">{stats?.spent30Days || 0}</div>
            <div className="metric-label">credits spent</div>
          </div>
        </div>

        {/* Quick Purchase */}
        <div className="panel">
          <h2 className="panel-title mb-4">Quick Top-Up</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <button
              onClick={() => handleQuickPurchase('mini')}
              className="panel hover:border-accent-cyan/50 transition-all text-left"
            >
              <div className="text-3xl font-bold font-display text-text-hi mb-1">50</div>
              <div className="text-xs text-text-low font-mono mb-3 uppercase tracking-wide">credits</div>
              <div className="bg-accent-cyan/20 text-accent-cyan px-3 py-1 rounded-tactical text-xs font-mono font-bold inline-block border border-accent-cyan/40">
                $5
              </div>
            </button>

            <button
              onClick={() => handleQuickPurchase('starter')}
              className="panel hover:border-accent-lime/50 transition-all text-left"
            >
              <div className="text-3xl font-bold font-display text-text-hi mb-1">100</div>
              <div className="text-xs text-text-low font-mono mb-3 uppercase tracking-wide">credits</div>
              <div className="bg-accent-lime/20 text-accent-lime px-3 py-1 rounded-tactical text-xs font-mono font-bold inline-block border border-accent-lime/40">
                $10
              </div>
            </button>

            <Link
              href="/credits"
              className="panel border-accent-red/50 hover:border-accent-red transition-all flex flex-col justify-center items-center"
            >
              <Plus className="w-8 h-8 text-accent-red mb-2" />
              <div className="text-xs font-mono font-bold text-text-hi uppercase tracking-wide">View All Packages</div>
            </Link>
          </div>
        </div>

        {/* Usage Breakdown */}
        <div className="panel">
          <h2 className="panel-title mb-4">Usage by Action Type</h2>
          {usageByAction.length > 0 ? (
            <div className="space-y-3">
              {usageByAction.map((item) => {
                const actionCost = CREDIT_COSTS[item.action as keyof typeof CREDIT_COSTS];
                return (
                  <div key={item.action} className="flex items-center justify-between p-3 bg-carbon-800 rounded-tactical border border-stroke-2">
                    <div className="flex items-center gap-3">
                      <Zap className="w-4 h-4 text-accent-yellow" />
                      <div>
                        <div className="text-text-hi text-sm font-mono font-bold">{actionCost?.description || item.action}</div>
                        <div className="text-xs text-text-low font-mono">{item.count} actions</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-text-hi font-bold font-display">{item.credits}</div>
                      <div className="text-[10px] text-text-low font-mono uppercase tracking-wide">credits</div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted font-mono text-sm">
              No usage yet. Start using Synter to see your activity here.
            </div>
          )}
        </div>

        {/* Recent Transactions */}
        <div className="panel">
          <div className="flex items-center gap-2 mb-4">
            <History className="w-4 h-4 text-text-low" />
            <h2 className="panel-title">Recent Transactions</h2>
          </div>

          {stats?.recentTransactions && stats.recentTransactions.length > 0 ? (
            <div className="space-y-2">
              {stats.recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-3 bg-carbon-800 rounded-tactical border border-stroke-2"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-tactical ${
                        tx.amount > 0 ? 'bg-accent-lime/20 border border-accent-lime/40' : 'bg-accent-red/20 border border-accent-red/40'
                      }`}
                    >
                      {tx.amount > 0 ? (
                        <TrendingUp className="w-4 h-4 text-accent-lime" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-accent-red" />
                      )}
                    </div>
                    <div>
                      <div className="text-text-hi text-sm font-mono font-bold">{tx.description}</div>
                      <div className="text-[10px] text-text-muted font-mono">
                        {new Date(tx.created_at).toLocaleDateString()} at{' '}
                        {new Date(tx.created_at).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                  <div
                    className={`font-bold font-display ${
                      tx.amount > 0 ? 'text-accent-lime' : 'text-accent-red'
                    }`}
                  >
                    {tx.amount > 0 ? '+' : ''}
                    {tx.amount}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-text-muted font-mono text-sm">No transactions yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
