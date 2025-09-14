export function ValuePropsSection() {
  const valueProps = [
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
        </svg>
      ),
      title: "Multi-Channel Orchestration",
      description: "Automatically manage campaigns across Google, Meta, Reddit, X, and more platforms simultaneously."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
        </svg>
      ),
      title: "Real-Time Optimization",
      description: "AI agents continuously analyze performance and adjust budgets, bids, and targeting."
    },
    {
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
        </svg>
      ),
      title: "Clear Insights",
      description: "Deep insights with predictive analytics to maximize ROAS and minimize CAC."
    }
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-950">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl lg:text-3xl font-semibold text-slate-100">
            Why choose Synter?
          </h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            Built for modern marketing teams who need results, not complexity.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {valueProps.map((prop, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-lime-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <div className="text-lime-400">
                  {prop.icon}
                </div>
              </div>
              <h3 className="text-xl font-semibold text-slate-100 mb-3">
                {prop.title}
              </h3>
              <p className="text-slate-300 leading-relaxed">
                {prop.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
