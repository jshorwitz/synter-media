export function SocialProofSection() {
  const logos = [
    { name: 'Google', logo: 'Google' },
    { name: 'Reddit', logo: 'R' },
    { name: 'X', logo: 'X' },
    { name: 'LinkedIn', logo: 'in' }
  ];

  return (
    <section className="py-12 bg-slate-950">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        <div className="text-center mb-8">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-400">
            Integrated with leading platforms
          </p>
        </div>

        <div className="flex flex-wrap justify-center items-center gap-8 lg:gap-12">
          {logos.map((brand, index) => (
            <div 
              key={index} 
              className="px-6 py-4 bg-slate-800/50 rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 transition-all duration-300"
            >
              <span className="text-slate-300 font-bold text-lg whitespace-nowrap">
                {brand.logo}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
