'use client';

import { useState, useEffect } from 'react';
import { Users, Copy, Check, Gift } from 'lucide-react';

export default function ReferralCard() {
  const [referralCode, setReferralCode] = useState<string>('');
  const [stats, setStats] = useState({ referred: 0, earned: 0 });
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = async () => {
    try {
      const response = await fetch('/api/referral/stats');
      const data = await response.json();
      setReferralCode(data.code || '');
      setStats({ referred: data.referred || 0, earned: data.earned || 0 });
    } catch (error) {
      console.error('Failed to load referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    const url = `${window.location.origin}/signup?ref=${referralCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 animate-pulse">
        <div className="h-6 bg-slate-700 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-slate-700 rounded w-3/4"></div>
      </div>
    );
  }

  const referralUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/signup?ref=${referralCode}`;

  return (
    <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl p-6 relative overflow-hidden">
      {/* Glow effect */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
      
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-xl font-bold text-white mb-1 flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-400" />
            Refer & Earn
          </h3>
          <p className="text-slate-300 text-sm">
            Give 50 credits, get 50 credits when they sign up
          </p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-purple-400">{stats.earned}</div>
          <div className="text-xs text-slate-400">credits earned</div>
        </div>
      </div>

      {/* Referral Link */}
      <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 mb-4">
        <label className="text-xs text-slate-400 mb-2 block">Your Referral Link</label>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={referralUrl}
            readOnly
            className="flex-1 bg-slate-800 text-white text-sm px-3 py-2 rounded border border-slate-600 focus:outline-none"
          />
          <button
            onClick={handleCopy}
            className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded transition-colors flex items-center gap-2"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2 text-slate-300">
          <Users className="w-4 h-4 text-purple-400" />
          <span>{stats.referred} referrals</span>
        </div>
      </div>
    </div>
  );
}
