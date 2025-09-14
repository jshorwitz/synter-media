export function StatsSection() {
  const stats = [
    { value: '847', label: 'Campaigns Optimized' },
    { value: '34%', label: 'Avg. ROAS Improvement' },
    { value: '12', label: 'Minutes to Deploy' },
    { value: '99.9%', label: 'Uptime' }
  ];

  return (
    <section className="py-16 lg:py-24 bg-slate-900/50">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-2xl lg:text-3xl font-semibold text-slate-100">
            Trusted by marketing teams
          </h2>
          <p className="mt-3 text-slate-300 max-w-2xl mx-auto">
            Join hundreds of companies using AI to optimize their advertising spend.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-3xl lg:text-4xl font-bold text-lime-400 mb-2">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 uppercase tracking-wider">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
