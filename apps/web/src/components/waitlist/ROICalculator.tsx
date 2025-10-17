'use client';

import { useState, useEffect } from 'react';

export function ROICalculator() {
  const [monthlySpend, setMonthlySpend] = useState(50000);
  const [annualSpend, setAnnualSpend] = useState(monthlySpend * 12);
  const [agencySavings, setAgencySavings] = useState(0);
  const [performanceGain, setPerformanceGain] = useState(0);
  const [totalSavings, setTotalSavings] = useState(0);

  useEffect(() => {
    // Calculate savings from eliminating 10% agency fees
    const savings = annualSpend * 0.10;
    
    // Calculate performance improvement (2x ROAS improvement)
    // If they're spending X and getting Y back, 2x improvement means Y becomes 2Y
    // Assuming baseline ROAS of 3x, improvement to 6x means additional 3x revenue
    const additionalRevenue = annualSpend * 3;
    
    setAgencySavings(savings);
    setPerformanceGain(additionalRevenue);
    setTotalSavings(savings + additionalRevenue);
  }, [annualSpend]);

  const handleMonthlyChange = (value: number) => {
    setMonthlySpend(value);
    setAnnualSpend(value * 12);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="panel p-8 max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h3 className="font-display text-2xl font-bold text-text-hi mb-2">
          Calculate Your ROI
        </h3>
        <p className="text-text-mid">
          See how much you could save by eliminating agency fees and improving performance with AI
        </p>
      </div>

      {/* Slider Input */}
      <div className="mb-8">
        <label className="block text-sm font-mono uppercase tracking-wider text-text-low mb-4">
          Monthly Ad Spend
        </label>
        <input
          type="range"
          min="5000"
          max="500000"
          step="5000"
          value={monthlySpend}
          onChange={(e) => handleMonthlyChange(Number(e.target.value))}
          className="w-full h-2 bg-carbon-800 rounded-lg appearance-none cursor-pointer accent-accent-cyan"
          style={{
            background: `linear-gradient(to right, rgb(77, 214, 255) 0%, rgb(77, 214, 255) ${((monthlySpend - 5000) / (500000 - 5000)) * 100}%, rgb(19, 25, 34) ${((monthlySpend - 5000) / (500000 - 5000)) * 100}%, rgb(19, 25, 34) 100%)`
          }}
        />
        <div className="flex justify-between text-xs text-text-muted mt-2">
          <span>$5K</span>
          <span className="text-2xl font-display font-bold text-accent-cyan">
            {formatCurrency(monthlySpend)}/mo
          </span>
          <span>$500K</span>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="panel bg-carbon-850/50 p-6 text-center border-accent-amber/30">
          <div className="text-xs font-mono uppercase tracking-wider text-text-low mb-2">
            Annual Spend
          </div>
          <div className="text-3xl font-display font-bold text-text-hi mb-1">
            {formatCurrency(annualSpend)}
          </div>
          <div className="text-xs text-text-muted">
            12 months
          </div>
        </div>

        <div className="panel bg-carbon-850/50 p-6 text-center border-accent-cyan/30">
          <div className="text-xs font-mono uppercase tracking-wider text-text-low mb-2">
            Agency Fee Savings
          </div>
          <div className="text-3xl font-display font-bold text-accent-cyan mb-1">
            {formatCurrency(agencySavings)}
          </div>
          <div className="text-xs text-text-muted">
            No 10% agency cut
          </div>
        </div>

        <div className="panel bg-carbon-850/50 p-6 text-center border-accent-lime/30">
          <div className="text-xs font-mono uppercase tracking-wider text-text-low mb-2">
            Performance Gain
          </div>
          <div className="text-3xl font-display font-bold text-accent-lime mb-1">
            {formatCurrency(performanceGain)}
          </div>
          <div className="text-xs text-text-muted">
            2x ROAS improvement
          </div>
        </div>
      </div>

      {/* Total Savings */}
      <div className="panel bg-gradient-to-br from-accent-red/10 to-accent-cyan/10 p-8 text-center border-accent-cyan/50">
        <div className="text-sm font-mono uppercase tracking-wider text-text-mid mb-2">
          Total Annual Value
        </div>
        <div className="text-5xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-accent-lime via-accent-cyan to-accent-amber mb-2">
          {formatCurrency(totalSavings)}
        </div>
        <p className="text-sm text-text-mid">
          Savings + additional revenue from AI-powered optimization
        </p>
      </div>

      {/* Breakdown */}
      <div className="mt-6 pt-6 border-t border-stroke-1">
        <p className="text-xs text-text-muted text-center">
          <strong className="text-text-hi">Calculation:</strong> {formatCurrency(agencySavings)} saved from eliminating 10% agency fees + {formatCurrency(performanceGain)} additional revenue from 2x ROAS improvement (baseline 3x → 6x)
        </p>
      </div>
    </div>
  );
}
