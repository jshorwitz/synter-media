'use client';

import { X, Zap, ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { PlanTier } from '@/lib/subscription/plans';

type UpgradePromptProps = {
  feature: string;
  currentTier: PlanTier;
  limit: number;
  current: number;
  onClose?: () => void;
  inline?: boolean;
};

export default function UpgradePrompt({
  feature,
  currentTier,
  limit,
  current,
  onClose,
  inline = false,
}: UpgradePromptProps) {
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onClose?.();
  };

  if (dismissed) return null;

  const PromptContent = (
    <div
      className={`${
        inline
          ? 'border border-yellow-500/30 bg-yellow-500/10 rounded-lg p-4'
          : 'fixed bottom-6 right-6 max-w-md bg-slate-900 border border-yellow-500/50 rounded-lg shadow-2xl p-6 z-50'
      }`}
    >
      {!inline && (
        <button
          onClick={handleDismiss}
          className="absolute top-3 right-3 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      <div className="flex items-start gap-3">
        <div className="bg-yellow-500/20 p-2 rounded-lg">
          <Zap className="w-5 h-5 text-yellow-500" />
        </div>
        <div className="flex-1">
          <h3 className="text-white font-semibold mb-1">Upgrade to Continue</h3>
          <p className="text-slate-300 text-sm mb-3">
            You've used {current} of {limit} {feature} on the{' '}
            <span className="font-medium capitalize">{currentTier}</span> plan.
          </p>
          <Link
            href="/pricing"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
          >
            View Plans
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );

  return PromptContent;
}

// Hard block version - prevents action entirely
export function UpgradeBlock({
  feature,
  currentTier,
  limit,
}: {
  feature: string;
  currentTier: PlanTier;
  limit: number;
}) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="max-w-md text-center">
        <div className="bg-yellow-500/20 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Zap className="w-8 h-8 text-yellow-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          {currentTier === 'free' ? 'Upgrade to Continue' : 'Plan Limit Reached'}
        </h2>
        <p className="text-slate-300 mb-6">
          You've reached your {feature} limit ({limit}) on the{' '}
          <span className="font-medium capitalize">{currentTier}</span> plan.
          Upgrade to unlock more capacity.
        </p>
        <Link
          href="/pricing"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-all"
        >
          View Pricing
          <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );
}
