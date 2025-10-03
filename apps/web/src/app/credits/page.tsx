'use client';

import { Zap, Check } from 'lucide-react';
import { useState } from 'react';
import { CREDIT_PACKAGES, getTotalCredits } from '@/lib/subscription/credits';
import CreditBalance from '@/components/subscription/CreditBalance';

export default function CreditsPage() {
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (packageId: string) => {
    setLoading(packageId);

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
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      alert(error.message || 'Failed to start purchase. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  // Top 3 packages for clean display
  const topPackages = CREDIT_PACKAGES.filter(p => ['starter', 'growth', 'scale'].includes(p.id));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-20 px-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4">Buy Credits</h1>
          <p className="text-slate-400 text-xl mb-8">
            Simple pricing. No subscriptions. Credits never expire.
          </p>
          
          <div className="max-w-md mx-auto mb-6">
            <CreditBalance />
          </div>

          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 rounded-full px-4 py-2 text-sm text-blue-400">
            <Zap className="w-4 h-4" />
            100 free credits on signup • 0.5 credits per AI chat • 10 credits per campaign
          </div>
        </div>

        {/* Packages */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          {topPackages.map((pkg) => {
            const totalCredits = getTotalCredits(pkg);

            return (
              <div
                key={pkg.id}
                className={`relative bg-slate-900/50 border ${
                  pkg.popular
                    ? 'border-blue-500 ring-2 ring-blue-500/20 scale-105'
                    : 'border-slate-700'
                } rounded-xl p-8 flex flex-col transition-transform hover:scale-105`}
              >
                {pkg.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-xs font-semibold px-4 py-1.5 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className="text-6xl font-bold mb-2">${pkg.price}</div>
                  <div className="text-3xl font-bold text-blue-400 mb-1">{totalCredits}</div>
                  <div className="text-sm text-slate-400">
                    credits {pkg.bonus > 0 && <span className="text-green-400">(+{pkg.bonus} bonus)</span>}
                  </div>
                </div>

                <button
                  onClick={() => handlePurchase(pkg.id)}
                  disabled={loading === pkg.id}
                  className={`w-full py-4 rounded-lg font-semibold text-lg transition-all ${
                    pkg.popular
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg shadow-blue-500/50'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  } ${loading === pkg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {loading === pkg.id ? 'Processing...' : 'Buy Now'}
                </button>
              </div>
            );
          })}
        </div>

        {/* Value Props */}
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="bg-green-500/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-7 h-7 text-green-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Never Expire</h3>
            <p className="text-slate-400">Credits stay in your account until you use them</p>
          </div>
          <div>
            <div className="bg-blue-500/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <Zap className="w-7 h-7 text-blue-400" />
            </div>
            <h3 className="font-bold text-lg mb-2">Instant Access</h3>
            <p className="text-slate-400">Credits added to your account immediately after payment</p>
          </div>
          <div>
            <div className="bg-purple-500/20 w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">🎁</span>
            </div>
            <h3 className="font-bold text-lg mb-2">Bonus Credits</h3>
            <p className="text-slate-400">Get up to 20% bonus credits on larger packages</p>
          </div>
        </div>
      </div>
    </div>
  );
}
