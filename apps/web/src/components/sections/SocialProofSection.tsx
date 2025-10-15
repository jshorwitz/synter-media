export function SocialProofSection() {
  const logos = [
    { name: 'Google', logo: 'Google', available: true },
    { name: 'Meta', logo: 'Meta', available: false },
    { name: 'Reddit', logo: 'Reddit', available: true },
    { name: 'X', logo: 'X', available: false },
    { name: 'LinkedIn', logo: 'LinkedIn', available: false },
    { name: 'Microsoft', logo: 'Microsoft', available: true }
  ];

  return (
    <section className="py-12 bg-carbon-900">
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
              className="relative"
            >
              <div className={`px-6 py-4 bg-slate-800/50 rounded-xl flex items-center justify-center transition-all duration-300 ${brand.available ? 'opacity-60 hover:opacity-100' : 'opacity-30'}`}>
                <span className="text-slate-300 font-bold text-lg whitespace-nowrap">
                  {brand.logo}
                </span>
              </div>
              {!brand.available && (
                <div className="absolute -top-2 -right-2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Soon
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
