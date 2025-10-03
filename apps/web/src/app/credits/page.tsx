'use client';

import { Check, Zap, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { CREDIT_PACKAGES, CREDIT_COSTS, getTotalCredits } from '@/lib/subscription/credits';
import CreditBalance from '@/components/subscription/CreditBalance';

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);

    try {
      const userId = await getCurrentUserId();

      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, packageId }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Purchase error:', error);
      alert('Failed to start purchase. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Pay As You Grow
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-8">
            Only pay for what you use. Start with 50 free credits, then buy more as needed.
          </p>
          
          {/* Current Balance */}
          <div className="max-w-md mx-auto">
            <CreditBalance />
          </div>
        </div>

        {/* Credit Packages */}
        <div className="mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Buy Credits</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
            {CREDIT_PACKAGES.map((pkg) => {
              const totalCredits = getTotalCredits(pkg);
              const pricePerCredit = (pkg.price / totalCredits).toFixed(2);

              return (
                <div
                  key={pkg.id}
                  className={`relative bg-slate-900/50 border ${
                    pkg.popular
                      ? 'border-blue-500 ring-2 ring-blue-500/20'
                      : 'border-slate-700'
                  } rounded-xl p-6 flex flex-col`}
                >
                  {pkg.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Best Value
                    </div>
                  )}

                  <div className="mb-4">
                    <div className="text-4xl font-bold mb-1">{pkg.credits}</div>
                    {pkg.bonus > 0 && (
                      <div className="text-green-400 text-sm font-medium mb-2">
                        + {pkg.bonus} bonus credits
                      </div>
                    )}
                    <div className="text-slate-400 text-sm">
                      ${pricePerCredit} per credit
                    </div>
                  </div>

                  <div className="mb-6">
                    <div className="text-2xl font-bold">${pkg.price}</div>
                    <div className="text-sm text-slate-400">one-time</div>
                  </div>

                  <button
                    onClick={() => handlePurchase(pkg.id)}
                    disabled={loading === pkg.id}
                    className={`w-full py-3 rounded-lg font-medium transition-all ${
                      pkg.popular
                        ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                        : 'bg-slate-800 hover:bg-slate-700 text-white'
                    } ${loading === pkg.id ? 'opacity-50' : ''}`}
                  >
                    {loading === pkg.id ? 'Loading...' : 'Buy Now'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* What Credits Buy */}
        <div>
          <h2 className="text-2xl font-bold mb-6 text-center">What You Can Do</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {Object.values(CREDIT_COSTS).map((item) => (
              <div
                key={item.action}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-start gap-3"
              >
                <div className="bg-blue-500/20 p-2 rounded-lg flex-shrink-0">
                  {item.action === 'campaign_launch' ? (
                    <TrendingUp className="w-4 h-4 text-blue-400" />
                  ) : (
                    <Zap className="w-4 h-4 text-blue-400" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-white text-sm">
                      {item.description}
                    </span>
                    <span className="text-blue-400 font-semibold text-sm">
                      {item.cost === 0 ? 'Free' : `${item.cost} ${item.cost === 1 ? 'credit' : 'credits'}`}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="mt-16 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">How It Works</h2>
          <div className="space-y-4">
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                New users get 50 free credits
              </h3>
              <p className="text-slate-400 text-sm">
                Start experimenting immediately with your welcome bonus. No credit card required.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                Credits never expire
              </h3>
              <p className="text-slate-400 text-sm">
                Buy credits at your own pace. They stay in your account until you use them.
              </p>
            </div>
            <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-6">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Check className="w-5 h-5 text-green-400" />
                Get bonus credits on larger purchases
              </h3>
              <p className="text-slate-400 text-sm">
                Save up to 20% by buying credits in bulk. The more you buy, the more you save.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function getCurrentUserId(): Promise<number> {
  return 1; // Placeholder
}
