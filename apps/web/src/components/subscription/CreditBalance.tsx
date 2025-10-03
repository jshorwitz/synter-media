'use client';

import { Coins, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';

type CreditBalanceProps = {
  inline?: boolean;
};

export default function CreditBalance({ inline = false }: CreditBalanceProps) {
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBalance();
  }, []);

  const loadBalance = async () => {
    try {
      // Fetch user's credit balance
      const response = await fetch('/api/credits/balance');
      const data = await response.json();
      setBalance(data.balance || 0);
    } catch (error) {
      console.error('Failed to load credit balance:', error);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={inline ? 'text-slate-400 text-sm' : 'flex items-center gap-2'}>
        <Coins className="w-4 h-4 animate-pulse" />
        <span>...</span>
      </div>
    );
  }

  const isLow = balance !== null && balance < 10;

  if (inline) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <Coins className={`w-4 h-4 ${isLow ? 'text-yellow-500' : 'text-blue-400'}`} />
        <span className={isLow ? 'text-yellow-500 font-semibold' : 'text-white'}>
          {balance} credits
        </span>
        <Link
          href="/credits"
          className="text-blue-400 hover:text-blue-300 text-xs underline"
        >
          Buy more
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${isLow ? 'bg-yellow-500/20' : 'bg-blue-500/20'}`}>
          <Coins className={`w-5 h-5 ${isLow ? 'text-yellow-500' : 'text-blue-400'}`} />
        </div>
        <div>
          <div className="text-sm text-slate-400">Credit Balance</div>
          <div className={`text-2xl font-bold ${isLow ? 'text-yellow-500' : 'text-white'}`}>
            {balance}
          </div>
          {isLow && (
            <div className="text-xs text-yellow-500">Running low on credits</div>
          )}
        </div>
      </div>
      <Link
        href="/credits"
        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm font-medium transition-all"
      >
        <Plus className="w-4 h-4" />
        Buy Credits
      </Link>
    </div>
  );
}
