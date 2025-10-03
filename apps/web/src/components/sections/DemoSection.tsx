'use client';

export function DemoSection() {
  return (
    <section id="demo" className="py-16 lg:py-24 bg-carbon-900">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-bold font-display text-text-hi">
            How Synter Works
          </h2>
          <p className="mt-3 text-text-mid max-w-2xl mx-auto text-lg font-mono">
            AI-powered advertising that optimizes your campaigns across Google, LinkedIn, Microsoft, and Reddit.
          </p>
        </div>

        {/* Demo highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="panel hover:border-accent-lime/50 transition-all">
            <div className="w-14 h-14 bg-accent-lime/20 rounded-tactical flex items-center justify-center mb-4 border border-accent-lime/40">
              <svg className="w-7 h-7 text-accent-lime" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-text-hi font-bold font-mono text-lg mb-2 uppercase tracking-wide">AI Analysis</h3>
            <p className="text-text-mid font-mono text-sm">Analyzes your website and automatically creates targeted personas and campaign strategies.</p>
          </div>
          
          <div className="panel hover:border-accent-cyan/50 transition-all">
            <div className="w-14 h-14 bg-accent-cyan/20 rounded-tactical flex items-center justify-center mb-4 border border-accent-cyan/40">
              <svg className="w-7 h-7 text-accent-cyan" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-text-hi font-bold font-mono text-lg mb-2 uppercase tracking-wide">Multi-Platform Launch</h3>
            <p className="text-text-mid font-mono text-sm">Deploy campaigns simultaneously across Google Ads, LinkedIn Ads, Microsoft Ads, and Reddit Ads.</p>
          </div>
          
          <div className="panel hover:border-accent-amber/50 transition-all">
            <div className="w-14 h-14 bg-accent-amber/20 rounded-tactical flex items-center justify-center mb-4 border border-accent-amber/40">
              <svg className="w-7 h-7 text-accent-amber" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-text-hi font-bold font-mono text-lg mb-2 uppercase tracking-wide">Real-Time Optimization</h3>
            <p className="text-text-mid font-mono text-sm">Continuously monitors and optimizes budgets, bids, and performance across all platforms.</p>
          </div>
        </div>

        {/* Additional features */}
        <div className="mt-12 panel bg-carbon-850">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-lime flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-carbon-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-text-hi font-bold font-mono mb-1 text-sm">UNIFIED DASHBOARD</h4>
                <p className="text-text-mid font-mono text-xs">View all campaigns, metrics, and insights in one place</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-lime flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-carbon-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-text-hi font-bold font-mono mb-1 text-sm">SMART BUDGET ALLOCATION</h4>
                <p className="text-text-mid font-mono text-xs">AI automatically distributes budget to top-performing channels</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-lime flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-carbon-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-text-hi font-bold font-mono mb-1 text-sm">CROSS-PLATFORM ATTRIBUTION</h4>
                <p className="text-text-mid font-mono text-xs">Track customer journey across all advertising channels</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-accent-lime flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-carbon-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-text-hi font-bold font-mono mb-1 text-sm">AUTOMATED REPORTING</h4>
                <p className="text-text-mid font-mono text-xs">Get insights and recommendations delivered to your inbox</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
