'use client';

import { Check } from 'lucide-react';
import { useState } from 'react';
import { PLANS, Plan, PlanTier } from '@/lib/subscription/plans';

export default function PricingPage() {
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const handleUpgrade = async (planId: PlanTier) => {
    if (planId === 'free') return;

    setLoading(planId);

    try {
      // Get current user ID (you'll need to implement this)
      const userId = await getCurrentUserId();

      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          planId,
          billingPeriod,
        }),
      });

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('No checkout URL returned');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Failed to start checkout. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const plans = Object.values(PLANS) as Plan[];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white py-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Choose Your Plan
          </h1>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Scale your advertising with the right plan for your business
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <button
            onClick={() => setBillingPeriod('monthly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              billingPeriod === 'monthly'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Monthly
          </button>
          <button
            onClick={() => setBillingPeriod('yearly')}
            className={`px-4 py-2 rounded-lg transition-colors ${
              billingPeriod === 'yearly'
                ? 'bg-blue-500 text-white'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Yearly{' '}
            <span className="text-green-400 text-sm ml-1">(Save ~20%)</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const price =
              billingPeriod === 'yearly'
                ? Math.floor(plan.yearlyPrice / 12)
                : plan.price;

            return (
              <div
                key={plan.id}
                className={`relative bg-slate-900/50 border ${
                  plan.popular
                    ? 'border-blue-500 ring-2 ring-blue-500/20'
                    : 'border-slate-700'
                } rounded-xl p-6 flex flex-col`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-slate-400">/month</span>
                  </div>
                  {billingPeriod === 'yearly' && plan.price > 0 && (
                    <p className="text-sm text-green-400 mt-1">
                      ${plan.yearlyPrice}/year
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={plan.id === 'free' || loading === plan.id}
                  className={`w-full py-3 rounded-lg font-medium mb-6 transition-all ${
                    plan.popular
                      ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white'
                      : plan.id === 'free'
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-slate-800 hover:bg-slate-700 text-white'
                  } ${loading === plan.id ? 'opacity-50' : ''}`}
                >
                  {loading === plan.id
                    ? 'Loading...'
                    : plan.id === 'free'
                    ? 'Current Plan'
                    : 'Upgrade Now'}
                </button>

                <div className="space-y-3 text-sm flex-1">
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {plan.features.maxCampaigns === -1
                        ? 'Unlimited'
                        : plan.features.maxCampaigns}{' '}
                      campaigns
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {plan.features.maxPlatforms === -1
                        ? 'All'
                        : plan.features.maxPlatforms}{' '}
                      platforms
                    </span>
                  </div>
                  <div className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    <span>
                      {plan.features.maxChatQueries === -1
                        ? 'Unlimited'
                        : plan.features.maxChatQueries}{' '}
                      chat queries/mo
                    </span>
                  </div>
                  {plan.features.budgetOptimization && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Budget optimization</span>
                    </div>
                  )}
                  {plan.features.multiTouchAttribution && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Multi-touch attribution</span>
                    </div>
                  )}
                  {plan.features.customReporting && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Custom reporting</span>
                    </div>
                  )}
                  {plan.features.apiAccess && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>API access</span>
                    </div>
                  )}
                  {plan.features.dedicatedSupport && (
                    <div className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                      <span>Dedicated support</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Placeholder - implement based on your auth system
async function getCurrentUserId(): Promise<number> {
  // This should fetch from your auth context or session
  return 1; // Placeholder
}
