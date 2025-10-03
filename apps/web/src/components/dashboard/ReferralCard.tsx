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
      <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 animate-pulse">
        <div className="h-5 bg-slate-700 rounded w-1/3"></div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-orange-500/10 to-red-500/10 border border-orange-500/30 rounded-xl p-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-orange-500/20 p-2 rounded-lg">
            <Gift className="w-5 h-5 text-orange-400" />
          </div>
          <div>
            <h3 className="font-semibold text-white flex items-center gap-2">
              Refer & Earn 50 Credits
            </h3>
            <p className="text-slate-300 text-sm">
              Your friend gets 50 credits too • {stats.referred} referrals • {stats.earned} credits earned
            </p>
          </div>
        </div>
        
        <button
          onClick={handleCopy}
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied!' : 'Copy Link'}
        </button>
      </div>
    </div>
  );
}
