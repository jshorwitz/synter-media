'use client';

export function DemoSection() {
  return (
    <section id="demo" className="py-16 lg:py-24 bg-slate-950">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-2xl lg:text-3xl font-semibold text-slate-100">
            How Synter Works
          </h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto text-lg">
            AI-powered advertising that optimizes your campaigns across Google, LinkedIn, Microsoft, and Reddit.
          </p>
        </div>

        {/* Demo highlights */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-900 rounded-2xl ring-1 ring-slate-800 hover:ring-lime-500/50 transition-all">
            <div className="w-14 h-14 bg-lime-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-slate-100 font-semibold text-lg mb-2">AI Analysis</h3>
            <p className="text-slate-400">Analyzes your website and automatically creates targeted personas and campaign strategies.</p>
          </div>
          
          <div className="p-6 bg-slate-900 rounded-2xl ring-1 ring-slate-800 hover:ring-lime-500/50 transition-all">
            <div className="w-14 h-14 bg-lime-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-slate-100 font-semibold text-lg mb-2">Multi-Platform Launch</h3>
            <p className="text-slate-400">Deploy campaigns simultaneously across Google Ads, LinkedIn Ads, Microsoft Ads, and Reddit Ads.</p>
          </div>
          
          <div className="p-6 bg-slate-900 rounded-2xl ring-1 ring-slate-800 hover:ring-lime-500/50 transition-all">
            <div className="w-14 h-14 bg-lime-500/20 rounded-xl flex items-center justify-center mb-4">
              <svg className="w-7 h-7 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-slate-100 font-semibold text-lg mb-2">Real-Time Optimization</h3>
            <p className="text-slate-400">Continuously monitors and optimizes budgets, bids, and performance across all platforms.</p>
          </div>
        </div>

        {/* Additional features */}
        <div className="mt-12 p-8 bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl ring-1 ring-slate-700">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-slate-100 font-medium mb-1">Unified Dashboard</h4>
                <p className="text-slate-400 text-sm">View all campaigns, metrics, and insights in one place</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-slate-100 font-medium mb-1">Smart Budget Allocation</h4>
                <p className="text-slate-400 text-sm">AI automatically distributes budget to top-performing channels</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-slate-100 font-medium mb-1">Cross-Platform Attribution</h4>
                <p className="text-slate-400 text-sm">Track customer journey across all advertising channels</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-lime-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg className="w-3 h-3 text-slate-900" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h4 className="text-slate-100 font-medium mb-1">Automated Reporting</h4>
                <p className="text-slate-400 text-sm">Get insights and recommendations delivered to your inbox</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
